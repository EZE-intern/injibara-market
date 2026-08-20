import express, { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect, authorize } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

//   this end points open only by admines  
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
