import { describe, it, expect } from 'vitest';
import { formatFileSize, compressImage } from './imageCompressor';

describe('imageCompressor utility', () => {
  it('formats file sizes accurately', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  it('skips non-image files or SVG', async () => {
    const textFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const res = await compressImage(textFile);
    expect(res.didCompress).toBe(false);
    expect(res.file).toBe(textFile);
  });

  it('skips compression for already small images', async () => {
    const smallFile = new File(['a'.repeat(50 * 1024)], 'small.jpg', { type: 'image/jpeg' });
    const res = await compressImage(smallFile);
    expect(res.didCompress).toBe(false);
    expect(res.file).toBe(smallFile);
  });
});
