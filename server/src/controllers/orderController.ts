import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { prisma } from '../lib/prisma.js';

// 1. Get logged in user's orders (with optional pagination)
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const where = { user_id: userId };

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limitParam = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const limit = limitParam && Number.isInteger(limitParam) && limitParam > 0 ? Math.min(100, limitParam) : undefined;

    const [total, ordersList] = await Promise.all([
      prisma.orders.count({ where }),
      prisma.orders.findMany({
        where,
        ...(limit !== undefined ? { skip: (page - 1) * limit, take: limit } : {}),
        include: {
          order_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true,
                  product_images: {
                    select: {
                      id: true,
                      image_url: true,
                      is_primary: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;
    const hasMore = limit ? page < totalPages : false;

    res.status(200).json({
      success: true,
      count: ordersList.length,
      total,
      page,
      limit: limit || total,
      totalPages,
      hasMore,
      data: ordersList,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
};

// 2. Create a new order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    // req.body is validated by validate(createOrderSchema):
    // - items is a non-empty array with positive product_id and quantity >= 1
    // - shipping_address, payment_method, and note are sanitized
    const { items, shipping_address, payment_method, note } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.products.findUnique({
        where: { id: Number(item.product_id) },
      });

      if (!product) {
        res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
        return;
      }

      const itemPrice = Number(product.price);
      const quantity = Number(item.quantity) || 1;
      totalAmount += itemPrice * quantity;

      orderItemsData.push({
        product_id: product.id,
        product_name: product.name,
        price: itemPrice,
        quantity,
      });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = await prisma.orders.create({
      data: {
        user_id: userId,
        order_number: orderNumber,
        total_amount: totalAmount,
        status: 'pending',
        payment_method: payment_method || 'cash_on_delivery',
        payment_status: 'pending',
        shipping_address: shipping_address || null,
        note: note || null,
        order_items: {
          create: orderItemsData,
        },
        order_status_history: {
          create: {
            status: 'pending',
            changed_by: userId,
          },
        },
      },
      include: {
        order_items: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// 3. Get single order by ID
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user?.id);
    const { id } = req.params;

    const order = await prisma.orders.findUnique({
      where: { id: Number(id) },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
        order_status_history: true,
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Only allow owner or admin/seller to view
    if (order.user_id !== userId && req.user?.role !== 'admin' && req.user?.role !== 'seller') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ message: 'Failed to fetch order detail' });
  }
};
