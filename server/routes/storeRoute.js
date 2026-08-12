const express = require('express');
const router = express.Router();
const {
  createStore,
  getMyStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore
} = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

// 1. ሁሉንም ሱቆች ማየት (Public Route)
router.get('/', getAllStores);

// 2. በ ID ልዩ ሱቅ ማየት (Public Route)
router.get('/:storeId', getStoreById);

// 3. የራስን ሱቅ ማየት (Protected)
router.get('/me/my-store', protect, getMyStore);

// 4. አዲስ ሱቅ መፍጠር (Protected)
router.post('/create', protect, createStore);

// 5. የሱቅ መረጃ ማስተካከል (Protected)
router.put('/update', protect, updateStore);

// 6. ሱቅ ማጥፋት (Protected)
router.delete('/delete', protect, deleteStore);

module.exports = router;