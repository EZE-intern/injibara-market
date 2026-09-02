import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import generateToken from '../utils/generateToken.js';
import { users_role } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware.js';

/**
 * Reads the INITIAL_ADMIN_EMAILS environment variable.
 * These emails are automatically promoted to admin on registration.
 * Format in .env: INITIAL_ADMIN_EMAILS="email1@x.com,email2@x.com,email3@x.com"
 */
const getInitialAdminEmails = (): string[] => {
  const raw = process.env.INITIAL_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
};

// ─── POST /api/auth/register ─────────────────────────────────────────

export const registerUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // req.body is already validated and sanitized by the validate(registerSchema) middleware:
    // - full_name is trimmed
    // - email is lowercased and trimmed
    // - phone is normalized to 09xxxxxxxx format
    // - role is restricted to 'customer' | 'seller' (never 'admin')
    const { full_name, email, password, phone, role } = req.body;

    // Check if email is already registered
    const userExists = await prisma.users.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Check if phone is already registered (if provided)
    if (phone) {
      const phoneExists = await prisma.users.findUnique({
        where: { phone },
      });
      if (phoneExists) {
        return res.status(400).json({ message: 'This phone number is already registered.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role:
    // 1. If the email is in INITIAL_ADMIN_EMAILS, auto-promote to admin
    // 2. Otherwise, use the validated role (customer or seller — never admin)
    const initialAdmins = getInitialAdminEmails();
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

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.role || users_role.customer, newUser.email);

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Error in registerUser:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'Internal server error.', error: errorMessage });
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────

export const loginUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // req.body is validated by validate(loginSchema)
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role || users_role.customer, user.email);

    return res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Error in loginUser:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'Internal server error.', error: errorMessage });
  }
};

// ─── PATCH /api/auth/users/:id/role ──────────────────────────────────
// Only an existing admin can promote/demote another user's role.
// This is the ONLY way to grant admin access (besides INITIAL_ADMIN_EMAILS).

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const targetUserId = Number(req.params.id);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    // req.body is validated by validate(updateUserRoleSchema)
    const { role } = req.body;

    // Prevent admin from demoting themselves (safety net)
    if (Number(req.user?.id) === targetUserId && role !== 'admin') {
      return res.status(400).json({
        message: 'You cannot change your own admin role. Ask another admin to do this.',
      });
    }

    // Verify the target user exists
    const targetUser = await prisma.users.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the role
    const updatedUser = await prisma.users.update({
      where: { id: targetUserId },
      data: { role: role as users_role },
    });

    return res.status(200).json({
      message: `User role updated to "${role}" successfully.`,
      user: {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: unknown) {
    console.error('Error in updateUserRole:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'Internal server error.', error: errorMessage });
  }
};
