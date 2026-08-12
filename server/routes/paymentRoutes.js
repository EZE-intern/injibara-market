const express = require('express');
const router = express.Router();

// 1. Controller እና Middleware ማስገባት 
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// 2. ከ Middleware ፋይል የሚወጡ Functions
const protect = authMiddleware.protect;
const authorize = authMiddleware.authorize;

// 3. ከ Controller የሚወጡ Functions
const { 
  processPayment, 
  getPaymentByOrder, 
  updatePaymentStatus,
  handleChapaWebhook 
} = paymentController;

// POST /api/payments/chapa-checkout
router.post('/chapa-checkout', protect, paymentController.createChapaCheckout);

// GET /api/payments/verify-chapa/:tx_ref
router.get('/verify-chapa/:tx_ref', protect, paymentController.verifyChapa);

// አዲስ ክፍያ መመዝገብ
router.post('/process', protect, processPayment);



router.post('/chapa-webhook', handleChapaWebhook);


// በ Order ID የክፍያ መረጃ ማየት
router.get('/order/:orderId', protect, getPaymentByOrder);

// የክፍያ ሁኔታ ማዘመን (ለ Admin/Seller)
router.put('/order/:orderId/status', protect, authorize('admin', 'seller'), updatePaymentStatus);

module.exports = router;