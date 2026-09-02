import express, { Router } from 'express';
import {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import { creationLimiter } from '../middleware/rateLimiter.js';
import { createProductSchema, updateProductSchema } from '../schemas/index.js';

const router: Router = express.Router();

// Public routes: Anyone can view products
router.get('/', getProducts);

// Seller-specific: Get logged in user's products (Must be before /:id to avoid path conflict)
router.get('/my-products', protect, getMyProducts);

router.get('/:id', getProductById);

// Protected routes with validation & upload rate limiting
// Note: validate() runs AFTER multer (upload) since multer parses multipart form data into req.body
router.post('/', protect, creationLimiter, upload.array('images', 6), validate(createProductSchema), createProduct);
router.put('/:id', protect, upload.array('images', 6), validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
