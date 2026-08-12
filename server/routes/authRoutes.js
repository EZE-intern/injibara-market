const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Handles POST /api/auth/register
router.post('/register', registerUser);

// Handles POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;
/*

const express = require('express');
const router = require.Router();
const {registerUser, loginUser} = require('../controllers/authController');
router.post('/register', registerUser);
router.post('/login', loginUser);

*/
