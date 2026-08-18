import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import generateToken from '../utils/generateToken.js';
import { users_role } from '@prisma/client';

// @route   POST /api/auth/register

export const registerUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'እባክዎ ሁሉንም አስፈላጊ መስኮች ይሙሉ' });
    }

    const userExists = await prisma.users.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ message: 'በዚህ ኢሜይል የተመዘገበ ተጠቃሚ አለ' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //  Role ማዘጋጀት (ነባሪው 'customer' ነው)
    const userRole: users_role = role ? (role as users_role) : users_role.customer;

    //  አዲስ ተጠቃሚ በ Prisma መፍጠር
    const newUser = await prisma.users.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: userRole,
      },
    });

    //  Token ማዘጋጀት (id, role, email ያካተተ)
    const token = generateToken(newUser.id, newUser.role || users_role.customer, newUser.email);

    return res.status(201).json({
      message: 'ተጠቃሚው በተሳካ ሁኔታ ተመዝግቧል',
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
    // Properly assert the error type to satisfy TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል', error: errorMessage });
  }
};

// @route   POST /api/auth/login

export const loginUser = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ' });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: 'ተጠቃሚው አልተገኘም ወይም የተሳሳተ መረጃ' });
    }

    // 2. Password ማረጋገጥ
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'የተሳሳተ የይለፍ ቃል' });
    }

    // 3. Token ማዘጋጀት
    const token = generateToken(user.id, user.role || users_role.customer, user.email);

    return res.json({
      message: 'በተሳካ ሁኔታ ገብተዋል',
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
    // Properly assert the error type to satisfy TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል', error: errorMessage });
  }
};
