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

const router: Router = express.Router();

// Public routes: Anyone can view products
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes: Any logged-in user can list items (and manage their own products)
// upload.array('images', 6) allows up to 6 images per product (one per side)
router.post('/', protect, upload.array('images', 6), createProduct);
router.put('/:id', protect, upload.array('images', 6), updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
