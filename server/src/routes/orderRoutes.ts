import { Hono } from 'hono';
import type { AppContext } from '../types/context.js';
import {
  getMyOrders,
  createOrder,
  getOrderById,
  getSellerOrders,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const app = new Hono<AppContext>();

app.get('/seller-orders', protect, getSellerOrders);
app.get('/:id', protect, getOrderById);
app.get('/', protect, getMyOrders);
app.post('/', protect, createOrder);

export default app;
