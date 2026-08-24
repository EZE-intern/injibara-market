import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {id: number; role?: string };

      // Attach the decoded payload (id, role, email) to the request object
      req.user = {
        id: decoded.id,
        role: decoded.role,
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
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Check if user exists on the request and if their role is in the allowed roles array
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'ይህንን ተግባር ለማከናወን ፈቃድ የሎትም' }); // Forbidden
      return;
    }
    next();
  };
};
