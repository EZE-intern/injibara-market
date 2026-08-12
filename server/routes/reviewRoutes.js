const express = require('express');
const router = express.Router();
const {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// 1. የልዩ ምርት Review-ዎችን ለማየት (ማንም ማየት ይችላል - Auth አይፈልግም)
router.get('/product/:productId', getProductReviews);

// 2. አዲስ Review ለመጨመር (ተጠቃሚው Login ማድረግ አለበት)
router.post('/add', protect, addReview);

// 3. Review ለማስተካከል
router.put('/update/:reviewId', protect, updateReview);

// 4. Review ለማጥፋት
router.delete('/delete/:reviewId', protect, deleteReview);

module.exports = router;
