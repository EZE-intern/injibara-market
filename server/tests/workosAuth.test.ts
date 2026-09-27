import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { getWorkOSAuthorizationUrl, handleWorkOSCallback } from '../src/controllers/workosAuthController.js';
import { prisma } from '../src/lib/prisma.js';
import { workos } from '../src/lib/workos.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../src/utils/generateToken.js';

// Mock express response helper
const createMockRes = () => {
  const res: Partial<Response> = {};
  res.statusCode = 200;
  res.status = vi.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn().mockImplementation((data: unknown) => {
    (res as { _data?: unknown })._data = data;
    return res;
  });
  return res as Response & { statusCode: number; _data?: unknown };
};

describe('WorkOS Authentication Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWorkOSAuthorizationUrl', () => {
    it('should generate an AuthKit authorization URL with default redirect', async () => {
      const mockUrl = 'https://auth.workos.com/authorize?client_id=test&provider=authkit';
      vi.spyOn(workos.userManagement, 'getAuthorizationUrl').mockReturnValue(mockUrl);

      const req = { query: {} } as unknown as Request;
      const res = createMockRes();

      await getWorkOSAuthorizationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect((res as { _data?: { success: boolean; url: string } })._data).toEqual({
        success: true,
        url: mockUrl,
      });
    });

    it('should accept custom redirectUri parameter', async () => {
      const spy = vi.spyOn(workos.userManagement, 'getAuthorizationUrl').mockReturnValue('https://auth.workos.com/url');

      const req = {
        query: { redirectUri: 'http://localhost:5173/auth/callback' },
      } as unknown as Request;
      const res = createMockRes();

      await getWorkOSAuthorizationUrl(req, res);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUri: 'http://localhost:5173/auth/callback',
        })
      );
    });
  });

  describe('handleWorkOSCallback', () => {
    it('should reject missing code with 400', async () => {
      const req = { body: {} } as Request;
      const res = createMockRes();

      await handleWorkOSCallback(req, res);

      expect(res.statusCode).toBe(400);
      expect((res as { _data?: { message: string } })._data?.message).toContain('Authorization code is required');
    });

    it('should link an existing user by email without breaking their ID or data', async () => {
      const mockWorkOSUser = {
        id: 'workos_user_abc123',
        email: 'seller@injibaramarket.com',
        firstName: 'Abebe',
        lastName: 'Bikila',
      };

      vi.spyOn(workos.userManagement, 'authenticateWithCode').mockResolvedValue({
        user: mockWorkOSUser as never,
      } as never);

      // 1. Not linked by workos_user_id yet
      vi.spyOn(prisma.users, 'findUnique')
        .mockResolvedValueOnce(null) // by workos_user_id
        .mockResolvedValueOnce({
          id: 55,
          workos_user_id: null,
          email: 'seller@injibaramarket.com',
          full_name: 'Abebe Bikila',
          role: 'seller',
        } as never); // by email

      vi.spyOn(prisma.users, 'update').mockResolvedValue({
        id: 55,
        workos_user_id: 'workos_user_abc123',
        email: 'seller@injibaramarket.com',
        full_name: 'Abebe Bikila',
        role: 'seller',
      } as never);

      const req = { body: { code: 'valid_auth_code_123' } } as Request;
      const res = createMockRes();

      await handleWorkOSCallback(req, res);

      expect(res.statusCode).toBe(200);
      const data = (res as { _data?: { success: boolean; user: { id: number; role: string }; token: string } })._data;
      expect(data?.success).toBe(true);
      expect(data?.user.id).toBe(55); // Preserves existing integer user ID
      expect(data?.user.role).toBe('seller'); // Preserves existing seller role

      // Verify JWT decoded
      const decoded = jwt.verify(data!.token, JWT_SECRET) as { id: number; role: string };
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

      vi.spyOn(workos.userManagement, 'authenticateWithCode').mockResolvedValue({
        user: mockWorkOSUser as never,
      } as never);

      // Neither workos_user_id nor email exists
      vi.spyOn(prisma.users, 'findUnique')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      vi.spyOn(prisma.users, 'create').mockResolvedValue({
        id: 101,
        workos_user_id: 'workos_user_new999',
        email: 'newbuyer@gmail.com',
        full_name: 'Chala Kebede',
        role: 'customer',
      } as never);

      const req = { body: { code: 'new_user_code' } } as Request;
      const res = createMockRes();

      await handleWorkOSCallback(req, res);

      expect(res.statusCode).toBe(200);
      const data = (res as { _data?: { user: { id: number; role: string; full_name: string } } })._data;
      expect(data?.user.id).toBe(101);
      expect(data?.user.role).toBe('customer');
      expect(data?.user.full_name).toBe('Chala Kebede');
    });
  });
});
