import crypto from 'node:crypto';
import type { Env } from '../types/env.js';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Uploads a file buffer, Blob, or File directly to Cloudinary using the REST API.
 * Edge-compatible: uses fetch() and node:crypto without legacy Node streams.
 */
export async function uploadToCloudinary(
  file: File | Blob | ArrayBuffer | Uint8Array,
  folder: string,
  env: Env
): Promise<CloudinaryUploadResult> {
  const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured in environment variables.');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const targetFolder = `injibara-market/${folder}`;
  const paramsToSign = `folder=${targetFolder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHmac('sha1', apiSecret)
    .update(paramsToSign)
    .digest('hex');

  const formData = new FormData();
  if (file instanceof File || file instanceof Blob) {
    formData.append('file', file);
  } else {
    // ArrayBuffer / Uint8Array
    formData.append('file', new Blob([file as any]));
  }

  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('api_key', apiKey);
  formData.append('folder', targetFolder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = (await res.json()) as CloudinaryUploadResult;
  return data;
}

/**
 * Deletes an image from Cloudinary by its public_id.
 */
export async function deleteFromCloudinary(publicId: string, env: Env): Promise<void> {
  const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHmac('sha1', apiSecret)
    .update(paramsToSign)
    .digest('hex');

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('api_key', apiKey);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body: formData,
  });
}
