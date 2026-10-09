import type { Context } from 'hono';
import type { AppContext } from '../types/context.js';
import generateToken from '../utils/generateToken.js';
import { users_role } from '@prisma/client';
import { getWorkOS } from '../lib/workos.js';

const getInitialAdminEmails = (envAdminEmails?: string): string[] => {
  const raw = envAdminEmails || (typeof process !== 'undefined' ? process.env?.INITIAL_ADMIN_EMAILS : '') || '';
  return raw
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter((e: string) => e.length > 0);
};

// ── GET /api/auth/workos/url ───────────────────────────────────────────────
export const getWorkOSAuthorizationUrl = async (c: Context<AppContext>) => {
  try {
    const { workos, workosClientId, defaultRedirectUri, isWorkOSConfigured } = getWorkOS(c.env);

    if (!isWorkOSConfigured()) {
      return c.json(
        {
          success: false,
          message: 'WorkOS is not configured. Please set WORKOS_API_KEY and WORKOS_CLIENT_ID.',
        },
        500
      );
    }

    const requestedRedirect = c.req.query('redirectUri') || defaultRedirectUri;

    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId: workosClientId,
      redirectUri: requestedRedirect,
    });

    return c.json(
      {
        success: true,
        url: authorizationUrl,
      },
      200
    );
  } catch (error) {
    console.error('Error generating WorkOS authorization URL:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate authorization URL';
    return c.json({ success: false, message }, 500);
  }
};

// ── POST /api/auth/workos/callback ─────────────────────────────────────────
export const handleWorkOSCallback = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const { code } = await c.req.json();

    if (!code || typeof code !== 'string') {
      return c.json(
        {
          success: false,
          message: 'Authorization code is required.',
        },
        400
      );
    }

    const { workos, workosClientId, isWorkOSConfigured } = getWorkOS(c.env);

    if (!isWorkOSConfigured()) {
      return c.json(
        {
          success: false,
          message: 'WorkOS is not configured on the server.',
        },
        500
      );
    }

    // 1. Authenticate with WorkOS using the code
    const authResponse = await workos.userManagement.authenticateWithCode({
      clientId: workosClientId,
      code,
    });

    const workosUser = authResponse.user;
    if (!workosUser || !workosUser.email) {
      return c.json(
        {
          success: false,
          message: 'Unable to retrieve user email from WorkOS.',
        },
        400
      );
    }

    const email = workosUser.email.toLowerCase().trim();

    // 2. Check if user is already linked by workos_user_id
    let dbUser = await prisma.users.findUnique({
      where: { workos_user_id: workosUser.id },
    });

    // 3. If not linked, check if user exists by email (Seamless Account Linking)
    if (!dbUser) {
      dbUser = await prisma.users.findUnique({
        where: { email },
      });

      if (dbUser) {
        dbUser = await prisma.users.update({
          where: { id: dbUser.id },
          data: { workos_user_id: workosUser.id },
        });
      }
    }

    // 4. If brand new user, provision record in internal users table
    if (!dbUser) {
      const fullName =
        [workosUser.firstName, workosUser.lastName].filter(Boolean).join(' ').trim() ||
        email.split('@')[0];

      const initialAdmins = getInitialAdminEmails(c.env?.INITIAL_ADMIN_EMAILS);
      const assignedRole = initialAdmins.includes(email)
        ? users_role.admin
        : users_role.customer;

      dbUser = await prisma.users.create({
        data: {
          workos_user_id: workosUser.id,
          email,
          full_name: fullName,
          role: assignedRole,
          password: null,
        },
      });
    }

    // 5. Generate internal signed application JWT
    const token = await generateToken(
      dbUser.id,
      dbUser.role || users_role.customer,
      dbUser.email,
      c.env?.JWT_SECRET
    );

    return c.json(
      {
        success: true,
        message: 'Authentication successful.',
        user: {
          id: dbUser.id,
          full_name: dbUser.full_name,
          email: dbUser.email,
          role: dbUser.role,
        },
        token,
      },
      200
    );
  } catch (error) {
    console.error('WorkOS callback exchange error:', error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return c.json({ success: false, message }, 500);
  }
};
