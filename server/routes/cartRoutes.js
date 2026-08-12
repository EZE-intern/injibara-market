const express = require('express');
const router = express.Router();
const { addItemToCart, getUserCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware'); // { protect } አድርገው

router.post('/', protect, addItemToCart);
router.get('/', protect, getUserCart);

module.exports = router;
