import { Router } from 'express';
import {
  getAllSubCategoryItems,
  getSubCategoryItemById,
  getItemsBySubCategoryId,
  createSubCategoryItem,
  updateSubCategoryItem,
  deleteSubCategoryItem,
} from '../controllers/subcategoryitemController';

const router = Router();



router.post('/', createSubCategoryItem);
router.get('/', getAllSubCategoryItems);
router.get('/subcategory/:subCategoryId', getItemsBySubCategoryId);
router.get('/:id', getSubCategoryItemById);

router.put('/:id', updateSubCategoryItem);
router.delete('/:id', deleteSubCategoryItem);

export default router;
