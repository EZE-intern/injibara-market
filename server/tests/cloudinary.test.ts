import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadToCloudinary, deleteFromCloudinary } from '../src/lib/cloudinary.js';
import type { Env } from '../src/types/env.js';

describe('Cloudinary Service', () => {
  const mockEnv: Env = {
    ENVIRONMENT: 'test',
    DATABASE_URL: 'mysql://test',
    JWT_SECRET: 'test-secret',
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_API_KEY: 'test-key',
    CLOUDINARY_API_SECRET: 'test-secret',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error if credentials are missing', async () => {
    const invalidEnv: Env = {
      ...mockEnv,
      CLOUDINARY_CLOUD_NAME: '',
    };
    const dummyBlob = new Blob(['dummy content'], { type: 'image/png' });
    await expect(uploadToCloudinary(dummyBlob, 'test', invalidEnv)).rejects.toThrow(
      'Cloudinary credentials are not configured'
    );
  });

  it('generates correct SHA-1 signature and posts to Cloudinary upload endpoint', async () => {
    let capturedBody: FormData | null = null;
    let capturedUrl = '';

    global.fetch = vi.fn().mockImplementation(async (url: string, init: any) => {
      capturedUrl = url;
      capturedBody = init.body;
      return {
        ok: true,
        json: async () => ({
          secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v1234/test.png',
          public_id: 'injibara-market/products/test',
          width: 800,
          height: 600,
          format: 'png',
          bytes: 12345,
        }),
      } as any;
    });

    const dummyBlob = new Blob(['fake image bytes'], { type: 'image/png' });
    const result = await uploadToCloudinary(dummyBlob, 'products', mockEnv);

    expect(capturedUrl).toBe('https://api.cloudinary.com/v1_1/test-cloud/image/upload');
    expect(result.secure_url).toBe(
      'https://res.cloudinary.com/test-cloud/image/upload/v1234/test.png'
    );
    expect(capturedBody).toBeInstanceOf(FormData);
    expect(capturedBody?.get('folder')).toBe('injibara-market/products');
    expect(capturedBody?.get('api_key')).toBe('test-key');

    // Verify signature format (40-character hex string from sha1)
    const signature = capturedBody?.get('signature');
    expect(typeof signature).toBe('string');
    expect((signature as string).length).toBe(40);
  });

  it('generates correct SHA-1 signature and posts to Cloudinary destroy endpoint', async () => {
    let capturedUrl = '';
    let capturedBody: FormData | null = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, init: any) => {
      capturedUrl = url;
      capturedBody = init.body;
      return {
        ok: true,
        json: async () => ({ result: 'ok' }),
      } as any;
    });

    await deleteFromCloudinary('injibara-market/products/test', mockEnv);

    expect(capturedUrl).toBe('https://api.cloudinary.com/v1_1/test-cloud/image/destroy');
    expect(capturedBody?.get('public_id')).toBe('injibara-market/products/test');
    expect(capturedBody?.get('api_key')).toBe('test-key');

    const signature = capturedBody?.get('signature');
    expect(typeof signature).toBe('string');
    expect((signature as string).length).toBe(40);
  });
});
