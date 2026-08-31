import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyOrders, createOrder, getOrderById } from '../controllers/orderController.js';

const router = Router();

router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, getMyOrders);
router.post('/', protect, createOrder);
router.get('/:id', protect, getOrderById);

export default router;
