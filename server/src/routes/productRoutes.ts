import express, { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../schemas/index.js';

const router: Router = express.Router();

// Public routes: Anyone can view products
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes with validation
// Note: validate() runs AFTER multer (upload) since multer parses multipart form data into req.body
router.post('/', protect, upload.array('images', 6), validate(createProductSchema), createProduct);
router.put('/:id', protect, upload.array('images', 6), validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
