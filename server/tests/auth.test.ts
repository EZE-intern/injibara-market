import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import generateToken, { JWT_SECRET } from '../src/utils/generateToken.js';

describe('Auth Utilities & Token Generation', () => {
  it('should generate a valid signed JWT with id, role, and email', () => {
    const token = generateToken(42, 'seller', 'seller@injibaramarket.com');
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
      email: string;
      iat: number;
      exp: number;
    };

    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe('seller');
    expect(decoded.email).toBe('seller@injibaramarket.com');
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('should default role to customer if not specified', () => {
    const token = generateToken(10);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role?: string };
    expect(decoded.id).toBe(10);
  });
});
