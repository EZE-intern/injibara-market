const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/authMiddleware');
const pictureupload = require('../config/pictureupload');

// 🌐 Public Routes: ማንም ሰው ምርቶችን ማየት ይችላል
router.get('/', getProducts);
router.get('/:id', getProductById);

// 🔒 Protected Routes: Admin እና Seller ብቻ ምርት ማከል ወይም ማጥፋት ይችላሉ
router.post('/', protect, authorize('admin'), pictureupload.single('image'), createProduct);

router.delete('/:id', protect, authorize('admin', 'seller'), deleteProduct);

module.exports = router;
