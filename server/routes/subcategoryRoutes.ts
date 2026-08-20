import { Router } from 'express';
import {
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoriesByCategoryId,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../controllers/subcategoryController';

const router = Router();

router.get('/', getAllSubCategories);
router.get('/category/:categoryId', getSubCategoriesByCategoryId);
router.get('/:id', getSubCategoryById);
router.post('/', createSubCategory);
router.put('/:id', updateSubCategory);
router.delete('/:id', deleteSubCategory);

export default router;
