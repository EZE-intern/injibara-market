import { describe, it, expect } from 'vitest';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { validate } from '../src/middleware/validate.js';
import { protect, authorizeRoles, AuthRequest } from '../src/middleware/authMiddleware.js';
import generateToken from '../src/utils/generateToken.js';
import { z } from 'zod';

describe('Middleware Security & Validation Tests', () => {
  // ─── 1. Validation Middleware ───────────────────────────────────────
  describe('validate(schema) middleware', () => {
    const testSchema = z.object({
      name: z.string().min(3),
      price: z.coerce.number().positive(),
    });

    const app = express();
    app.use(express.json());
    app.post('/test-validate', validate(testSchema), (req: Request, res: Response) => {
      res.status(200).json({ success: true, data: req.body });
    });

    it('should allow valid request data through with coerced types', async () => {
      const res = await request(app)
        .post('/test-validate')
        .send({ name: 'Valid Product', price: '99.99' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(99.99);
    });

    it('should intercept invalid data and return structured 400 error', async () => {
      const res = await request(app)
        .post('/test-validate')
        .send({ name: 'ab', price: -10 }); // name too short, price negative

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 2. Auth & RBAC Middleware ──────────────────────────────────────
  describe('protect and authorizeRoles middleware', () => {
    const app = express();
    app.use(express.json());

    // Protected route
    app.get('/test-protected', protect, (req: AuthRequest, res: Response) => {
      res.status(200).json({ success: true, user: req.user });
    });

    // Admin-only route
    app.get(
      '/test-admin-only',
      protect,
      authorizeRoles('admin'),
      (req: AuthRequest, res: Response) => {
        res.status(200).json({ success: true, message: 'Admin access granted' });
      }
    );

    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/test-protected');
      expect(res.status).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it('should reject invalid or malformed tokens with 401', async () => {
      const res = await request(app)
        .get('/test-protected')
        .set('Authorization', 'Bearer invalid.fake.token');

      expect(res.status).toBe(401);
    });

    it('should authenticate valid JWT token and attach user to request', async () => {
      const token = generateToken(100, 'customer', 'customer@test.com');

      const res = await request(app)
        .get('/test-protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.id).toBe(100);
      expect(res.body.user.role).toBe('customer');
    });

    it('PERMISSION SECURITY: should block customer from accessing admin-only endpoint with 403 Forbidden', async () => {
      const customerToken = generateToken(101, 'customer', 'customer@test.com');

      const res = await request(app)
        .get('/test-admin-only')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBeDefined();
    });

    it('should allow admin to access admin-only endpoint', async () => {
      const adminToken = generateToken(1, 'admin', 'admin@injibaramarket.com');

      const res = await request(app)
        .get('/test-admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Admin access granted');
    });
  });
});
