import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import generateToken from '../utils/generateToken.js';
import { users_role } from '@prisma/client';
import {
  workos,
  workosClientId,
  defaultRedirectUri,
  isWorkOSConfigured,
} from '../lib/workos.js';

/**
 * Reads initial admin emails from environment
 */
const getInitialAdminEmails = (): string[] => {
  const raw = process.env.INITIAL_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
};

// ── GET /api/auth/workos/url ───────────────────────────────────────────────
// Generates the hosted WorkOS AuthKit authorization URL for sign-in / sign-up.
export const getWorkOSAuthorizationUrl = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    if (!isWorkOSConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'WorkOS is not configured. Please set WORKOS_API_KEY and WORKOS_CLIENT_ID.',
      });
    }

    const requestedRedirect = (req.query.redirectUri as string) || defaultRedirectUri;

    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId: workosClientId,
      redirectUri: requestedRedirect,
    });

    return res.status(200).json({
      success: true,
      url: authorizationUrl,
    });
  } catch (error) {
    console.error('Error generating WorkOS authorization URL:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate authorization URL';
    return res.status(500).json({ success: false, message });
  }
};

// ── POST /api/auth/workos/callback ─────────────────────────────────────────
// Exchanges authorization code for WorkOS user profile, links or provisions
// internal database account, and issues application JWT.
export const handleWorkOSCallback = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required.',
      });
    }

    if (!isWorkOSConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'WorkOS is not configured on the server.',
      });
    }

    // 1. Authenticate with WorkOS using the code
    const authResponse = await workos.userManagement.authenticateWithCode({
      clientId: workosClientId,
      code,
    });

    const workosUser = authResponse.user;
    if (!workosUser || !workosUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Unable to retrieve user email from WorkOS.',
      });
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
        // Link existing user account to WorkOS
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

      const initialAdmins = getInitialAdminEmails();
      const assignedRole = initialAdmins.includes(email)
        ? users_role.admin
        : users_role.customer;

      dbUser = await prisma.users.create({
        data: {
          workos_user_id: workosUser.id,
          email,
          full_name: fullName,
          role: assignedRole,
          password: null, // OAuth authenticated user has no local password hash
        },
      });
    }

    // 5. Generate internal signed application JWT
    const token = generateToken(
      dbUser.id,
      dbUser.role || users_role.customer,
      dbUser.email
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      user: {
        id: dbUser.id,
        full_name: dbUser.full_name,
        email: dbUser.email,
        role: dbUser.role,
      },
      token,
    });
  } catch (error) {
    console.error('WorkOS callback exchange error:', error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return res.status(500).json({ success: false, message });
  }
};
