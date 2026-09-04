import { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
import MessageModel from '../models/messageModel.js';
import { prisma } from '../lib/prisma.js';

/**
 * Tier 1 High-Value Brokered Categories (Injibara Market Business Model):
 * Injibara Market acts as a broker for high-value capital assets to ensure trust,
 * legal compliance, and safe payment escrow:
 *   1. Property & Land (Real estate, farmland, commercial plots, residential houses)
 *   2. Vehicles & Transport (Cars, Bajaj, trucks, commercial vehicles, motorcycles)
 *   3. Heavy Machinery (Agricultural tractors, construction equipment, industrial machinery)
 *
 * For these categories, buyer inquiries are routed to the Admin brokerage desk
 * instead of connecting directly to the seller.
 */
export const BROKERED_CATEGORY_PATTERNS: RegExp[] = [
  // 1. Property & Land
  /\bproperty\b/i,
  /\bland\b/i,
  /\breal[\s_-]?estate\b/i,
  /\bfarmland\b/i,
  /\bplots?\b/i,
  /መሬት/,

  // 2. Vehicles & Transport
  /\bvehicles?\b/i,
  /\btransports?\b/i,
  /\bbajaj\b/i,
  /\bcars?\b/i,
  /\bmotorcycles?\b/i,
  /\btrucks?\b/i,
  /\bautomobiles?\b/i,
  /መኪና/,
  /ባጃጅ/,

  // 3. Heavy Machinery & Large Equipment
  /\bheavy[\s_-]?machinery\b/i,
  /\blarge[\s_-]?machinery\b/i,
  /\bmachinery?\b/i,
  /\bmachines?\b/i,
  /\bconstruction[\s_-]?materials?\b/i,
  /\bconstruction[\s_-]?machinery\b/i,
  /\bconstruction[\s_-]?equipments?\b/i,
  /\bindustrial[\s_-]?equipments?\b/i,
  /\btractors?\b/i,
  /\bexcavators?\b/i,
  /\bbulldozers?\b/i,
  /ማሽነሪ/,
];

/**
 * Check if a category name or slug matches any of the Tier 1 Brokered categories.
 */
export function isBrokeredCategory(categoryName?: string | null, categorySlug?: string | null): boolean {
  const combined = `${categoryName || ''} ${categorySlug || ''}`.trim();
  if (!combined) return false;

  return BROKERED_CATEGORY_PATTERNS.some((pattern) => pattern.test(combined));
}

/**
 * Resolve the receiver for a product-based message.
 * - Brokered categories (Vehicles, Property & Land, Heavy Machinery) → Admin (broker)
 * - All other categories (Electronics, Fashion, Food, etc.) → Seller directly
 */
async function resolveProductReceiver(productId: number): Promise<{ receiverId: number; error?: string }> {
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
    const adminUser = await prisma.users.findFirst({
      where: { role: 'admin' },
    });
    if (!adminUser) {
      return { receiverId: 0, error: 'No admin available to handle this request.' };
    }
    return { receiverId: adminUser.id };
  }

  return { receiverId: product.seller_id };
}

const messageController = {
  /**
   * POST /api/messages/send
   * Send a message. If product_id is provided and no receiver_id, auto-resolve the receiver.
   */
  async sendMessage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const senderId = Number(req.user.id);
      const { product_id, order_id, message_text, receiver_id } = req.body;

      if (!message_text || typeof message_text !== 'string' || !message_text.trim()) {
        return res.status(400).json({ success: false, message: 'Message text is required.' });
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
        const resolved = await resolveProductReceiver(productIdNum);
        if (resolved.error) {
          return res.status(404).json({ success: false, message: resolved.error });
        }
        targetReceiverId = resolved.receiverId;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either product_id or receiver_id is required.',
        });
      }

      if (targetReceiverId === senderId) {
        return res.status(400).json({ success: false, message: 'You cannot send a message to yourself.' });
      }

      const message = await MessageModel.create({
        sender_id: senderId,
        receiver_id: targetReceiverId,
        product_id: productIdNum,
        order_id: order_id ? Number(order_id) : null,
        message_text: message_text.trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully.',
        data: {
          message_id: message.id,
          receiver_id: targetReceiverId,
          product_id: productIdNum,
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ success: false, message: 'Server error while sending message.' });
    }
  },

  /**
   * GET /api/messages/inbox
   * List all conversations for the authenticated user (inbox view).
   */
  async getConversationsList(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const userId = Number(req.user.id);
      const conversations = await MessageModel.getUserConversations(userId);

      return res.status(200).json({ success: true, data: conversations });
    } catch (error) {
      console.error('Error getting conversations list:', error);
      return res.status(500).json({ success: false, message: 'Failed to load conversations.' });
    }
  },

  /**
   * GET /api/messages/thread/:contactId
   * Get the full message thread with a specific contact. Also marks messages as read.
   */
  async getConversation(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const currentUserId = Number(req.user.id);
      const contactId = Number(req.params.contactId);

      if (!contactId || isNaN(contactId)) {
        return res.status(400).json({ success: false, message: 'Valid contact ID is required.' });
      }

      const messages = await MessageModel.getConversation(currentUserId, contactId);
      await MessageModel.markAsRead(currentUserId, contactId);

      return res.status(200).json({ success: true, data: messages });
    } catch (error) {
      console.error('Error getting conversation:', error);
      return res.status(500).json({ success: false, message: 'Failed to load conversation.' });
    }
  },

  /**
   * GET /api/messages/chat/:productId
   * Get the conversation for a specific product (buyer side).
   * Resolves the contact automatically from the product's category/seller.
   */
  async getConversationByProduct(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const productId = Number(req.params.productId);
      const currentUserId = Number(req.user.id);

      if (!productId || isNaN(productId)) {
        return res.status(400).json({ success: false, message: 'Valid product ID is required.' });
      }

      const resolved = await resolveProductReceiver(productId);
      if (resolved.error) {
        return res.status(404).json({ success: false, message: resolved.error });
      }

      const messages = await MessageModel.getConversationByProduct(
        currentUserId,
        resolved.receiverId,
        productId,
      );

      return res.status(200).json({ success: true, data: messages });
    } catch (error) {
      console.error('Error in getConversationByProduct:', error);
      return res.status(500).json({ success: false, message: 'Failed to load messages.' });
    }
  },

  /**
   * GET /api/messages/unread-count
   * Return the number of unread messages for the authenticated user.
   */
  async getUnreadBadgeCount(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const userId = Number(req.user.id);
      const count = await MessageModel.getUnreadCount(userId);

      return res.status(200).json({ success: true, unread_count: count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({ success: false, message: 'Failed to get unread count.' });
    }
  },
};

export default messageController;
