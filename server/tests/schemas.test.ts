import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  updateUserRoleSchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  createStoreSchema,
} from '../src/schemas/index.js';

describe('Validation Schemas & Business Invariants', () => {
  // ─── 1. Auth & Security Schemas ─────────────────────────────────────
  describe('Auth Schemas', () => {
    it('should validate and sanitize a valid user registration', async () => {
      const input = {
        full_name: '  Abebe Bikila  ',
        email: '  Abebe@InjibaraMarket.COM  ',
        password: 'securePassword123',
        phone: '0911223344',
        role: 'customer',
      };

      const parsed = await registerSchema.parseAsync(input);

      expect(parsed.full_name).toBe('Abebe Bikila');
      expect(parsed.email).toBe('abebe@injibaramarket.com');
      expect(parsed.phone).toBe('0911223344');
      expect(parsed.role).toBe('customer');
    });

    it('should normalize Ethiopian phone numbers to standard 09xxxxxxxx and 07xxxxxxxx', async () => {
      const testCases = [
        { raw: '+251911223344', expected: '0911223344' },
        { raw: '251911223344', expected: '0911223344' },
        { raw: '0911223344', expected: '0911223344' },
        { raw: '+251712345678', expected: '0712345678' },
        { raw: '0712345678', expected: '0712345678' },
        { raw: '09 11-22-33-44', expected: '0911223344' },
      ];

      for (const { raw, expected } of testCases) {
        const parsed = await registerSchema.parseAsync({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          phone: raw,
        });
        expect(parsed.phone).toBe(expected);
      }
    });

    it('should reject invalid phone numbers (non-Ethiopian, short, letters)', async () => {
      const invalidPhones = ['0812345678', '0512345678', '12345', 'not-a-phone', '+12025550123'];

      for (const phone of invalidPhones) {
        await expect(
          registerSchema.parseAsync({
            full_name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            phone,
          })
        ).rejects.toThrow();
      }
    });

    it('SECURITY: should strictly reject admin role on public registration', async () => {
      await expect(
        registerSchema.parseAsync({
          full_name: 'Hacker User',
          email: 'hacker@example.com',
          password: 'password123',
          role: 'admin',
        })
      ).rejects.toThrow();
    });

    it('should validate loginSchema and reject missing credentials', async () => {
      const valid = await loginSchema.parseAsync({
        email: '  USER@Test.COM ',
        password: 'mypassword',
      });
      expect(valid.email).toBe('user@test.com');

      await expect(loginSchema.parseAsync({ email: '', password: '' })).rejects.toThrow();
    });

    it('should validate updateUserRoleSchema for admin role promotions', async () => {
      const validAdmin = await updateUserRoleSchema.parseAsync({ role: 'admin' });
      expect(validAdmin.role).toBe('admin');

      const validSeller = await updateUserRoleSchema.parseAsync({ role: 'seller' });
      expect(validSeller.role).toBe('seller');

      await expect(updateUserRoleSchema.parseAsync({ role: 'super_admin' })).rejects.toThrow();
    });
  });

  // ─── 2. Product Integrity & Pricing Schemas ─────────────────────────
  describe('Product Schemas', () => {
    it('should validate a complete product listing', async () => {
      const validProduct = {
        name: '  Teff Grain 50kg  ',
        price: '4500.50',
        discount_price: '4200',
        stock: '10',
        category_id: '3',
        description: 'Fresh organic teff from Injibara farms.',
      };

      const parsed = await createProductSchema.parseAsync(validProduct);

      expect(parsed.name).toBe('Teff Grain 50kg');
      expect(parsed.price).toBe(4500.5);
      expect(parsed.discount_price).toBe(4200);
      expect(parsed.stock).toBe(10);
      expect(parsed.category_id).toBe(3);
    });

    it('FINANCIAL INVARIANT: should reject zero or negative price', async () => {
      await expect(
        createProductSchema.parseAsync({
          name: 'Free Item',
          price: 0,
        })
      ).rejects.toThrow();

      await expect(
        createProductSchema.parseAsync({
          name: 'Negative Item',
          price: -500,
        })
      ).rejects.toThrow();
    });

    it('PRICING INVARIANT: should reject discount price greater than or equal to regular price', async () => {
      await expect(
        createProductSchema.parseAsync({
          name: 'Faulty Discount',
          price: 1000,
          discount_price: 1200, // discount > regular price!
        })
      ).rejects.toThrow(/Discount price must be less than the regular price/);

      await expect(
        createProductSchema.parseAsync({
          name: 'Equal Discount',
          price: 1000,
          discount_price: 1000,
        })
      ).rejects.toThrow(/Discount price must be less than the regular price/);
    });

    it('should properly handle empty string FormData inputs from frontend', async () => {
      const parsed = await createProductSchema.parseAsync({
        name: 'Standard Bajaj',
        price: '250000',
        discount_price: '',
        stock: '',
        category_id: '',
        description: '',
      });

      expect(parsed.price).toBe(250000);
      expect(parsed.discount_price).toBeUndefined();
      expect(parsed.category_id).toBeUndefined();
    });

    it('should validate partial updates with updateProductSchema', async () => {
      const parsed = await updateProductSchema.parseAsync({
        price: '3000',
        stock: '5',
      });

      expect(parsed.price).toBe(3000);
      expect(parsed.stock).toBe(5);
    });
  });

  // ─── 3. Order Calculations & Array Schemas ──────────────────────────
  describe('Order Schemas', () => {
    it('should validate an order with items array', async () => {
      const validOrder = {
        items: [
          { product_id: '1', quantity: '2' },
          { product_id: 5, quantity: 1 },
        ],
        shipping_address: 'Injibara, Kebele 02, Near Bus Station',
        payment_method: 'cash_on_delivery',
      };

      const parsed = await createOrderSchema.parseAsync(validOrder);

      expect(parsed.items).toHaveLength(2);
      expect(parsed.items[0].product_id).toBe(1);
      expect(parsed.items[0].quantity).toBe(2);
      expect(parsed.items[1].product_id).toBe(5);
      expect(parsed.items[1].quantity).toBe(1);
    });

    it('DATA INVARIANT: should reject empty order items array', async () => {
      await expect(
        createOrderSchema.parseAsync({
          items: [],
          shipping_address: 'Injibara',
        })
      ).rejects.toThrow();
    });

    it('QUANTITY INVARIANT: should reject zero or negative item quantities', async () => {
      await expect(
        createOrderSchema.parseAsync({
          items: [{ product_id: 1, quantity: 0 }],
        })
      ).rejects.toThrow();

      await expect(
        createOrderSchema.parseAsync({
          items: [{ product_id: 1, quantity: -3 }],
        })
      ).rejects.toThrow();
    });
  });

  // ─── 4. Store Schemas ───────────────────────────────────────────────
  describe('Store Schemas', () => {
    it('should validate store creation with optional Ethiopian phone', async () => {
      const store = await createStoreSchema.parseAsync({
        store_name: '  Awi Crafts & Leather  ',
        phone: '+251911002233',
        description: 'Authentic leather goods made in Injibara.',
      });

      expect(store.store_name).toBe('Awi Crafts & Leather');
      expect(store.phone).toBe('0911002233');
    });
  });
});
