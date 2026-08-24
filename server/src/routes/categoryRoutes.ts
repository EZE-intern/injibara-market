import express, { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

// these end points are open only by admins
router.post('/', protect, authorizeRoles('admin'), createCategory);
router.put('/:id', protect, authorizeRoles('admin'), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

export default router;
