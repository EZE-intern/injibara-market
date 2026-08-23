import express, { Router } from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

// Public route: Anyone can view products
router.get('/', getProducts);

// Protected route: Only logged-in sellers and admins can create products
router.post('/', protect, authorizeRoles('seller', 'admin'), createProduct);

export default router;
