/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import adminRoutes from '../src/routes/adminRoutes.js';
import generateToken from '../src/utils/generateToken.js';
import { prisma } from '../src/lib/prisma.js';

describe('Admin Routes & Security Tests', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);

  const adminToken = generateToken(1, 'admin', 'admin@injibaramarket.com');
  const superAdminToken = generateToken(2, 'super_admin', 'super@injibaramarket.com');
  const customerToken = generateToken(3, 'customer', 'customer@injibaramarket.com');

  it('should reject unauthenticated requests to /api/admin/overview with 401', async () => {
    const res = await request(app).get('/api/admin/overview');
    expect(res.status).toBe(401);
  });

  it('should reject customer access to /api/admin/overview with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  it('should allow admin access to /api/admin/overview and return 200 with data structure', async () => {
    // Mock prisma counts
    const countSpy = vi.spyOn(prisma.products, 'count').mockResolvedValue(10 as any);
    const storeCountSpy = vi.spyOn(prisma.stores, 'count').mockResolvedValue(5 as any);
    const userCountSpy = vi.spyOn(prisma.users, 'count').mockResolvedValue(20 as any);
    const msgCountSpy = vi.spyOn(prisma.messages, 'count').mockResolvedValue(2 as any);

    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      totalActiveListings: 10,
      pendingBrokerInquiries: 2,
      totalStores: 5,
      totalRegisteredUsers: 20,
    });

    countSpy.mockRestore();
    storeCountSpy.mockRestore();
    userCountSpy.mockRestore();
    msgCountSpy.mockRestore();
  });

  it('should allow super_admin access to /api/admin/overview', async () => {
    vi.spyOn(prisma.products, 'count').mockResolvedValue(1 as any);
    vi.spyOn(prisma.stores, 'count').mockResolvedValue(1 as any);
    vi.spyOn(prisma.users, 'count').mockResolvedValue(1 as any);
    vi.spyOn(prisma.messages, 'count').mockResolvedValue(1 as any);

    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should allow admin to get categories with tier classification', async () => {
    vi.spyOn(prisma.categories, 'findMany').mockResolvedValue([
      {
        id: 1,
        name: 'Vehicles',
        slug: 'vehicles',
        description: 'Cars and bikes',
        created_at: new Date('2026-01-01'),
        _count: { products: 3 },
      } as any,
      {
        id: 2,
        name: 'Electronics',
        slug: 'electronics',
        description: 'Gadgets',
        created_at: new Date('2026-01-01'),
        _count: { products: 7 },
      } as any,
    ]);

    const res = await request(app)
      .get('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    // Vehicles is brokered -> TIER_1
    expect(res.body.data[0].tier).toBe('TIER_1');
    // Electronics is not brokered -> TIER_2
    expect(res.body.data[1].tier).toBe('TIER_2');
  });

  it('should allow admin to get users list', async () => {
    vi.spyOn(prisma.users, 'findMany').mockResolvedValue([
      {
        id: 1,
        full_name: 'Test Admin',
        email: 'admin@test.com',
        phone: '+251911000000',
        role: 'admin',
        deleted_at: null,
        created_at: new Date('2026-01-01'),
      } as any,
    ]);

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].role).toBe('ADMIN');
    expect(res.body.data[0].status).toBe('ACTIVE');
  });

  it('should allow admin to get stores list', async () => {
    vi.spyOn(prisma.stores, 'findMany').mockResolvedValue([
      {
        id: 1,
        store_name: 'Alpha Store',
        description: 'Best shop',
        is_active: true,
        created_at: new Date('2026-01-01'),
        users: { id: 10, full_name: 'Seller One', email: 's@test.com', phone: '0911' },
        _count: { products: 12 },
      } as any,
    ]);

    const res = await request(app)
      .get('/api/admin/stores')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].name).toBe('Alpha Store');
    expect(res.body.data[0].product_count).toBe(12);
    expect(res.body.data[0].status).toBe('APPROVED');
  });
});
