import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import type { AppContext } from '../src/types/context.js';
import { validate } from '../src/middleware/validate.js';
import { protect, authorizeRoles } from '../src/middleware/authMiddleware.js';
import generateToken from '../src/utils/generateToken.js';
import { z } from 'zod';

describe('Middleware Security & Validation Tests', () => {
  // ─── 1. Validation Middleware ───────────────────────────────────────
  describe('validate(schema) middleware', () => {
    const testSchema = z.object({
      name: z.string().min(3),
      price: z.coerce.number().positive(),
    });

    const app = new Hono<AppContext>();
    app.post('/test-validate', validate('json', testSchema), (c) => {
      return c.json({ success: true, data: c.req.valid('json') });
    });

    it('should allow valid request data through with coerced types', async () => {
      const res = await app.request('/test-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Valid Product', price: '99.99' }),
      });

      const body = (await res.json()) as any;
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.price).toBe(99.99);
    });

    it('should intercept invalid data and return structured 400 error', async () => {
      const res = await app.request('/test-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'ab', price: -10 }), // name too short, price negative
      });

      const body = (await res.json()) as any;
      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 2. Auth & RBAC Middleware ──────────────────────────────────────
  describe('protect and authorizeRoles middleware', () => {
    const app = new Hono<AppContext>();

    // Protected route
    app.get('/test-protected', protect, (c) => {
      return c.json({ success: true, user: c.get('user') });
    });

    // Admin-only route
    app.get('/test-admin-only', protect, authorizeRoles('admin'), (c) => {
      return c.json({ success: true, message: 'Admin access granted' });
    });

    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const res = await app.request('/test-protected');
      const body = (await res.json()) as any;
      expect(res.status).toBe(401);
      expect(body.message).toBeDefined();
    });

    it('should reject invalid or malformed tokens with 401', async () => {
      const res = await app.request('/test-protected', {
        headers: { Authorization: 'Bearer invalid.fake.token' },
      });
      expect(res.status).toBe(401);
    });

    it('should authenticate valid JWT token and attach user to context', async () => {
      const token = await generateToken(100, 'customer', 'cust@example.com');

      const res = await app.request('/test-protected', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = (await res.json()) as any;
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.user.id).toBe(100);
      expect(body.user.role).toBe('customer');
    });

    it('PERMISSION SECURITY: should block customer from accessing admin-only endpoint with 403 Forbidden', async () => {
      const customerToken = await generateToken(101, 'customer', 'customer@example.com');

      const res = await app.request('/test-admin-only', {
        headers: { Authorization: `Bearer ${customerToken}` },
      });

      const body = (await res.json()) as any;
      expect(res.status).toBe(403);
      expect(body.message).toBeDefined();
    });

    it('should allow admin to access admin-only endpoint', async () => {
      const adminToken = await generateToken(1, 'admin', 'admin@example.com');

      const res = await app.request('/test-admin-only', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const body = (await res.json()) as any;
      expect(res.status).toBe(200);
      expect(body.message).toBe('Admin access granted');
    });
  });
});
