import express, { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/index.js';

const router: Router = express.Router();

// Public
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected with validation
router.post('/', protect, validate(createCategorySchema), createCategory);
router.put('/:id', protect, authorizeRoles('admin'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

export default router;
