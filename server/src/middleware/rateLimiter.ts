import { createMiddleware } from 'hono/factory';
import type { AppContext } from '../types/context.js';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(max: number, windowMs: number) {
  return createMiddleware<AppContext>(async (c, next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || 'global';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    } else {
      entry.count += 1;
      if (entry.count > max) {
        return c.json(
          {
            success: false,
            message: 'Too many requests from this device. Please slow down and try again shortly.',
          },
          429
        );
      }
    }
    await next();
  });
}

export const globalLimiter = rateLimit(300, 15 * 60 * 1000);
export const authLimiter = rateLimit(10, 15 * 60 * 1000);
export const creationLimiter = rateLimit(25, 15 * 60 * 1000);
