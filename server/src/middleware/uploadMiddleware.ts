import multer from 'multer';
import { Request } from 'express';

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Use memoryStorage — files stay in RAM as Buffer, never touch disk
const storage = multer.memoryStorage();

// Validate file type before accepting
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`ያልተፈቀደ የፋይል ዓይነት: ${file.mimetype}. JPEG, PNG, ወይም WebP ብቻ ይፈቀዳል`));
  }
};

/**
 * Multer instance for single-image uploads.
 * Usage in routes:  upload.single('logo')  or  upload.single('image')
 *
 * For multi-image galleries:  upload.array('images', 5)
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
  },
});

export default upload;
