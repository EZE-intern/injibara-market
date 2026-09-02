import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyOrders, createOrder, getOrderById } from '../controllers/orderController.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '../schemas/index.js';

const router = Router();

router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, getMyOrders);
router.post('/', protect, validate(createOrderSchema), createOrder);
router.get('/:id', protect, getOrderById);

export default router;
