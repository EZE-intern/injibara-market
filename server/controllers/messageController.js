const MessageModel = require('../models/messageModel');

const messageController = {
  // POST /api/messages
  async sendMessage(req, res) {
    try {
      const sender_id = req.user.id;
      const { receiver_id, product_id, order_id, message_text } = req.body;

      if (!receiver_id || !message_text || message_text.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Receiver ID and message text are required.',
        });
      }

      if (parseInt(receiver_id) === parseInt(sender_id)) {
        return res.status(400).json({
          success: false,
          message: 'You cannot send a message to yourself.',
        });
      }

      const messageId = await MessageModel.create({
        sender_id,
        receiver_id,
        product_id,
        order_id,
        message_text: message_text.trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully.',
        data: { message_id: messageId },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error sending message.',
      });
    }
  },

  // GET /api/messages/thread/:contactId
  async getConversation(req, res) {
    try {
      const userId = req.user.id;
      const { contactId } = req.params;

      if (!contactId) {
        return res.status(400).json({
          success: false,
          message: 'Contact ID is required.',
        });
      }

      const messages = await MessageModel.getConversation(userId, contactId);

      // Mark messages as read
      await MessageModel.markAsRead(userId, contactId);

      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error retrieving messages.',
      });
    }
  },

  // GET /api/messages/inbox
  async getConversationsList(req, res) {
    try {
      const userId = req.user.id;
      const conversations = await MessageModel.getUserConversations(userId);

      return res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error loading inbox.',
      });
    }
  },

  // GET /api/messages/unread-count
  async getUnreadBadgeCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await MessageModel.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        unread_count: count,
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error counting unread messages.',
      });
    }
  },
};

module.exports = messageController;
