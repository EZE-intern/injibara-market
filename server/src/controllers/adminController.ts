import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { isBrokeredCategory } from '../utils/brokeredCategories.js';
import { products_status } from '@prisma/client';

interface BrokerInquiryMeta {
  status?: string;
  appointment_date?: string | null;
}

// In-memory state tracking for broker inquiries (pipeline status & appointment dates)
const brokerInquiryState = new Map<string, BrokerInquiryMeta>();

function isUserAdmin(role?: string | null): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return r === 'admin' || r === 'super_admin';
}

export const adminController = {
  /**
   * GET /api/admin/overview
   * Returns high-level metrics for active listings, pending deals, stores, and users.
   */
  async getOverview(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const [totalActiveListings, totalStores, totalRegisteredUsers, pendingInquiries] =
        await Promise.all([
          prisma.products.count({
            where: { is_active: true, deleted_at: null },
          }),
          prisma.stores.count({
            where: { deleted_at: null },
          }),
          prisma.users.count({
            where: { deleted_at: null },
          }),
          prisma.messages.count({
            where: { product_id: { not: null }, is_read: false },
          }),
        ]);

      return res.json({
        success: true,
        data: {
          totalActiveListings,
          pendingBrokerInquiries: pendingInquiries,
          totalStores,
          totalRegisteredUsers,
        },
      });
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      return res.status(500).json({ success: false, message: 'Failed to load overview data.' });
    }
  },

  /**
   * GET /api/admin/broker-inquiries
   * Returns brokered deal requests deduplicated per (product_id, buyer_id).
   * Ensures admin replies do NOT create new inquiry rows.
   */
  async getBrokerInquiries(req: AuthRequest, res: Response): Promise<Response> {
    try {
      // Find all messages linked to products in chronological order
      const messages = await prisma.messages.findMany({
        where: {
          product_id: { not: null },
        },
        include: {
          products: {
            include: {
              categories: true,
              users: true,
              product_images: { take: 1 },
            },
          },
          users_messages_sender_idTousers: true,
          users_messages_receiver_idTousers: true,
        },
        orderBy: { created_at: 'asc' },
        take: 500,
      });

      // Filter to only Tier 1 brokered categories (Property & Land, Vehicles & Transport, Heavy Machinery)
      const brokeredMessages = messages.filter((item) => {
        const catName = item.products?.categories?.name;
        const catSlug = item.products?.categories?.slug;
        return isBrokeredCategory(catName, catSlug);
      });

      // Group messages by (product_id, buyer_id)
      // Key format: `${productId}_${buyerId}`
      const groups = new Map<string, {
        id: number;
        productId: number;
        buyerId: number;
        buyer: (typeof brokeredMessages)[0]['users_messages_sender_idTousers'] | null;
        seller: (typeof brokeredMessages)[0]['users_messages_sender_idTousers'] | null;
        product: (typeof brokeredMessages)[0]['products'];
        created_at: Date;
        initial_message_text: string;
        latest_message_text: string;
        latest_message_at: Date;
        has_admin_reply: boolean;
        is_read: boolean;
      }>();

      for (const msg of brokeredMessages) {
        if (!msg.product_id) continue;

        const senderIsAdmin = isUserAdmin(msg.users_messages_sender_idTousers?.role);
        const receiverIsAdmin = isUserAdmin(msg.users_messages_receiver_idTousers?.role);

        // Determine who the buyer is in this message:
        // If sender is not admin, sender is the buyer.
        // If sender is admin, receiver is the buyer.
        let buyerId: number;
        let buyer: (typeof brokeredMessages)[0]['users_messages_sender_idTousers'] | null;

        if (!senderIsAdmin) {
          buyerId = msg.sender_id;
          buyer = msg.users_messages_sender_idTousers;
        } else if (!receiverIsAdmin) {
          buyerId = msg.receiver_id;
          buyer = msg.users_messages_receiver_idTousers;
        } else {
          // Both sender and receiver are admins; skip internal notes
          continue;
        }

        const groupKey = `${msg.product_id}_${buyerId}`;
        const existing = groups.get(groupKey);

        if (!existing) {
          groups.set(groupKey, {
            id: msg.id,
            productId: msg.product_id,
            buyerId,
            buyer,
            seller: msg.products?.users ?? null,
            product: msg.products,
            created_at: msg.created_at,
            initial_message_text: msg.message_text,
            latest_message_text: msg.message_text,
            latest_message_at: msg.created_at,
            has_admin_reply: senderIsAdmin,
            is_read: Boolean(msg.is_read),
          });
        } else {
          if (senderIsAdmin) {
            existing.has_admin_reply = true;
          } else {
            // It's a message from the buyer.
            // If the earliest message was an admin reply, adopt this buyer's message as the initial inquiry
            if (isUserAdmin(existing.buyer?.role)) {
              existing.id = msg.id;
              existing.buyer = buyer;
              existing.initial_message_text = msg.message_text;
            }
          }

          existing.latest_message_text = msg.message_text;
          existing.latest_message_at = msg.created_at;
          if (msg.is_read) {
            existing.is_read = true;
          }
        }
      }

      // Convert groups to formatted inquiries
      const formatted = Array.from(groups.values()).map((item) => {
        const groupKey = `${item.productId}_${item.buyerId}`;
        const meta = brokerInquiryState.get(groupKey) || brokerInquiryState.get(String(item.id));

        let status = 'NEW';
        if (meta?.status) {
          status = meta.status;
        } else if (item.has_admin_reply) {
          status = 'ASSIGNED';
        } else if (item.is_read) {
          status = 'ASSIGNED';
        }

        return {
          id: item.id,
          status,
          created_at: item.created_at.toISOString(),
          latest_activity_at: item.latest_message_at.toISOString(),
          appointment_date: meta?.appointment_date ?? null,
          message_text: item.initial_message_text,
          buyer_id: item.buyerId,
          receiver_id: item.buyerId,
          product: item.product
            ? {
                id: item.product.id,
                name: item.product.name,
                price: Number(item.product.price),
                image: item.product.product_images?.[0]?.image_url || item.product.image || null,
                category: item.product.categories
                  ? { name: item.product.categories.name }
                  : null,
              }
            : null,
          buyer: item.buyer
            ? {
                id: item.buyer.id,
                full_name: item.buyer.full_name,
                phone: item.buyer.phone,
                email: item.buyer.email,
              }
            : null,
          seller: item.seller
            ? {
                id: item.seller.id,
                full_name: item.seller.full_name,
                phone: item.seller.phone,
              }
            : null,
        };
      });

      // Sort by newest activity first
      formatted.sort((a, b) => new Date(b.latest_activity_at).getTime() - new Date(a.latest_activity_at).getTime());

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error('Error fetching broker inquiries:', error);
      return res.status(500).json({ success: false, message: 'Failed to load inquiries.' });
    }
  },

  /**
   * GET /api/admin/broker-inquiries/:id
   */
  async getBrokerInquiryById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const item = await prisma.messages.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              categories: true,
              users: true,
              product_images: { take: 1 },
            },
          },
          users_messages_sender_idTousers: true,
          users_messages_receiver_idTousers: true,
        },
      });

      if (!item) {
        return res.status(404).json({ success: false, message: 'Inquiry not found.' });
      }

      const senderIsAdmin = isUserAdmin(item.users_messages_sender_idTousers?.role);
      const buyer = senderIsAdmin ? item.users_messages_receiver_idTousers : item.users_messages_sender_idTousers;
      const buyerId = senderIsAdmin ? item.receiver_id : item.sender_id;

      const groupKey = `${item.product_id}_${buyerId}`;
      const meta = brokerInquiryState.get(groupKey) || brokerInquiryState.get(String(item.id));

      let status = 'NEW';
      if (meta?.status) {
        status = meta.status;
      } else if (item.is_read) {
        status = 'ASSIGNED';
      }

      return res.json({
        success: true,
        data: {
          id: item.id,
          status,
          created_at: item.created_at.toISOString(),
          appointment_date: meta?.appointment_date ?? null,
          message_text: item.message_text,
          buyer_id: buyerId,
          receiver_id: item.receiver_id,
          product: item.products
            ? {
                id: item.products.id,
                name: item.products.name,
                price: Number(item.products.price),
                image: item.products.product_images?.[0]?.image_url || item.products.image || null,
                category: item.products.categories
                  ? { name: item.products.categories.name }
                  : null,
              }
            : null,
          buyer: buyer
            ? {
                id: buyer.id,
                full_name: buyer.full_name,
                phone: buyer.phone,
                email: buyer.email,
              }
            : null,
          seller: item.products?.users
            ? {
                id: item.products.users.id,
                full_name: item.products.users.full_name,
                phone: item.products.users.phone,
              }
            : null,
        },
      });
    } catch (error) {
      console.error('Error fetching inquiry details:', error);
      return res.status(500).json({ success: false, message: 'Failed to load inquiry details.' });
    }
  },

  /**
   * GET /api/admin/broker-inquiries/:id/messages
   * Returns all conversation messages between buyer and admin for this inquiry.
   */
  async getInquiryMessages(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const inquiry = await prisma.messages.findUnique({
        where: { id },
        include: {
          products: {
            include: { categories: true },
          },
          users_messages_sender_idTousers: {
            select: { id: true, full_name: true, role: true },
          },
        },
      });

      if (!inquiry) {
        return res.status(404).json({ success: false, message: 'Inquiry not found.' });
      }

      const productId = inquiry.product_id;
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Inquiry has no associated product.' });
      }

      const senderIsAdmin = isUserAdmin(inquiry.users_messages_sender_idTousers?.role);
      const buyerId = senderIsAdmin ? inquiry.receiver_id : inquiry.sender_id;

      // Fetch all messages for this product between buyer and admin
      const messages = await prisma.messages.findMany({
        where: {
          product_id: productId,
          OR: [
            { sender_id: buyerId },
            { receiver_id: buyerId },
          ],
        },
        include: {
          users_messages_sender_idTousers: {
            select: { id: true, full_name: true, role: true },
          },
          users_messages_receiver_idTousers: {
            select: { id: true, full_name: true, role: true },
          },
        },
        orderBy: { created_at: 'asc' },
      });

      // Mark buyer's incoming unread messages as read
      await prisma.messages.updateMany({
        where: {
          product_id: productId,
          sender_id: buyerId,
          is_read: false,
        },
        data: { is_read: true },
      });

      return res.json({
        success: true,
        count: messages.length,
        data: messages.map((m) => ({
          id: m.id,
          message_text: m.message_text,
          sender_id: m.sender_id,
          receiver_id: m.receiver_id,
          product_id: m.product_id,
          is_read: m.is_read,
          created_at: m.created_at.toISOString(),
          sender: m.users_messages_sender_idTousers,
          receiver: m.users_messages_receiver_idTousers,
        })),
      });
    } catch (error) {
      console.error('Error fetching inquiry messages:', error);
      return res.status(500).json({ success: false, message: 'Failed to load conversation.' });
    }
  },

  /**
   * POST /api/admin/broker-inquiries/:id/messages
   * Send a reply from admin to the buyer for this brokered inquiry.
   */
  async sendInquiryReply(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { message_text } = req.body;

      if (!message_text || typeof message_text !== 'string' || !message_text.trim()) {
        return res.status(400).json({ success: false, message: 'Message text is required.' });
      }

      const inquiry = await prisma.messages.findUnique({
        where: { id },
        include: {
          products: {
            include: { categories: true },
          },
          users_messages_sender_idTousers: {
            select: { id: true, full_name: true, role: true },
          },
        },
      });

      if (!inquiry || !inquiry.product_id) {
        return res.status(404).json({ success: false, message: 'Inquiry not found.' });
      }

      const adminId = Number(req.user?.id);
      const senderIsAdmin = isUserAdmin(inquiry.users_messages_sender_idTousers?.role);
      const buyerId = senderIsAdmin ? inquiry.receiver_id : inquiry.sender_id;

      const createdMessage = await prisma.messages.create({
        data: {
          sender_id: adminId,
          receiver_id: buyerId,
          product_id: inquiry.product_id,
          message_text: message_text.trim(),
          is_read: false,
        },
        include: {
          users_messages_sender_idTousers: {
            select: { id: true, full_name: true, role: true },
          },
        },
      });

      // Mark the original inquiry as read / assigned
      if (!inquiry.is_read) {
        await prisma.messages.update({
          where: { id: inquiry.id },
          data: { is_read: true },
        });
      }

      // Automatically advance status to ASSIGNED in metadata if still NEW or unassigned
      const groupKey = `${inquiry.product_id}_${buyerId}`;
      const existingMeta = brokerInquiryState.get(groupKey) || brokerInquiryState.get(String(id));
      if (!existingMeta?.status || existingMeta.status === 'NEW') {
        const updatedMeta: BrokerInquiryMeta = { ...existingMeta, status: 'ASSIGNED' };
        brokerInquiryState.set(groupKey, updatedMeta);
        brokerInquiryState.set(String(id), updatedMeta);
      }

      return res.status(201).json({
        success: true,
        message: 'Reply sent successfully.',
        data: {
          id: createdMessage.id,
          message_text: createdMessage.message_text,
          sender_id: createdMessage.sender_id,
          receiver_id: createdMessage.receiver_id,
          product_id: createdMessage.product_id,
          is_read: createdMessage.is_read,
          created_at: createdMessage.created_at.toISOString(),
          sender: createdMessage.users_messages_sender_idTousers,
        },
      });
    } catch (error) {
      console.error('Error sending inquiry reply:', error);
      return res.status(500).json({ success: false, message: 'Failed to send reply.' });
    }
  },

  /**
   * PUT /api/admin/broker-inquiries/:id/status
   */
  async updateBrokerInquiryStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const inquiry = await prisma.messages.findUnique({
        where: { id },
        include: {
          users_messages_sender_idTousers: {
            select: { id: true, role: true },
          },
        },
      });

      if (inquiry && inquiry.product_id) {
        const senderIsAdmin = isUserAdmin(inquiry.users_messages_sender_idTousers?.role);
        const buyerId = senderIsAdmin ? inquiry.receiver_id : inquiry.sender_id;
        const groupKey = `${inquiry.product_id}_${buyerId}`;
        const existing = brokerInquiryState.get(groupKey) || brokerInquiryState.get(String(id)) || {};
        brokerInquiryState.set(groupKey, { ...existing, status });
        brokerInquiryState.set(String(id), { ...existing, status });
      }

      await prisma.messages.update({
        where: { id },
        data: { is_read: status === 'MEDIATED' || status === 'CLOSED' },
      });

      return res.json({
        success: true,
        message: 'Inquiry status updated.',
        data: { id, status },
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update status.' });
    }
  },

  /**
   * PUT /api/admin/broker-inquiries/:id/appointment
   */
  async setBrokerAppointment(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { appointment_date } = req.body;

      const inquiry = await prisma.messages.findUnique({
        where: { id },
        include: {
          users_messages_sender_idTousers: {
            select: { id: true, role: true },
          },
        },
      });

      if (inquiry && inquiry.product_id) {
        const senderIsAdmin = isUserAdmin(inquiry.users_messages_sender_idTousers?.role);
        const buyerId = senderIsAdmin ? inquiry.receiver_id : inquiry.sender_id;
        const groupKey = `${inquiry.product_id}_${buyerId}`;
        const existing = brokerInquiryState.get(groupKey) || brokerInquiryState.get(String(id)) || {};
        brokerInquiryState.set(groupKey, { ...existing, status: 'APPOINTMENT_SCHEDULED', appointment_date });
        brokerInquiryState.set(String(id), { ...existing, status: 'APPOINTMENT_SCHEDULED', appointment_date });
      }

      return res.json({
        success: true,
        message: 'Appointment scheduled.',
        data: { id, status: 'APPOINTMENT_SCHEDULED', appointment_date },
      });
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      return res.status(500).json({ success: false, message: 'Failed to schedule appointment.' });
    }
  },

  /**
   * GET /api/admin/products
   * Returns all products with sellers, categories, and image angles.
   */
  async getProducts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const products = await prisma.products.findMany({
        where: { deleted_at: null },
        include: {
          product_images: {
            orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }],
          },
          categories: true,
          users: true,
        },
        orderBy: { created_at: 'desc' },
      });

      const formatted = products.map((p) => {
        let statusStr = 'PENDING';
        if (p.status) {
          statusStr = p.status.toUpperCase();
        } else if (p.is_active) {
          statusStr = 'APPROVED';
        }

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          discount_price: p.discount_price ? Number(p.discount_price) : null,
          stock: p.stock ?? 0,
          status: statusStr,
          image: p.product_images?.[0]?.image_url || p.image || null,
          images: p.product_images.map((img) => ({
            id: img.id,
            url: img.image_url,
            angle: img.side_angle,
          })),
          seller: p.users
            ? {
                id: p.users.id,
                full_name: p.users.full_name,
                phone: p.users.phone,
              }
            : null,
          category: p.categories
            ? {
                id: p.categories.id,
                name: p.categories.name,
              }
            : null,
          created_at: p.created_at.toISOString(),
          updated_at: p.updated_at.toISOString(),
        };
      });

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error('Error fetching admin products:', error);
      return res.status(500).json({ success: false, message: 'Failed to load products.' });
    }
  },

  /**
   * PUT /api/admin/products/:id/status
   */
  async updateProductStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const normalizedStatus = (status || '').toLowerCase() as products_status;
      const isApproved = normalizedStatus === 'approved';

      const updated = await prisma.products.update({
        where: { id },
        data: {
          status: normalizedStatus in products_status ? normalizedStatus : undefined,
          is_active: isApproved,
        },
      });

      return res.json({
        success: true,
        message: 'Product status updated.',
        data: {
          id: updated.id,
          name: updated.name,
          status: (status || 'APPROVED').toUpperCase(),
        },
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update product status.' });
    }
  },

  /**
   * PUT /api/admin/products/:id/reject
   */
  async rejectProduct(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { reason } = req.body;

      const updated = await prisma.products.update({
        where: { id },
        data: {
          status: 'rejected',
          is_active: false,
        },
      });

      return res.json({
        success: true,
        message: 'Product rejected.',
        data: {
          id: updated.id,
          name: updated.name,
          status: 'REJECTED',
          reason,
        },
      });
    } catch (error) {
      console.error('Error rejecting product:', error);
      return res.status(500).json({ success: false, message: 'Failed to reject product.' });
    }
  },

  /**
   * DELETE /api/admin/products/:id
   */
  async deleteProduct(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);

      await prisma.products.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          is_active: false,
        },
      });

      return res.json({
        success: true,
        message: 'Product deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete product.' });
    }
  },

  /**
   * GET /api/admin/stores
   */
  async getStores(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const stores = await prisma.stores.findMany({
        where: { deleted_at: null },
        include: {
          users: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      const formatted = stores.map((s) => ({
        id: s.id,
        name: s.store_name,
        description: s.description,
        owner: s.users
          ? {
              id: s.users.id,
              full_name: s.users.full_name,
              email: s.users.email,
              phone: s.users.phone,
            }
          : null,
        product_count: s._count?.products || 0,
        status: s.is_active ? 'APPROVED' : 'SUSPENDED',
        created_at: s.created_at.toISOString(),
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error('Error fetching admin stores:', error);
      return res.status(500).json({ success: false, message: 'Failed to load stores.' });
    }
  },

  /**
   * PUT /api/admin/stores/:id/status
   */
  async updateStoreStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const isApproved = status === 'APPROVED';

      const updated = await prisma.stores.update({
        where: { id },
        data: { is_active: isApproved },
      });

      return res.json({
        success: true,
        message: 'Store status updated.',
        data: {
          id: updated.id,
          name: updated.store_name,
          status,
        },
      });
    } catch (error) {
      console.error('Error updating store status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update store status.' });
    }
  },

  /**
   * GET /api/admin/categories
   */
  async getCategories(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const categories = await prisma.categories.findMany({
        where: { deleted_at: null },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      const formatted = categories.map((c) => ({
        id: c.id,
        name: c.name,
        name_am: null,
        slug: c.slug,
        description: c.description,
        icon: null,
        tier: isBrokeredCategory(c.name, c.slug) ? 'TIER_1' : 'TIER_2',
        product_count: c._count?.products || 0,
        is_active: true,
        created_at: c.created_at.toISOString(),
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      return res.status(500).json({ success: false, message: 'Failed to load categories.' });
    }
  },

  /**
   * POST /api/admin/categories
   */
  async createCategory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { name, slug, description, tier } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ success: false, message: 'Name and slug are required.' });
      }

      const newCategory = await prisma.categories.create({
        data: {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description?.trim() || null,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: {
          id: newCategory.id,
          name: newCategory.name,
          name_am: null,
          slug: newCategory.slug,
          description: newCategory.description,
          icon: null,
          tier: tier || (isBrokeredCategory(newCategory.name, newCategory.slug) ? 'TIER_1' : 'TIER_2'),
          product_count: 0,
          is_active: true,
          created_at: newCategory.created_at.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ success: false, message: 'Failed to create category.' });
    }
  },

  /**
   * PUT /api/admin/categories/:id
   */
  async updateCategory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { name, slug, description, tier } = req.body;

      const updated = await prisma.categories.update({
        where: { id },
        data: {
          name: name?.trim(),
          slug: slug?.trim().toLowerCase(),
          description: description?.trim(),
        },
      });

      return res.json({
        success: true,
        message: 'Category updated.',
        data: {
          id: updated.id,
          name: updated.name,
          name_am: null,
          slug: updated.slug,
          description: updated.description,
          icon: null,
          tier: tier || (isBrokeredCategory(updated.name, updated.slug) ? 'TIER_1' : 'TIER_2'),
          product_count: 0,
          is_active: true,
          created_at: updated.created_at.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ success: false, message: 'Failed to update category.' });
    }
  },

  /**
   * PUT /api/admin/categories/:id/status
   */
  async updateCategoryStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { is_active } = req.body;

      const updated = await prisma.categories.update({
        where: { id },
        data: {
          deleted_at: is_active ? null : new Date(),
        },
      });

      return res.json({
        success: true,
        message: 'Category status updated.',
        data: {
          id: updated.id,
          name: updated.name,
          is_active: Boolean(is_active),
        },
      });
    } catch (error) {
      console.error('Error updating category status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update category status.' });
    }
  },

  /**
   * GET /api/admin/users
   */
  async getUsers(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const users = await prisma.users.findMany({
        orderBy: { created_at: 'desc' },
      });

      const formatted = users.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        role: u.role ? u.role.toUpperCase() : 'CUSTOMER',
        status: u.deleted_at ? 'SUSPENDED' : 'ACTIVE',
        created_at: u.created_at.toISOString(),
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return res.status(500).json({ success: false, message: 'Failed to load users.' });
    }
  },

  /**
   * PUT /api/admin/users/:id/status
   */
  async updateUserStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const isSuspended = status === 'SUSPENDED';

      const updated = await prisma.users.update({
        where: { id },
        data: {
          deleted_at: isSuspended ? new Date() : null,
        },
      });

      return res.json({
        success: true,
        message: 'User status updated.',
        data: {
          id: updated.id,
          status,
        },
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update user status.' });
    }
  },

  /**
   * GET /api/admin/management/admins
   */
  async getStaffAdmins(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const admins = await prisma.users.findMany({
        where: { role: 'admin' },
        orderBy: { created_at: 'desc' },
      });

      const formatted = admins.map((a) => ({
        id: a.id,
        full_name: a.full_name,
        email: a.email,
        phone: a.phone,
        role: 'ADMIN',
        status: a.deleted_at ? 'SUSPENDED' : 'ACTIVE',
        created_at: a.created_at.toISOString(),
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error('Error fetching staff admins:', error);
      return res.status(500).json({ success: false, message: 'Failed to load administrators.' });
    }
  },

  /**
   * POST /api/admin/management/admins
   */
  async createStaffAdmin(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { full_name, email, password, phone } = req.body;

      if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
      }

      const existing = await prisma.users.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const created = await prisma.users.create({
        data: {
          full_name: full_name.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          phone: phone?.trim() || null,
          role: 'admin',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Administrator created successfully.',
        data: {
          id: created.id,
          full_name: created.full_name,
          email: created.email,
          phone: created.phone,
          role: 'ADMIN',
          status: 'ACTIVE',
          created_at: created.created_at.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error creating administrator:', error);
      return res.status(500).json({ success: false, message: 'Failed to create administrator.' });
    }
  },

  /**
   * PUT /api/admin/management/admins/:id/status
   */
  async updateStaffAdminStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const isSuspended = status === 'SUSPENDED';

      const updated = await prisma.users.update({
        where: { id },
        data: {
          deleted_at: isSuspended ? new Date() : null,
        },
      });

      return res.json({
        success: true,
        message: 'Admin status updated.',
        data: {
          id: updated.id,
          status,
        },
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update admin status.' });
    }
  },
};
