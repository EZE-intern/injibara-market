const db = require('../config/db');

const MessageModel = {
  // Create / Send a new message
  async create({ sender_id, receiver_id, product_id, order_id, message_text }) {
    const query = `
      INSERT INTO messages 
        (sender_id, receiver_id, product_id, order_id, message_text, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, NOW())
    `;

    const [result] = await db.query(query, [
      sender_id,
      receiver_id,
      product_id || null,
      order_id || null,
      message_text,
    ]);

    return result.insertId; // returns the new message id
  },

  // Get full conversation between two users
  async getConversation(userId, contactId) {
    const query = `
      SELECT id, sender_id, receiver_id, product_id, order_id, 
             message_text, is_read, created_at
      FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `;

    const [rows] = await db.query(query, [
      userId, contactId,
      contactId, userId,
    ]);

    return rows;
  },

  // Mark messages as read
  async markAsRead(userId, contactId) {
    const query = `
      UPDATE messages
      SET is_read = 1
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `;
    await db.query(query, [contactId, userId]);
  },

  // Get inbox / conversation list
  async getUserConversations(userId) {
    const query = `
      SELECT 
        m.id AS message_id,
        m.message_text,
        m.created_at,
        m.is_read,
        m.product_id,
        m.order_id,
        IF(m.sender_id = ?, m.receiver_id, m.sender_id) AS contact_id,
        u.name AS contact_name,
        u.email AS contact_email
      FROM messages m
      JOIN users u ON u.id = IF(m.sender_id = ?, m.receiver_id, m.sender_id)
      WHERE m.id IN (
        SELECT MAX(id)
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
      )
      ORDER BY m.created_at DESC
    `;

    const [rows] = await db.query(query, [
      userId, userId, userId, userId,
    ]);

    return rows;
  },

  // Get unread message count
  async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) AS unread_count
      FROM messages
      WHERE receiver_id = ? AND is_read = 0
    `;

    const [rows] = await db.query(query, [userId]);
    return rows[0].unread_count || 0;
  },
};

module.exports = MessageModel;