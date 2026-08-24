import express, { Router } from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router: Router = express.Router();

// Public route: Anyone can view products
router.get('/', getProducts);

// Protected route: Only logged-in sellers and admins can create products
// upload.array('images', 5) allows up to 5 images per product
router.post('/', protect, authorizeRoles('seller', 'admin'), upload.array('images', 5), createProduct);

export default router;
