import type { Context } from 'hono';
import type { PrismaClient } from '@prisma/client';
import type { AppContext } from '../types/context.js';
import MessageModel from '../models/messageModel.js';
import { isBrokeredCategory } from '../utils/brokeredCategories.js';

/**
 * Resolve the receiver for a product-based message.
 * - Brokered categories (Vehicles, Property & Land, Heavy Machinery) → Admin (broker)
 * - All other categories (Electronics, Fashion, Food, etc.) → Seller directly
 */
async function resolveProductReceiver(
  prisma: PrismaClient,
  productId: number
): Promise<{ receiverId: number; error?: string }> {
  const product = await prisma.products.findUnique({
    where: { id: productId },
    include: { categories: { select: { name: true, slug: true } } },
  });

  if (!product) {
    return { receiverId: 0, error: 'Product not found.' };
  }

  if (!product.seller_id) {
    return { receiverId: 0, error: 'This product has no associated seller.' };
  }

  const categoryName = product.categories?.name || '';
  const categorySlug = product.categories?.slug || '';

  if (isBrokeredCategory(categoryName, categorySlug)) {
    // Route to admin for brokered high-value categories
    // Target the primary admin (seberbel@gmail.com) first, with fallback to any available admin
    const adminUser =
      (await prisma.users.findFirst({
        where: { role: 'admin', email: 'seberbel@gmail.com' },
      })) ||
      (await prisma.users.findFirst({
        where: { role: 'admin' },
      }));
    if (!adminUser) {
      return { receiverId: 0, error: 'No admin available to handle this request.' };
    }
    return { receiverId: adminUser.id };
  }

  return { receiverId: product.seller_id };
}

/**
 * POST /api/messages/send
 * Send a message. If product_id is provided and no receiver_id, auto-resolve the receiver.
 */
export const sendMessage = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ success: false, message: 'Authentication required.' }, 401);
    }

    const senderId = Number(user.id);
    const body = await c.req.json().catch(() => ({}));
    const { product_id, order_id, message_text, receiver_id } = body;

    if (!message_text || typeof message_text !== 'string' || !message_text.trim()) {
      return c.json({ success: false, message: 'Message text is required.' }, 400);
    }

    let targetReceiverId: number;
    let productIdNum: number | null = null;

    if (receiver_id) {
      // Direct message to a known user (reply in existing thread)
      targetReceiverId = Number(receiver_id);
      if (product_id) {
        productIdNum = Number(product_id);
      }
    } else if (product_id) {
      // First contact — resolve receiver from product
      productIdNum = Number(product_id);
      const userRole = user.role?.toLowerCase();
      const asCustomer = body.as_customer === true;
      if ((userRole === 'admin' || userRole === 'super_admin') && !receiver_id && !asCustomer) {
        const initialMsg = await prisma.messages.findFirst({
          where: { product_id: productIdNum, NOT: { sender_id: senderId } },
          orderBy: { created_at: 'asc' },
        });
        if (initialMsg) {
          targetReceiverId = initialMsg.sender_id;
        } else {
          const resolved = await resolveProductReceiver(prisma, productIdNum);
          if (resolved.error) {
            return c.json({ success: false, message: resolved.error }, 404);
          }
          targetReceiverId = resolved.receiverId;
        }
      } else {
        const resolved = await resolveProductReceiver(prisma, productIdNum);
        if (resolved.error) {
          return c.json({ success: false, message: resolved.error }, 404);
        }
        targetReceiverId = resolved.receiverId;
      }
    } else {
      return c.json({
        success: false,
        message: 'Either product_id or receiver_id is required.',
      }, 400);
    }

    if (targetReceiverId === senderId) {
      return c.json({ success: false, message: 'You cannot send a message to yourself.' }, 400);
    }

    const message = await MessageModel.create(prisma, {
      sender_id: senderId,
      receiver_id: targetReceiverId,
      product_id: productIdNum,
      order_id: order_id ? Number(order_id) : null,
      message_text: message_text.trim(),
    });

    return c.json({
      success: true,
      message: 'Message sent successfully.',
      data: {
        message_id: message.id,
        receiver_id: targetReceiverId,
        product_id: productIdNum,
      },
    }, 201);
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ success: false, message: 'Server error while sending message.' }, 500);
  }
};

/**
 * GET /api/messages/inbox
 * List all conversations for the authenticated user (inbox view).
 */
export const getConversationsList = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ success: false, message: 'Authentication required.' }, 401);
    }

    const userId = Number(user.id);
    const conversations = await MessageModel.getUserConversations(prisma, userId);

    return c.json({ success: true, data: conversations }, 200);
  } catch (error) {
    console.error('Error getting conversations list:', error);
    return c.json({ success: false, message: 'Failed to load conversations.' }, 500);
  }
};

/**
 * GET /api/messages/thread/:contactId
 * Get the full message thread with a specific contact. Also marks messages as read.
 */
export const getConversation = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ success: false, message: 'Authentication required.' }, 401);
    }

    const currentUserId = Number(user.id);
    const contactId = Number(c.req.param('contactId'));

    if (!contactId || isNaN(contactId)) {
      return c.json({ success: false, message: 'Valid contact ID is required.' }, 400);
    }

    const messages = await MessageModel.getConversation(prisma, currentUserId, contactId);
    await MessageModel.markAsRead(prisma, currentUserId, contactId);

    return c.json({ success: true, data: messages }, 200);
  } catch (error) {
    console.error('Error getting conversation:', error);
    return c.json({ success: false, message: 'Failed to load conversation.' }, 500);
  }
};

/**
 * GET /api/messages/chat/:productId
 * Get the conversation for a specific product (buyer side or broker admin).
 * Resolves the contact automatically from the product's category/seller.
 */
export const getConversationByProduct = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ success: false, message: 'Authentication required.' }, 401);
    }

    const productId = Number(c.req.param('productId'));
    const currentUserId = Number(user.id);
    const userRole = user.role?.toLowerCase();

    if (!productId || isNaN(productId)) {
      return c.json({ success: false, message: 'Valid product ID is required.' }, 400);
    }

    // If user is an admin acting as the broker for this brokered deal
    if (userRole === 'admin' || userRole === 'super_admin') {
      const messages = await prisma.messages.findMany({
        where: { product_id: productId },
        orderBy: { created_at: 'asc' },
      });
      return c.json({ success: true, data: messages }, 200);
    }

    const resolved = await resolveProductReceiver(prisma, productId);
    if (resolved.error) {
      return c.json({ success: false, message: resolved.error }, 404);
    }

    const messages = await MessageModel.getConversationByProduct(
      prisma,
      currentUserId,
      resolved.receiverId,
      productId,
    );

    return c.json({ success: true, data: messages }, 200);
  } catch (error) {
    console.error('Error in getConversationByProduct:', error);
    return c.json({ success: false, message: 'Failed to load messages.' }, 500);
  }
};

/**
 * GET /api/messages/unread-count
 * Return the number of unread messages for the authenticated user.
 */
export const getUnreadBadgeCount = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ success: false, message: 'Authentication required.' }, 401);
    }

    const userId = Number(user.id);
    const count = await MessageModel.getUnreadCount(prisma, userId);

    return c.json({ success: true, unread_count: count }, 200);
  } catch (error) {
    console.error('Error getting unread count:', error);
    return c.json({ success: false, message: 'Failed to get unread count.' }, 500);
  }
};

const messageController = {
  sendMessage,
  getConversationsList,
  getConversation,
  getConversationByProduct,
  getUnreadBadgeCount,
};

export default messageController;
