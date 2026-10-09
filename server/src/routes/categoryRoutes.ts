import { Hono } from 'hono';
import type { AppContext } from '../types/context.js';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const app = new Hono<AppContext>();

app.post('/', protect, authorizeRoles('admin'), createCategory);
app.get('/', getCategories);
app.get('/:id', getCategoryById);
app.put('/:id', protect, authorizeRoles('admin'), updateCategory);
app.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

export default app;
