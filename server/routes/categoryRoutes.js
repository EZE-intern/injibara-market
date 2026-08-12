const express = require('express');
const router = express.Router();

// 1. Controller functions ማስገባት
const { getCategories, createCategory } = require('../controllers/categoryController');

// 2. Auth Middleware ማስገባት (የተጠበቀ እንደሆነ ማረጋገጥ)
const authMiddleware = require('../middleware/authMiddleware');
// protect Function እንደሆነ ወይም Object እንደሆነ ማረጋገጫ check:
const protect = typeof authMiddleware === 'function' ? authMiddleware : authMiddleware.protect;

// 3. Routes ማዘጋጀት
router.get('/', getCategories);
router.post('/', protect, createCategory);

module.exports = router;