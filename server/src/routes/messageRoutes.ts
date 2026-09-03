import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { creationLimiter } from '../middleware/rateLimiter.js';
import messageController from '../controllers/messageController.js';

const router = express.Router();

// All message routes require authentication
router.use(protect);

// Inbox — list all conversations for the authenticated user
router.get('/inbox', messageController.getConversationsList);

// Unread count — for notification badges
router.get('/unread-count', messageController.getUnreadBadgeCount);

// Buyer chat — get messages for a specific product
router.get('/chat/:productId', messageController.getConversationByProduct);

// Thread — get full conversation with a specific contact
router.get('/thread/:contactId', messageController.getConversation);

// Send message — rate-limited to prevent spam
router.post('/send', creationLimiter, messageController.sendMessage);

export default router;
