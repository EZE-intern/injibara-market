import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import generateToken, { JWT_SECRET } from '../src/utils/generateToken.js';

describe('Auth Utilities & Token Generation', () => {
  it('should generate a valid signed JWT with id, role, and email', async () => {
    const token = await generateToken(42, 'seller', 'seller@injibaramarket.com');
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

  it('should default role to customer if not specified', async () => {
    const token = await generateToken(10);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role?: string };
    expect(decoded.id).toBe(10);
  });

  describe('edgeCrypto password hashing & backward compatibility', () => {
    it('should hash and verify passwords using PBKDF2', async () => {
      const { hashPassword, verifyPassword } = await import('../src/utils/edgeCrypto.js');
      const plain = 'MySecretP@ssw0rd!';
      const hash = await hashPassword(plain);

      expect(hash.startsWith('pbkdf2:100000:')).toBe(true);
      expect(await verifyPassword(plain, hash)).toBe(true);
      expect(await verifyPassword('WrongPassword', hash)).toBe(false);
    });

    it('should verify legacy bcrypt ($2b$ and $2a$) hashes correctly', async () => {
      const { verifyPassword } = await import('../src/utils/edgeCrypto.js');
      const bcrypt = (await import('bcryptjs')).default;

      const plain = 'SuperAdminLegacyPass123!';
      const bcryptHash = await bcrypt.hash(plain, 10);

      expect(bcryptHash.startsWith('$2a$') || bcryptHash.startsWith('$2b$')).toBe(true);
      expect(await verifyPassword(plain, bcryptHash)).toBe(true);
      expect(await verifyPassword('WrongPassword123', bcryptHash)).toBe(false);
    });

    it('should gracefully handle malformed hashes and inputs without crashing', async () => {
      const { verifyPassword } = await import('../src/utils/edgeCrypto.js');

      expect(await verifyPassword('', '')).toBe(false);
      expect(await verifyPassword('password', 'not-a-valid-hash')).toBe(false);
      expect(await verifyPassword('password', 'pbkdf2:invalid:parts')).toBe(false);
    });
  });
});
