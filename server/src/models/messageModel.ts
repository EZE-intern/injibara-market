import { prisma } from '../lib/prisma.js';

export interface CreateMessageParams {
  sender_id: number;
  receiver_id: number;
  product_id?: number | null;
  order_id?: number | null;
  message_text: string;
}

export interface ConversationSummary {
  contact_id: number;
  contact_name: string;
  contact_email: string;
  latest_message: string;
  latest_message_at: Date;
  unread_count: number;
  product_id: number | null;
}

const MessageModel = {
  /**
   * Create a new message between two users.
   */
  async create(params: CreateMessageParams) {
    return prisma.messages.create({
      data: {
        sender_id: params.sender_id,
        receiver_id: params.receiver_id,
        product_id: params.product_id ?? null,
        order_id: params.order_id ?? null,
        message_text: params.message_text,
        is_read: false,
      },
    });
  },

  /**
   * Get the full conversation thread between two users, ordered chronologically.
   */
  async getConversation(userId: number, contactId: number) {
    return prisma.messages.findMany({
      where: {
        OR: [
          { sender_id: userId, receiver_id: contactId },
          { sender_id: contactId, receiver_id: userId },
        ],
      },
      orderBy: { created_at: 'asc' },
    });
  },

  /**
   * Get messages between two users scoped to a specific product.
   */
  async getConversationByProduct(userId: number, contactId: number, productId: number) {
    return prisma.messages.findMany({
      where: {
        product_id: productId,
        OR: [
          { sender_id: userId, receiver_id: contactId },
          { sender_id: contactId, receiver_id: userId },
        ],
      },
      orderBy: { created_at: 'asc' },
    });
  },

  /**
   * Mark all messages from a contact as read (when the user opens the thread).
   */
  async markAsRead(userId: number, contactId: number) {
    await prisma.messages.updateMany({
      where: {
        receiver_id: userId,
        sender_id: contactId,
        is_read: false,
      },
      data: { is_read: true },
    });
  },

  /**
   * Build the inbox: one entry per unique contact, showing the latest message.
   */
  async getUserConversations(userId: number): Promise<ConversationSummary[]> {
    const messages = await prisma.messages.findMany({
      where: {
        OR: [{ receiver_id: userId }, { sender_id: userId }],
      },
      orderBy: { created_at: 'desc' },
    });

    if (messages.length === 0) return [];

    // Collect unique contact IDs
    const contactIds = new Set<number>();
    for (const msg of messages) {
      const contactId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (contactId !== userId) {
        contactIds.add(contactId);
      }
    }

    // Fetch contact details (full_name, email)
    const contacts = await prisma.users.findMany({
      where: { id: { in: Array.from(contactIds) } },
      select: { id: true, full_name: true, email: true },
    });

    const contactMap = new Map<number, { id: number; full_name: string; email: string }>(
      contacts.map((u: { id: number; full_name: string; email: string }) => [u.id, u])
    );

    // Group by contact, keep only the latest message per contact
    const conversationMap = new Map<number, ConversationSummary>();

    for (const msg of messages) {
      const contactId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (contactId === userId) continue;

      if (!conversationMap.has(contactId)) {
        const user = contactMap.get(contactId);
        conversationMap.set(contactId, {
          contact_id: contactId,
          contact_name: user?.full_name || 'Unknown',
          contact_email: user?.email || '',
          latest_message: msg.message_text,
          latest_message_at: msg.created_at,
          unread_count: msg.receiver_id === userId && !msg.is_read ? 1 : 0,
          product_id: msg.product_id,
        });
      } else {
        const entry = conversationMap.get(contactId)!;
        if (msg.receiver_id === userId && !msg.is_read) {
          entry.unread_count += 1;
        }
      }
    }

    return Array.from(conversationMap.values());
  },

  /**
   * Get the total count of unread messages for a user.
   */
  async getUnreadCount(userId: number): Promise<number> {
    return prisma.messages.count({
      where: {
        receiver_id: userId,
        is_read: false,
      },
    });
  },
};

export default MessageModel;
