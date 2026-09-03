

import { Request, Response } from 'express';
import MessageModel from '../models/messageModel';
import prisma from '../lib/prisma';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number | string;
    [key: string]: any;
  };
}

interface SendMessageBody {
  product_id?: number | string;
  order_id?: number | string;
  message_text: string;
  receiver_id?: number | string;
}

const messageController = {
  // SEND MESSAGE 
  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'አልተፈቀደም (Unauthorized)። እባክዎ አስቀድመው ይግቡ።',
        });
      }

      const sender_id = Number(req.user.id);
      const { product_id, order_id, message_text, receiver_id }: SendMessageBody = req.body;

      if (!message_text || !message_text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'የመልዕክት ጽሁፍ ማስገባት ግዴታ ነው።',
        });
      }

      let targetReceiverId: number;
      let productIdNum: number | null = null;

      // Prioritize receiver_id if provided 
      if (receiver_id) {
        targetReceiverId = Number(receiver_id);
        if (product_id) {
          productIdNum = Number(product_id);
        }
      } 
      // Route based on Product Category if receiver_id is missing
      else if (product_id) {
        productIdNum = Number(product_id);

        const product = await prisma.products.findUnique({
          where: { id: productIdNum },
        });

        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'ምርቱ አልተገኘም።',
          });
        }

        const category = product.category_id
          ? await prisma.categories.findUnique({ where: { id: product.category_id } })
          : null;

        //  Home and garden, property, vehicle, sand and stone are to admin
        const adminCategories = ['home and garden', 'home & garden', 'property', 'vehicle', 'sand and stone'];
        const productCategory = category?.name ? category.name.toLowerCase().trim() : '';

        const isSpecialCategory = adminCategories.some((cat) => productCategory.includes(cat));

        if (isSpecialCategory) {
          const adminUser = await prisma.users.findFirst({
            where: { role: 'admin' },
          });

          if (!adminUser) {
            return res.status(400).json({
              success: false,
              message: 'የሲስተም አስተዳዳሪ (Admin) አልተገኘም።',
            });
          }

          targetReceiverId = Number(adminUser.id);
        } else {
          if (!product.seller_id) {
            return res.status(400).json({
              success: false,
              message: 'ይህ ምርት ሸጭ (seller) የለውም።',
            });
          }

          targetReceiverId = Number(product.seller_id);
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Product ID ወይም Receiver ID ማስገባት ግዴታ ነው።',
        });
      }

      console.log('--- MESSAGE DEBUG ---');
      console.log('Sender ID (Logged in user):', sender_id);
      console.log('Target Receiver ID:', targetReceiverId);
      console.log('Product ID:', productIdNum);

      if (targetReceiverId === sender_id) {
        return res.status(400).json({
          success: false,
          message: 'ለራስዎ መልዕክት መላክ አይችሉም።',
        });
      }

      const createdMessage = await prisma.messages.create({
        data: {
          sender_id,
          receiver_id: targetReceiverId,
          product_id: productIdNum,
          order_id: order_id ? Number(order_id) : null,
          message_text: message_text.trim(),
        },
      });
      const messageId = createdMessage.id;

      return res.status(201).json({
        success: true,
        message: 'መልዕክቱ በተሳካ ሁኔታ ተልኳል።',
        data: {
          message_id: messageId,
          receiver_id: targetReceiverId,
          product_id: productIdNum,
        },
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      return res.status(500).json({
        success: false,
        message: 'መልዕክት በመላክ ላይ የአገልጋይ ስህተት አጋጥሟል።',
        error: error?.message || 'Server error',
      });
    }
  },

  // GET CONVERSATION BY PRODUCT  buyer side
  async getConversationByProduct(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const productId = Number(req.params.productId);
      const currentUserId = Number(req.user.id);

      if (!productId || isNaN(productId)) {
        return res.status(400).json({ success: false, message: 'Valid Product ID is required' });
      }

      const product = await prisma.products.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const category = product.category_id
        ? await prisma.categories.findUnique({ where: { id: product.category_id } })
        : null;

      const adminCategories = ['home and garden', 'home & garden', 'property', 'vehicle', 'sand and stone'];
      const productCategory = category?.name ? category.name.toLowerCase().trim() : '';
      const isSpecialCategory = adminCategories.some((cat) => productCategory.includes(cat));

      let targetContactId: number;

      if (isSpecialCategory) {
        const adminUser = await prisma.users.findFirst({
          where: { role: 'admin' },
        });
        if (!adminUser) {
          return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        targetContactId = Number(adminUser.id);
      } else {
        const sellerId = Number(product.seller_id);
        if (!sellerId || isNaN(sellerId)) {
          return res.status(400).json({ success: false, message: 'Seller not found for this product' });
        }
        targetContactId = sellerId;
      }

      const conversation = await (MessageModel as any).getConversation(currentUserId, targetContactId);
      const messages = conversation.filter(
        (message: { product_id?: number | string | null }) => Number(message.product_id) === productId,
      );

      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      console.error('Error in getConversationByProduct:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load messages',
        error: error?.message || 'Server error',
      });
    }
  },

  // GET UNREAD COUNT 
  async getUnreadBadgeCount(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
      }

      const userId = Number(req.user.id);
      const count = await (MessageModel as any).getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        unread_count: count,
      });
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({
        success: false,
        message: 'ያልተነበቡ መልዕክቶች ብዛት ማግኘት አልተቻለም።',
        error: error?.message || 'Server error',
      });
    }
  },

  //  GET CONVERSATIONS LIST (Inbox)
  async getConversationsList(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
      }

      const userId = Number(req.user.id);
      const conversations = await (MessageModel as any).getUserConversations(userId);

      return res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error: any) {
      console.error('Error getting conversations list:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load conversations',
        error: error?.message || 'Server error',
      });
    }
  },

  //get conversetion thread
  
  async getConversation(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized.',
        });
      }

      const currentUserId = Number(req.user.id);
      const contactId = Number(req.params.contactId);

      if (!contactId || isNaN(contactId)) {
        return res.status(400).json({
          success: false,
          message: 'Contact ID is required.',
        });
      }

      const messages = await (MessageModel as any).getConversation(currentUserId, contactId);

      await MessageModel.markAsRead(currentUserId, contactId);

      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      console.error('Error getting conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'ውይይት ማግኘት አልተቻለም።',
        error: error?.message || 'Server error',
      });
    }
  },
};

export default messageController;













































































































































































































































































































































































