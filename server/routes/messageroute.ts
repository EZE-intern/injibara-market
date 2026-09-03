import express, { Router } from 'express';
import messageController from '../controllers/messageController'; 
// i add thhis console.log bic this part shows conversetion list in side the seller side and buyer side
console.log(' messageRoutes loaded. getConversationsList type:', typeof messageController.getConversationsList);
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.use(protect);

// Seller inbox
router.get('/', messageController.getConversationsList);
router.get('/inbox', messageController.getConversationsList);

// Unread count
router.get('/unread-count', messageController.getUnreadBadgeCount);

// Buyer chat by product
router.get('/chat/:productId', messageController.getConversationByProduct);

// Seller thread
router.get('/thread/:contactId', messageController.getConversation);

// Send message
router.post('/', messageController.sendMessage);
router.post('/send', messageController.sendMessage);

export default router;
