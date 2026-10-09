import { Hono } from 'hono';
import type { AppContext } from '../types/context.js';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { creationLimiter } from '../middleware/rateLimiter.js';

const app = new Hono<AppContext>();

app.get('/my-products', protect, getMyProducts);
app.get('/:id', getProductById);
app.get('/', getProducts);

app.post('/', protect, creationLimiter, createProduct);
app.put('/:id', protect, updateProduct);
app.delete('/:id', protect, deleteProduct);

export default app;
