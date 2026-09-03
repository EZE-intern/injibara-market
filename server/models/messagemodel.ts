
import prisma from '../lib/prisma';

export interface ICreateMessageParams {
  sender_id: number | string;
  receiver_id: number | string;
  product_id?: number | string | null;
  order_id?: number | string | null;
  message_text: string;
}

export const MessageModel = {
  // Create message
  async create({
    sender_id,
    receiver_id,
    product_id,
    order_id,
    message_text,
  }: ICreateMessageParams): Promise<number> {
    const message = await prisma.messages.create({
      data: {
        sender_id: Number(sender_id),
        receiver_id: Number(receiver_id),
        product_id: product_id ? Number(product_id) : null,
        order_id: order_id ? Number(order_id) : null,
        message_text,
        is_read: false,
      },
    });
    return message.id;
  },

  // Get conversation between two users
  async getConversation(userId: number | string, contactId: number | string) {
    const uId = Number(userId);
    const cId = Number(contactId);

    return prisma.messages.findMany({
      where: {
        OR: [
          { sender_id: uId, receiver_id: cId },
          { sender_id: cId, receiver_id: uId },
        ],
      },
      orderBy: { created_at: 'asc' },
    });
  },

  // Get messages by product (Buyer side)
  async getByProduct(productId: number | string, currentUserId: number, contactId: number) {
    return prisma.messages.findMany({
      where: {
        OR: [
          {
            product_id: Number(productId),
            OR: [
              { sender_id: currentUserId, receiver_id: contactId },
              { sender_id: contactId, receiver_id: currentUserId },
            ],
          },
          {
            product_id: null,
            OR: [
              { sender_id: currentUserId, receiver_id: contactId },
              { sender_id: contactId, receiver_id: currentUserId },
            ],
          },
        ],
      },
      orderBy: { created_at: 'asc' },
    });
  },

  // Mark as read
  async markAsRead(userId: number | string, contactId: number | string) {
    await prisma.messages.updateMany({
      where: {
        receiver_id: Number(userId),
        sender_id: Number(contactId),
        is_read: false,
      },
      data: { is_read: true },
    });
  },

  // Get conversations list (Inbox)
  async getUserConversations(userId: number | string) {
    const uId = Number(userId);

    const messages = await prisma.messages.findMany({
      where: {
        OR: [{ receiver_id: uId }, { sender_id: uId }],
      },
      orderBy: { created_at: 'desc' },
    });

    if (messages.length === 0) return [];

    // Collect unique contact IDs
    const contactIds = new Set<number>();
    for (const msg of messages) {
      const contactId = Number(
        msg.sender_id === uId ? msg.receiver_id : msg.sender_id
      );
      if (contactId && contactId !== uId) {
        contactIds.add(contactId);
      }
    }

    // Fetch users using full_name
    const contacts = await prisma.users.findMany({
      where: {
        id: { in: Array.from(contactIds) },
      },
      select: {
        id: true,
        full_name: true,
        email: true,
      },
    });

    const contactMap = new Map(contacts.map((u) => [u.id, u]));

    // Build the list
    const conversationMap = new Map<number, any>();

    for (const msg of messages) {
      const contactId = Number(
        msg.sender_id === uId ? msg.receiver_id : msg.sender_id
      );

      if (!contactId || contactId === uId) continue;

      if (!conversationMap.has(contactId)) {
        const user = contactMap.get(contactId);

        conversationMap.set(contactId, {
          contact_id: contactId,
          contact_name: user?.full_name || 'Unknown',
          contact_email: user?.email || '',
          latest_message: msg.message_text,
          latest_message_at: msg.created_at,
          message_count: 1,
          product_id: msg.product_id,
          is_read: msg.is_read,
        });
      } else {
        conversationMap.get(contactId).message_count += 1;
      }
    }

    const result = Array.from(conversationMap.values());
    return result;
  },

  // Unread count
  async getUnreadCount(userId: number | string): Promise<number> {
    return prisma.messages.count({
      where: {
        receiver_id: Number(userId),
        is_read: false,
      },
    });
  },
};

export default MessageModel;


























































































































































export default MessageModel;*/}
