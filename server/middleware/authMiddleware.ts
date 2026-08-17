import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Explicitly define what is inside the decoded token to avoid 'any'
export interface UserPayload {
  id?: string;
  role?: string;
  email?: string;
}

// 2. Extend the Express Request interface safely
export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'እባክዎ መጀመሪያ Login ያድርጉ (No token provided)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded as UserPayload;
    next();
  } catch { // 3. Completely removed the error binding to satisfy the unused-vars rule
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Export authenticateUser alias for orderRoutes.ts
export const authenticateUser = protect;

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized: No user role found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: You do not have permission' });
    }

    next();
  };
};
