import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/generateToken.js';

// Extend the Express Request interface to include our custom user payload
export interface AuthRequest extends Request {
  user?: {
    id: string | number;
    role: string;
    email: string;
  };
}

// 1. Protect routes (Verify JWT)
export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token;

  // Check if the authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using your secret
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role?: string; email: string };

      // Attach the decoded payload (id, role, email) to the request object
      req.user = {
        id: decoded.id,
        role: decoded.role as string,
        email: decoded.email,
      };

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'ያልተፈቀደ መዳረሻ፣ ቶከን ልክ አይደለም' }); // Unauthorized, invalid token
    }
  } else {
    res.status(401).json({ message: 'ያልተፈቀደ መዳረሻ፣ ቶከን አልተገኘም' }); // Unauthorized, no token
  }
};

// 2. Role Authorization Guard
export const authorizeRoles = (...roles: string[]) => {
  const normalizedRoles = roles.map((r) => r.toLowerCase());
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role?.toLowerCase();
    if (!req.user || !userRole || !normalizedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
      return;
    }
    next();
  };
};
