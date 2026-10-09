import type { Context } from 'hono';
import type { AppContext } from '../types/context.js';
import { hashPassword, verifyPassword } from '../utils/edgeCrypto.js';
import generateToken from '../utils/generateToken.js';
import { users_role } from '@prisma/client';

const getInitialAdminEmails = (envAdminEmails?: string): string[] => {
  const raw = envAdminEmails || (typeof process !== 'undefined' ? process.env?.INITIAL_ADMIN_EMAILS : '') || '';
  return raw
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter((e: string) => e.length > 0);
};

// ─── POST /api/auth/register ─────────────────────────────────────────
export const registerUser = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const { full_name, email, password, phone, role } = await c.req.json();

    // Check if email is already registered
    const userExists = await prisma.users.findUnique({
      where: { email },
    });

    if (userExists) {
      return c.json({ message: 'An account with this email already exists.' }, 400);
    }

    // Check if phone is already registered (if provided)
    if (phone) {
      const phoneExists = await prisma.users.findUnique({
        where: { phone },
      });
      if (phoneExists) {
        return c.json({ message: 'This phone number is already registered.' }, 400);
      }
    }

    // Hash password using native WebCrypto PBKDF2 (<2ms CPU)
    const hashedPassword = await hashPassword(password);

    // Determine role
    const initialAdmins = getInitialAdminEmails(c.env?.INITIAL_ADMIN_EMAILS);
    let assignedRole: users_role;

    if (initialAdmins.includes(email)) {
      assignedRole = users_role.admin;
    } else {
      assignedRole = (role as users_role) || users_role.customer;
    }

    // Create the user
    const newUser = await prisma.users.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: assignedRole,
      },
    });

    // Generate JWT token (async)
    const token = await generateToken(
      newUser.id,
      newUser.role || users_role.customer,
      newUser.email,
      c.env?.JWT_SECRET
    );

    return c.json(
      {
        message: 'Account created successfully.',
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
      201
    );
  } catch (error: unknown) {
    console.error('Error in registerUser:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ message: 'Internal server error.', error: errorMessage }, 500);
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────
export const loginUser = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const { email, password } = await c.req.json();

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return c.json({ message: 'Invalid email or password.' }, 400);
    }

    // Verify password using native WebCrypto PBKDF2
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return c.json({ message: 'Invalid email or password.' }, 400);
    }

    // Generate JWT token
    const token = await generateToken(
      user.id,
      user.role || users_role.customer,
      user.email,
      c.env?.JWT_SECRET
    );

    return c.json(
      {
        message: 'Login successful.',
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      200
    );
  } catch (error: unknown) {
    console.error('Error in loginUser:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ message: 'Internal server error.', error: errorMessage }, 500);
  }
};

// ─── PATCH /api/auth/users/:id/role ──────────────────────────────────
export const updateUserRole = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const currentUser = c.get('user');
    const targetUserId = Number(c.req.param('id'));

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return c.json({ message: 'Invalid user ID.' }, 400);
    }

    const { role } = await c.req.json();

    // Prevent admin from demoting themselves
    if (Number(currentUser?.id) === targetUserId && role !== 'admin') {
      return c.json(
        { message: 'You cannot change your own admin role. Ask another admin to do this.' },
        400
      );
    }

    const targetUser = await prisma.users.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return c.json({ message: 'User not found.' }, 404);
    }

    const updatedUser = await prisma.users.update({
      where: { id: targetUserId },
      data: { role: role as users_role },
    });

    return c.json(
      {
        message: `User role updated to "${role}" successfully.`,
        user: {
          id: updatedUser.id,
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
      200
    );
  } catch (error: unknown) {
    console.error('Error in updateUserRole:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ message: 'Internal server error.', error: errorMessage }, 500);
  }
};
