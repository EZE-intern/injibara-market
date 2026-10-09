import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AppContext } from '../src/types/context.js';
import { getWorkOSAuthorizationUrl, handleWorkOSCallback } from '../src/controllers/workosAuthController.js';
import * as workosLib from '../src/lib/workos.js';
import { verifyToken } from '../src/utils/generateToken.js';

describe('WorkOS Authentication Controller', () => {
  let mockPrisma: any;
  let mockWorkOS: any;
  let app: Hono<AppContext>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWorkOS = {
      userManagement: {
        getAuthorizationUrl: vi.fn(),
        authenticateWithCode: vi.fn(),
      },
    };

    vi.spyOn(workosLib, 'getWorkOS').mockReturnValue({
      workos: mockWorkOS as any,
      workosClientId: 'test_client_id',
      defaultRedirectUri: 'https://injibara-market.vercel.app/auth/callback',
      isWorkOSConfigured: () => true,
    });

    mockPrisma = {
      users: {
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
    };

    app = new Hono<AppContext>();
    app.use('*', async (c, next) => {
      c.set('prisma', mockPrisma);
      await next();
    });
    app.get('/workos/url', getWorkOSAuthorizationUrl);
    app.post('/workos/callback', handleWorkOSCallback);
  });

  describe('getWorkOSAuthorizationUrl', () => {
    it('should generate an AuthKit authorization URL with default redirect', async () => {
      const mockUrl = 'https://auth.workos.com/authorize?client_id=test&provider=authkit';
      mockWorkOS.userManagement.getAuthorizationUrl.mockReturnValue(mockUrl);

      const res = await app.request('/workos/url');
      const body = (await res.json()) as any;

      expect(res.status).toBe(200);
      expect(body).toEqual({
        success: true,
        url: mockUrl,
      });
    });

    it('should accept custom redirectUri parameter', async () => {
      mockWorkOS.userManagement.getAuthorizationUrl.mockReturnValue('https://auth.workos.com/url');

      const res = await app.request('/workos/url?redirectUri=http://localhost:5173/auth/callback');

      expect(mockWorkOS.userManagement.getAuthorizationUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUri: 'http://localhost:5173/auth/callback',
        })
      );
    });
  });

  describe('handleWorkOSCallback', () => {
    it('should reject missing code with 400', async () => {
      const res = await app.request('/workos/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const body = (await res.json()) as any;
      expect(res.status).toBe(400);
      expect(body.message).toContain('Authorization code is required');
    });

    it('should link an existing user by email without breaking their ID or data', async () => {
      const mockWorkOSUser = {
        id: 'workos_user_abc123',
        email: 'seller@injibaramarket.com',
        firstName: 'Abebe',
        lastName: 'Bikila',
      };

      mockWorkOS.userManagement.authenticateWithCode.mockResolvedValue({
        user: mockWorkOSUser as never,
      });

      // 1. Not linked by workos_user_id yet
      mockPrisma.users.findUnique
        .mockResolvedValueOnce(null) // by workos_user_id
        .mockResolvedValueOnce({
          id: 55,
          workos_user_id: null,
          email: 'seller@injibaramarket.com',
          full_name: 'Abebe Bikila',
          role: 'seller',
        }); // by email

      mockPrisma.users.update.mockResolvedValue({
        id: 55,
        workos_user_id: 'workos_user_abc123',
        email: 'seller@injibaramarket.com',
        full_name: 'Abebe Bikila',
        role: 'seller',
      });

      const res = await app.request('/workos/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'valid_auth_code_123' }),
      });

      const data = (await res.json()) as any;
      expect(res.status).toBe(200);
      expect(data?.success).toBe(true);
      expect(data?.user.id).toBe(55); // Preserves existing integer user ID
      expect(data?.user.role).toBe('seller'); // Preserves existing seller role

      // Verify JWT decoded
      const decoded = await verifyToken(data!.token, 'MIKAEL_ARTETA_ARSENAL');
      expect(decoded.id).toBe(55);
      expect(decoded.role).toBe('seller');
    });

    it('should provision a new user with customer role if not existing', async () => {
      const mockWorkOSUser = {
        id: 'workos_user_new999',
        email: 'newbuyer@gmail.com',
        firstName: 'Chala',
        lastName: 'Kebede',
      };

      mockWorkOS.userManagement.authenticateWithCode.mockResolvedValue({
        user: mockWorkOSUser as never,
      });

      // Neither workos_user_id nor email exists
      mockPrisma.users.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockPrisma.users.create.mockResolvedValue({
        id: 101,
        workos_user_id: 'workos_user_new999',
        email: 'newbuyer@gmail.com',
        full_name: 'Chala Kebede',
        role: 'customer',
      });

      const res = await app.request('/workos/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'new_user_code' }),
      });

      const data = (await res.json()) as any;
      expect(res.status).toBe(200);
      expect(data?.user.id).toBe(101);
      expect(data?.user.role).toBe('customer');
      expect(data?.user.full_name).toBe('Chala Kebede');
    });
  });
});
