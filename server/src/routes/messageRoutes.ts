import { Hono } from 'hono';
import type { AppContext } from '../types/context.js';
import {
  sendMessage,
  getConversationsList,
  getConversation,
  getConversationByProduct,
  getUnreadBadgeCount,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { creationLimiter } from '../middleware/rateLimiter.js';

const app = new Hono<AppContext>();

// Inbox — list all conversations for the authenticated user
app.get('/inbox', protect, getConversationsList);

// Unread count — for notification badges
app.get('/unread-count', protect, getUnreadBadgeCount);

// Buyer chat — get messages for a specific product
app.get('/chat/:productId', protect, getConversationByProduct);

// Thread — get full conversation with a specific contact
app.get('/thread/:contactId', protect, getConversation);

// Send message — rate-limited to prevent spam
app.post('/send', protect, creationLimiter, sendMessage);

export default app;
