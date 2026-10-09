import { createMiddleware } from 'hono/factory';
import type { AppContext } from '../types/context.js';
import { verifyToken } from '../utils/generateToken.js';

export interface AuthUser {
  id: number;
  role: string;
  email: string;
}

export const protect = createMiddleware<AppContext>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'ያልተፈቀደ መዳረሻ፣ ቶከን አልተገኘም' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verifyToken(token, c.env?.JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return c.json({ message: 'ያልተፈቀደ መዳረሻ፣ ቶከን ልክ አይደለም' }, 401);
  }
});

export const authorizeRoles = (...roles: string[]) => {
  const normalized = roles.map((r) => r.toLowerCase());
  return createMiddleware<AppContext>(async (c, next) => {
    const user = c.get('user');
    const userRole = user?.role?.toLowerCase();
    if (!user || !userRole || !normalized.includes(userRole)) {
      return c.json({ message: 'Forbidden: Insufficient permissions.' }, 403);
    }
    await next();
  });
};
