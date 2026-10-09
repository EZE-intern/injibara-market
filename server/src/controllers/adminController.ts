import type { Context } from 'hono';
import type { AppContext } from '../types/context.js';
import { hashPassword } from '../utils/edgeCrypto.js';
import { isBrokeredCategory } from '../utils/brokeredCategories.js';
import { products_status } from '@prisma/client';
import { cache } from '../utils/cache.js';

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
  async getOverview(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
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

      return c.json({
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
      return c.json({ success: false, message: 'Failed to load overview data.' }, 500);
    }
  },

  /**
   * GET /api/admin/broker-inquiries
   * Returns brokered deal requests deduplicated per (product_id, buyer_id).
   * Ensures admin replies do NOT create new inquiry rows.
   */
  async getBrokerInquiries(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
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

      // Fetch persisted broker inquiry records from the database
      const dbRecords = await prisma.broker_inquiries.findMany().catch(() => []);
      const dbMap = new Map<string, { status: string; appointment_date: Date | null }>();
      for (const rec of dbRecords) {
        dbMap.set(`${rec.product_id}_${rec.buyer_id}`, {
          status: rec.status,
          appointment_date: rec.appointment_date,
        });
      }

      // Convert groups to formatted inquiries
      const formatted = Array.from(groups.values()).map((item) => {
        const groupKey = `${item.productId}_${item.buyerId}`;
        const dbMeta = dbMap.get(groupKey);
        const meta = brokerInquiryState.get(groupKey) || brokerInquiryState.get(String(item.id));

        let status = 'NEW';
        if (dbMeta?.status) {
          status = dbMeta.status;
        } else if (meta?.status) {
          status = meta.status;
        } else if (item.has_admin_reply) {
          status = 'ASSIGNED';
        } else if (item.is_read) {
          status = 'ASSIGNED';
        }

        const appointmentDate = dbMeta?.appointment_date
          ? dbMeta.appointment_date.toISOString()
          : meta?.appointment_date ?? null;

        return {
          id: item.id,
          status,
          created_at: item.created_at.toISOString(),
          latest_activity_at: item.latest_message_at.toISOString(),
          appointment_date: appointmentDate,
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

      return c.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error('Error fetching broker inquiries:', error);
      return c.json({ success: false, message: 'Failed to load inquiries.' }, 500);
    }
  },

  /**
   * GET /api/admin/broker-inquiries/:id
   */
  async getBrokerInquiryById(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
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
        return c.json({ success: false, message: 'Inquiry not found.' }, 404);
      }

      const senderIsAdmin = isUserAdmin(item.users_messages_sender_idTousers?.role);
      const buyer = senderIsAdmin ? item.users_messages_receiver_idTousers : item.users_messages_sender_idTousers;
      const buyerId = senderIsAdmin ? item.receiver_id : item.sender_id;

      const groupKey = `${item.product_id}_${buyerId}`;
      const dbRecord = item.product_id
        ? await prisma.broker_inquiries
            .findUnique({
              where: {
                product_id_buyer_id: {
                  product_id: item.product_id,
                  buyer_id: buyerId,
                },
              },
            })
            .catch(() => null)
        : null;

      const meta = brokerInquiryState.get(groupKey) || brokerInquiryState.get(String(item.id));

      let status = 'NEW';
      if (dbRecord?.status) {
        status = dbRecord.status;
      } else if (meta?.status) {
        status = meta.status;
      } else if (item.is_read) {
        status = 'ASSIGNED';
      }

      const appointmentDate = dbRecord?.appointment_date
        ? dbRecord.appointment_date.toISOString()
        : meta?.appointment_date ?? null;

      return c.json({
        success: true,
        data: {
          id: item.id,
          status,
          created_at: item.created_at.toISOString(),
          appointment_date: appointmentDate,
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
      return c.json({ success: false, message: 'Failed to load inquiry details.' }, 500);
    }
  },

  /**
   * GET /api/admin/broker-inquiries/:id/messages
   * Returns all conversation messages between buyer and admin for this inquiry.
   */
  async getInquiryMessages(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
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
        return c.json({ success: false, message: 'Inquiry not found.' }, 404);
      }

      const productId = inquiry.product_id;
      if (!productId) {
        return c.json({ success: false, message: 'Inquiry has no associated product.' }, 400);
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

      return c.json({
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
      return c.json({ success: false, message: 'Failed to load conversation.' }, 500);
    }
  },

  /**
   * POST /api/admin/broker-inquiries/:id/messages
   * Send a reply from admin to the buyer for this brokered inquiry.
   */
  async sendInquiryReply(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const user = c.get('user');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { message_text } = body;

      if (!message_text || typeof message_text !== 'string' || !message_text.trim()) {
        return c.json({ success: false, message: 'Message text is required.' }, 400);
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
        return c.json({ success: false, message: 'Inquiry not found.' }, 404);
      }

      const adminId = Number(user?.id);
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

      // Automatically advance status to ASSIGNED in metadata and database if still NEW or unassigned
      const groupKey = `${inquiry.product_id}_${buyerId}`;
      const existingMeta = brokerInquiryState.get(groupKey) || brokerInquiryState.get(String(id));
      if (!existingMeta?.status || existingMeta.status === 'NEW') {
        const updatedMeta: BrokerInquiryMeta = { ...existingMeta, status: 'ASSIGNED' };
        brokerInquiryState.set(groupKey, updatedMeta);
        brokerInquiryState.set(String(id), updatedMeta);

        await prisma.broker_inquiries
          .upsert({
            where: {
              product_id_buyer_id: {
                product_id: inquiry.product_id,
                buyer_id: buyerId,
              },
            },
            create: {
              product_id: inquiry.product_id,
              buyer_id: buyerId,
              status: 'ASSIGNED',
            },
            update: {
              status: 'ASSIGNED',
            },
          })
          .catch((err) => console.error('Failed to persist broker status on reply:', err));
      }

      return c.json({
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
      }, 201);
    } catch (error) {
      console.error('Error sending inquiry reply:', error);
      return c.json({ success: false, message: 'Failed to send reply.' }, 500);
    }
  },

  /**
   * PUT /api/admin/broker-inquiries/:id/status
   */
  async updateBrokerInquiryStatus(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { status } = body;

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

        await prisma.broker_inquiries
          .upsert({
            where: {
              product_id_buyer_id: {
                product_id: inquiry.product_id,
                buyer_id: buyerId,
              },
            },
            create: {
              product_id: inquiry.product_id,
              buyer_id: buyerId,
              status,
            },
            update: {
              status,
            },
          })
          .catch((err) => console.error('Failed to persist broker status:', err));
      }

      await prisma.messages.update({
        where: { id },
        data: { is_read: status === 'MEDIATED' || status === 'CLOSED' },
      });

      return c.json({
        success: true,
        message: 'Inquiry status updated.',
        data: { id, status },
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      return c.json({ success: false, message: 'Failed to update status.' }, 500);
    }
  },

  /**
   * PUT /api/admin/broker-inquiries/:id/appointment
   */
  async setBrokerAppointment(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { appointment_date } = body;

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

        await prisma.broker_inquiries
          .upsert({
            where: {
              product_id_buyer_id: {
                product_id: inquiry.product_id,
                buyer_id: buyerId,
              },
            },
            create: {
              product_id: inquiry.product_id,
              buyer_id: buyerId,
              status: 'APPOINTMENT_SCHEDULED',
              appointment_date: new Date(appointment_date),
            },
            update: {
              status: 'APPOINTMENT_SCHEDULED',
              appointment_date: new Date(appointment_date),
            },
          })
          .catch((err) => console.error('Failed to persist broker appointment:', err));
      }

      return c.json({
        success: true,
        message: 'Appointment scheduled.',
        data: { id, status: 'APPOINTMENT_SCHEDULED', appointment_date },
      });
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      return c.json({ success: false, message: 'Failed to schedule appointment.' }, 500);
    }
  },

  /**
   * GET /api/admin/products
   * Returns all products with sellers, categories, and image angles.
   */
  async getProducts(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const page = Math.max(1, Number(c.req.query('page')) || 1);
      const limit = Math.max(1, Math.min(100, Number(c.req.query('limit')) || 10));
      const skip = (page - 1) * limit;

      const where = { deleted_at: null };

      const [products, total] = await Promise.all([
        prisma.products.findMany({
          where,
          include: {
            product_images: {
              orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }],
            },
            categories: true,
            users: true,
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        prisma.products.count({ where }),
      ]);

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

      return c.json({
        success: true,
        count: formatted.length,
        data: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching admin products:', error);
      return c.json({ success: false, message: 'Failed to load products.' }, 500);
    }
  },

  /**
   * PUT /api/admin/products/:id/status
   */
  async updateProductStatus(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { status } = body;

      const normalizedStatus = (status || '').toLowerCase() as products_status;
      const isApproved = normalizedStatus === 'approved';

      const updated = await prisma.products.update({
        where: { id },
        data: {
          status: normalizedStatus in products_status ? normalizedStatus : undefined,
          is_active: isApproved,
        },
      });

      cache.invalidatePrefix('products:');
      cache.delete(`product:${id}`);

      return c.json({
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
      return c.json({ success: false, message: 'Failed to update product status.' }, 500);
    }
  },

  /**
   * PUT /api/admin/products/:id/reject
   */
  async rejectProduct(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { reason } = body;

      const updated = await prisma.products.update({
        where: { id },
        data: {
          status: 'rejected',
          is_active: false,
        },
      });

      cache.invalidatePrefix('products:');
      cache.delete(`product:${id}`);

      return c.json({
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
      return c.json({ success: false, message: 'Failed to reject product.' }, 500);
    }
  },

  /**
   * DELETE /api/admin/products/:id
   */
  async deleteProduct(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));

      await prisma.products.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          is_active: false,
        },
      });

      return c.json({
        success: true,
        message: 'Product deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return c.json({ success: false, message: 'Failed to delete product.' }, 500);
    }
  },

  /**
   * GET /api/admin/stores
   */
  async getStores(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const page = Math.max(1, Number(c.req.query('page')) || 1);
      const limit = Math.max(1, Math.min(100, Number(c.req.query('limit')) || 10));
      const skip = (page - 1) * limit;

      const where = { deleted_at: null };

      const [stores, total] = await Promise.all([
        prisma.stores.findMany({
          where,
          include: {
            users: true,
            _count: {
              select: { products: true },
            },
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        prisma.stores.count({ where }),
      ]);

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

      return c.json({
        success: true,
        count: formatted.length,
        data: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching admin stores:', error);
      return c.json({ success: false, message: 'Failed to load stores.' }, 500);
    }
  },

  /**
   * PUT /api/admin/stores/:id/status
   */
  async updateStoreStatus(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { status } = body;
      const isApproved = status === 'APPROVED';

      const updated = await prisma.stores.update({
        where: { id },
        data: { is_active: isApproved },
      });

      return c.json({
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
      return c.json({ success: false, message: 'Failed to update store status.' }, 500);
    }
  },

  /**
   * GET /api/admin/categories
   */
  async getCategories(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const page = Math.max(1, Number(c.req.query('page')) || 1);
      const limit = Math.max(1, Math.min(100, Number(c.req.query('limit')) || 10));
      const skip = (page - 1) * limit;

      const where = { deleted_at: null };

      const [categories, total] = await Promise.all([
        prisma.categories.findMany({
          where,
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { name: 'asc' },
          skip,
          take: limit,
        }),
        prisma.categories.count({ where }),
      ]);

      const formatted = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        name_am: null,
        slug: cat.slug,
        description: cat.description,
        icon: null,
        tier: isBrokeredCategory(cat.name, cat.slug) ? 'TIER_1' : 'TIER_2',
        product_count: cat._count?.products || 0,
        is_active: true,
        created_at: cat.created_at.toISOString(),
      }));

      return c.json({
        success: true,
        count: formatted.length,
        data: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      return c.json({ success: false, message: 'Failed to load categories.' }, 500);
    }
  },

  /**
   * POST /api/admin/categories
   */
  async createCategory(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const body = await c.req.json().catch(() => ({}));
      const { name, slug, description, tier } = body;

      if (!name || !slug) {
        return c.json({ success: false, message: 'Name and slug are required.' }, 400);
      }

      const newCategory = await prisma.categories.create({
        data: {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description?.trim() || null,
        },
      });

      return c.json({
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
      }, 201);
    } catch (error) {
      console.error('Error creating category:', error);
      return c.json({ success: false, message: 'Failed to create category.' }, 500);
    }
  },

  /**
   * PUT /api/admin/categories/:id
   */
  async updateCategory(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { name, slug, description, tier } = body;

      const updated = await prisma.categories.update({
        where: { id },
        data: {
          name: name?.trim(),
          slug: slug?.trim().toLowerCase(),
          description: description?.trim(),
        },
      });

      return c.json({
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
      return c.json({ success: false, message: 'Failed to update category.' }, 500);
    }
  },

  /**
   * PUT /api/admin/categories/:id/status
   */
  async updateCategoryStatus(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { is_active } = body;

      const updated = await prisma.categories.update({
        where: { id },
        data: {
          deleted_at: is_active ? null : new Date(),
        },
      });

      return c.json({
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
      return c.json({ success: false, message: 'Failed to update category status.' }, 500);
    }
  },

  /**
   * GET /api/admin/users
   */
  async getUsers(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const page = Math.max(1, Number(c.req.query('page')) || 1);
      const limit = Math.max(1, Math.min(100, Number(c.req.query('limit')) || 10));
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.users.findMany({
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        prisma.users.count(),
      ]);

      const formatted = users.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        role: u.role ? u.role.toUpperCase() : 'CUSTOMER',
        status: u.deleted_at ? 'SUSPENDED' : 'ACTIVE',
        created_at: u.created_at.toISOString(),
      }));

      return c.json({
        success: true,
        count: formatted.length,
        data: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return c.json({ success: false, message: 'Failed to load users.' }, 500);
    }
  },

  /**
   * PUT /api/admin/users/:id/status
   */
  async updateUserStatus(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { status } = body;

      const isSuspended = status === 'SUSPENDED';

      const updated = await prisma.users.update({
        where: { id },
        data: {
          deleted_at: isSuspended ? new Date() : null,
        },
      });

      return c.json({
        success: true,
        message: 'User status updated.',
        data: {
          id: updated.id,
          status,
        },
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      return c.json({ success: false, message: 'Failed to update user status.' }, 500);
    }
  },

  /**
   * GET /api/admin/management/admins
   */
  async getStaffAdmins(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
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

      return c.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error('Error fetching staff admins:', error);
      return c.json({ success: false, message: 'Failed to load administrators.' }, 500);
    }
  },

  /**
   * POST /api/admin/management/admins
   */
  async createStaffAdmin(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const body = await c.req.json().catch(() => ({}));
      const { full_name, email, password, phone, permissions } = body;

      if (!full_name || !email || !password) {
        return c.json({ success: false, message: 'Name, email and password are required.' }, 400);
      }

      const existing = await prisma.users.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (existing) {
        return c.json({ success: false, message: 'An account with this email already exists.' }, 400);
      }

      const hashedPassword = await hashPassword(password);

      const created = await prisma.users.create({
        data: {
          full_name: full_name.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          phone: phone?.trim() || null,
          role: 'admin',
        },
      });

      // Store permissions if provided
      let savedPermissions: string[] = [];
      if (Array.isArray(permissions) && permissions.length > 0) {
        const validPermissions = [
          'overview', 'broker_hub', 'products', 'stores',
          'categories', 'users', 'admin_management', 'settings',
        ];
        const filtered = permissions.filter((p: string) => validPermissions.includes(p));
        if (filtered.length > 0) {
          await Promise.all(
            filtered.map((permission: string) =>
              prisma.admin_permissions.create({
                data: { user_id: created.id, permission },
              })
            )
          );
          savedPermissions = filtered;
        }
      }

      return c.json({
        success: true,
        message: 'Administrator created successfully.',
        data: {
          id: created.id,
          full_name: created.full_name,
          email: created.email,
          phone: created.phone,
          role: 'ADMIN',
          status: 'ACTIVE',
          permissions: savedPermissions,
          created_at: created.created_at.toISOString(),
        },
      }, 201);
    } catch (error) {
      console.error('Error creating administrator:', error);
      return c.json({ success: false, message: 'Failed to create administrator.' }, 500);
    }
  },

  /**
   * PUT /api/admin/management/admins/:id/status
   */
  async updateStaffAdminStatus(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const id = Number(c.req.param('id'));
      const body = await c.req.json().catch(() => ({}));
      const { status } = body;

      const isSuspended = status === 'SUSPENDED';

      const updated = await prisma.users.update({
        where: { id },
        data: {
          deleted_at: isSuspended ? new Date() : null,
        },
      });

      return c.json({
        success: true,
        message: 'Admin status updated.',
        data: {
          id: updated.id,
          status,
        },
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      return c.json({ success: false, message: 'Failed to update admin status.' }, 500);
    }
  },

  /**
   * GET /api/admin/permissions/:userId
   * Get permissions for a specific admin user.
   */
  async getAdminPermissions(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const userId = Number(c.req.param('userId'));
      const records = await prisma.admin_permissions.findMany({
        where: { user_id: userId },
      });
      const permissions = records.map((r) => r.permission);
      return c.json({ success: true, permissions });
    } catch (error) {
      console.error('Error fetching admin permissions:', error);
      return c.json({ success: false, message: 'Failed to load permissions.' }, 500);
    }
  },

  /**
   * PUT /api/admin/permissions/:userId
   * Set permissions for an admin user. Replaces all existing permissions.
   */
  async setAdminPermissions(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const userId = Number(c.req.param('userId'));
      const body = await c.req.json().catch(() => ({}));
      const { permissions } = body;

      if (!Array.isArray(permissions)) {
        return c.json({ success: false, message: 'Permissions must be an array.' }, 400);
      }

      const validPermissions = [
        'overview', 'broker_hub', 'products', 'stores',
        'categories', 'users', 'admin_management', 'settings',
      ];

      const filtered = permissions.filter((p: string) => validPermissions.includes(p));

      // Delete existing permissions and insert new ones in a transaction
      await prisma.$transaction([
        prisma.admin_permissions.deleteMany({ where: { user_id: userId } }),
        ...filtered.map((permission: string) =>
          prisma.admin_permissions.create({
            data: { user_id: userId, permission },
          })
        ),
      ]);

      return c.json({ success: true, permissions: filtered });
    } catch (error) {
      console.error('Error setting admin permissions:', error);
      return c.json({ success: false, message: 'Failed to update permissions.' }, 500);
    }
  },

  /**
   * GET /api/admin/my-permissions
   * Get the logged-in admin's own permissions.
   */
  async getMyPermissions(c: Context<AppContext>) {
    try {
      const prisma = c.get('prisma');
      const user = c.get('user');
      const userId = Number(user?.id);
      const records = await prisma.admin_permissions.findMany({
        where: { user_id: userId },
      });
      const permissions = records.map((r) => r.permission);
      // If no permissions are set, it means the admin has NO explicit permissions stored.
      // We return an empty array; the frontend treats empty as 'no restrictions' for backward compatibility
      // with existing admins who were created before the permissions system.
      return c.json({ success: true, permissions });
    } catch (error) {
      console.error('Error fetching own permissions:', error);
      return c.json({ success: false, message: 'Failed to load permissions.' }, 500);
    }
  },
};

export default adminController;
