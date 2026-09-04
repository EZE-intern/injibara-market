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

  it('should return broker inquiries with message_text filtered to Tier 1 brokered categories', async () => {
    vi.spyOn(prisma.messages, 'findMany').mockResolvedValue([
      {
        id: 101,
        sender_id: 20,
        receiver_id: 1,
        product_id: 50,
        message_text: 'Is this Bajaj still available for purchase?',
        is_read: false,
        created_at: new Date('2026-01-01'),
        products: {
          id: 50,
          name: 'Bajaj RE 2024',
          price: 350000,
          categories: { name: 'Vehicles & Bajaj', slug: 'vehicles' },
          product_images: [{ image_url: 'https://img.com/bajaj.jpg' }],
          users: { id: 30, full_name: 'Seller Abebe', phone: '0911223344' },
        },
        users_messages_sender_idTousers: {
          id: 20,
          full_name: 'Buyer Kebede',
          phone: '0988776655',
          email: 'buyer@kebede.com',
        },
      } as any,
      {
        id: 102,
        sender_id: 21,
        receiver_id: 31,
        product_id: 51,
        message_text: 'What is the shoe size?',
        is_read: true,
        created_at: new Date('2026-01-01'),
        products: {
          id: 51,
          name: 'Leather Shoes',
          price: 2500,
          categories: { name: 'Fashion & Clothes', slug: 'fashion' },
          product_images: [],
          users: { id: 31, full_name: 'Shoe Seller', phone: '0911001122' },
        },
        users_messages_sender_idTousers: {
          id: 21,
          full_name: 'Shoe Buyer',
          phone: '0911223344',
          email: 'shoebuyer@test.com',
        },
      } as any,
    ]);

    const res = await request(app)
      .get('/api/admin/broker-inquiries')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Only the Tier 1 Bajaj inquiry should be returned, fashion filtered out
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].id).toBe(101);
    expect(res.body.data[0].message_text).toBe('Is this Bajaj still available for purchase?');
    expect(res.body.data[0].buyer.full_name).toBe('Buyer Kebede');
  });

  it('should allow admin to get conversation messages for a broker inquiry', async () => {
    vi.spyOn(prisma.messages, 'findUnique').mockResolvedValue({
      id: 101,
      sender_id: 20,
      product_id: 50,
      products: { categories: { name: 'Vehicles', slug: 'vehicles' } },
    } as any);

    vi.spyOn(prisma.messages, 'findMany').mockResolvedValue([
      {
        id: 1,
        message_text: 'Hello, I want to inspect the vehicle',
        sender_id: 20,
        receiver_id: 1,
        product_id: 50,
        is_read: false,
        created_at: new Date('2026-01-01T10:00:00Z'),
        users_messages_sender_idTousers: { id: 20, full_name: 'Buyer Kebede', role: 'customer' },
        users_messages_receiver_idTousers: { id: 1, full_name: 'Admin', role: 'admin' },
      } as any,
    ]);

    vi.spyOn(prisma.messages, 'updateMany').mockResolvedValue({ count: 1 } as any);

    const res = await request(app)
      .get('/api/admin/broker-inquiries/101/messages')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].message_text).toBe('Hello, I want to inspect the vehicle');
  });

  it('should allow admin to send reply to buyer for a broker inquiry', async () => {
    vi.spyOn(prisma.messages, 'findUnique').mockResolvedValue({
      id: 101,
      sender_id: 20,
      product_id: 50,
      is_read: false,
      products: { categories: { name: 'Vehicles', slug: 'vehicles' } },
    } as any);

    vi.spyOn(prisma.messages, 'create').mockResolvedValue({
      id: 2,
      sender_id: 1,
      receiver_id: 20,
      product_id: 50,
      message_text: 'We have scheduled your inspection for tomorrow.',
      is_read: false,
      created_at: new Date('2026-01-01T11:00:00Z'),
      users_messages_sender_idTousers: { id: 1, full_name: 'Admin', role: 'admin' },
    } as any);

    vi.spyOn(prisma.messages, 'update').mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/admin/broker-inquiries/101/messages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ message_text: 'We have scheduled your inspection for tomorrow.' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message_text).toBe('We have scheduled your inspection for tomorrow.');
  });

  it('should deduplicate inquiries by (product_id, buyer_id) and prevent admin replies from creating duplicate listings', async () => {
    // Simulate initial buyer message and an admin reply for the same product
    vi.spyOn(prisma.messages, 'findMany').mockResolvedValue([
      {
        id: 101,
        sender_id: 20,
        receiver_id: 1,
        product_id: 50,
        message_text: 'Is this Bajaj still available?',
        is_read: true,
        created_at: new Date('2026-01-01T10:00:00Z'),
        products: {
          id: 50,
          name: 'Bajaj RE 2024',
          price: 350000,
          categories: { name: 'Vehicles & Transport', slug: 'vehicles' },
          product_images: [{ image_url: 'https://img.com/bajaj.jpg' }],
          users: { id: 30, full_name: 'Seller Abebe', phone: '0911223344' },
        },
        users_messages_sender_idTousers: {
          id: 20,
          full_name: 'Buyer Kebede',
          phone: '0988776655',
          email: 'buyer@kebede.com',
          role: 'customer',
        },
        users_messages_receiver_idTousers: {
          id: 1,
          full_name: 'Admin User',
          phone: '0911000000',
          email: 'admin@injibaramarket.com',
          role: 'admin',
        },
      } as any,
      {
        id: 102,
        sender_id: 1, // ADMIN sends reply
        receiver_id: 20,
        product_id: 50,
        message_text: 'ohh good, we will inspect it tomorrow.',
        is_read: false,
        created_at: new Date('2026-01-01T10:30:00Z'),
        products: {
          id: 50,
          name: 'Bajaj RE 2024',
          price: 350000,
          categories: { name: 'Vehicles & Transport', slug: 'vehicles' },
          product_images: [{ image_url: 'https://img.com/bajaj.jpg' }],
          users: { id: 30, full_name: 'Seller Abebe', phone: '0911223344' },
        },
        users_messages_sender_idTousers: {
          id: 1,
          full_name: 'Admin User',
          phone: '0911000000',
          email: 'admin@injibaramarket.com',
          role: 'admin',
        },
        users_messages_receiver_idTousers: {
          id: 20,
          full_name: 'Buyer Kebede',
          phone: '0988776655',
          email: 'buyer@kebede.com',
          role: 'customer',
        },
      } as any,
    ]);

    const res = await request(app)
      .get('/api/admin/broker-inquiries')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // MUST only return 1 inquiry row, not 2!
    expect(res.body.count).toBe(1);
    expect(res.body.data.length).toBe(1);
    // Buyer MUST be Kebede, not Admin
    expect(res.body.data[0].buyer.id).toBe(20);
    expect(res.body.data[0].buyer.full_name).toBe('Buyer Kebede');
    // Status must be ASSIGNED since admin replied
    expect(res.body.data[0].status).toBe('ASSIGNED');
    // Primary inquiry message should remain the buyer's initial message
    expect(res.body.data[0].message_text).toBe('Is this Bajaj still available?');
  });
});
