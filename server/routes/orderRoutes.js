const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/authMiddleware');

//  የተመዘገቡ ተጠቃሚዎች ኦርደር መፍጠር እና የራሳቸውን ማየት ይችላሉ
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);

//   only Admin can see all orders
router.get('/', protect, authorize('admin'), getAllOrders);

//  see order lists by  id
router.get('/:id', protect, getOrderById);

//   only Admin and Seller change order status
router.put('/:id/status', protect, authorize('admin', 'seller'), updateOrderStatus);

module.exports = router;
