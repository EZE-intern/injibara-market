const express = require('express');
const router = express.Router();
const { 
  addToFavorites, 
  getUserFavorites, 
  removeFromFavorites, 
  checkIsFavorited 
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware'); // Authentication check

router.post('/add', protect, addToFavorites);
router.get('/', protect, getUserFavorites);
router.delete('/remove/:productId', protect, removeFromFavorites);
router.get('/check/:productId', protect, checkIsFavorited);

module.exports = router;