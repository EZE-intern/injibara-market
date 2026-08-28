import express, { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router: Router = express.Router();

// Public routes: Anyone can view products
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes: Only logged-in sellers and admins can manage products
// upload.array('images', 6) allows up to 6 images per product (one per side)
router.post('/', protect, authorizeRoles('seller', 'admin'), upload.array('images', 6), createProduct);
router.put('/:id', protect, authorizeRoles('seller', 'admin'), upload.array('images', 6), updateProduct);
router.delete('/:id', protect, authorizeRoles('seller', 'admin'), deleteProduct);

export default router;
