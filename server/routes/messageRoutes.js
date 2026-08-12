const express = require('express');
const router = express.Router();


const messageController = require('../controllers/messageController');


const { protect } = require('../middleware/authMiddleware');

// ሁሉንም የቻት መወያያ መንገዶች (Routes) በ JWT Token እንዲጠበቁ ማድረግ
router.use(protect);


// GET /api/messages/inbox
router.get('/inbox', messageController.getConversationsList);


// GET /api/messages/unread-count
router.get('/unread-count', messageController.getUnreadBadgeCount);


// GET /api/messages/thread/:contactId
router.get('/thread/:contactId', messageController.getConversation);


// POST /api/messages
router.post('/', messageController.sendMessage);


module.exports = router;