export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.80)
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  didCompress: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Compresses and resizes high-resolution smartphone camera photos in the browser
 * before uploading to the server.
 *
 * Prefers modern WebP format for compact payloads and Cloudinary credit conservation,
 * with graceful fallback to JPEG for browsers without WebP canvas encoding support.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const originalSize = file.size;
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
  } = options;

  // Non-image files or SVG shouldn't be canvas-compressed
  if (!file.type.startsWith('image/') || file.type.includes('svg')) {
    return { file, originalSize, compressedSize: originalSize, didCompress: false };
  }

  // If already small (< 120KB), no need to compress
  if (file.size <= 120 * 1024) {
    return { file, originalSize, compressedSize: originalSize, didCompress: false };
  }

  return new Promise((resolve) => {
    // If running in an environment without DOM/Canvas (e.g. tests without Canvas), fallback safely
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined' ||
      typeof document.createElement !== 'function'
    ) {
      return resolve({ file, originalSize, compressedSize: originalSize, didCompress: false });
    }

    const reader = new FileReader();
    reader.onerror = () => {
      resolve({ file, originalSize, compressedSize: originalSize, didCompress: false });
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        resolve({ file, originalSize, compressedSize: originalSize, didCompress: false });
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Downscale if larger than max bounds while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve({ file, originalSize, compressedSize: originalSize, didCompress: false });
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Check for WebP support with JPEG fallback
          let prefersWebp = false;
          try {
            const probe = document.createElement('canvas');
            probe.width = 1;
            probe.height = 1;
            prefersWebp = probe.toDataURL('image/webp').startsWith('data:image/webp');
          } catch {
            prefersWebp = false;
          }

          const targetMime = prefersWebp ? 'image/webp' : 'image/jpeg';
          const targetExt = prefersWebp ? 'webp' : 'jpg';

          const createBlobHandler = (mime: string, ext: string, fallback?: () => void) => {
            return (blob: Blob | null) => {
              if (!blob && fallback) {
                fallback();
                return;
              }

              if (!blob || blob.size >= originalSize) {
                // If compression resulted in larger or failed, keep original
                return resolve({ file, originalSize, compressedSize: originalSize, didCompress: false });
              }

              // Preserve base filename, use WebP or JPEG extension
              const baseName = file.name.replace(/\.[^.]+$/, '');
              const compressedFile = new File([blob], `${baseName}.${ext}`, {
                type: mime,
                lastModified: Date.now(),
              });

              resolve({
                file: compressedFile,
                originalSize,
                compressedSize: compressedFile.size,
                didCompress: true,
              });
            };
          };

          if (targetMime === 'image/webp') {
            canvas.toBlob(
              createBlobHandler('image/webp', 'webp', () => {
                canvas.toBlob(createBlobHandler('image/jpeg', 'jpg'), 'image/jpeg', quality);
              }),
              'image/webp',
              quality
            );
          } else {
            canvas.toBlob(createBlobHandler('image/jpeg', 'jpg'), 'image/jpeg', quality);
          }
        } catch {
          resolve({ file, originalSize, compressedSize: originalSize, didCompress: false });
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
