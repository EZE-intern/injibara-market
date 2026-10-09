import type { Context } from 'hono';
import type { AppContext } from '../types/context.js';

// 1. Get logged in user's orders (with optional pagination)
export const getMyOrders = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    const userId = Number(user?.id);

    if (!userId) {
      return c.json({ message: 'User not authenticated' }, 401);
    }

    const where = { user_id: userId };

    const page = Math.max(1, parseInt(String(c.req.query('page') || '1'), 10) || 1);
    const limitParam = c.req.query('limit') ? parseInt(String(c.req.query('limit')), 10) : undefined;
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

    return c.json(
      {
        success: true,
        count: ordersList.length,
        total,
        page,
        limit: limit || total,
        totalPages,
        hasMore,
        data: ordersList,
      },
      200
    );
  } catch (error) {
    console.error('Error fetching my orders:', error);
    return c.json({ message: 'Failed to fetch orders' }, 500);
  }
};

// 2. Create order
export const createOrder = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    const userId = Number(user?.id);

    if (!userId) {
      return c.json({ message: 'User not authenticated' }, 401);
    }

    const { items, shipping_address, payment_method, note } = await c.req.json();

    let totalAmount = 0;
    const orderItemsData: {
      product_id: number;
      product_name: string;
      price: number;
      quantity: number;
    }[] = [];
    const productsToUpdate: { id: number; newStock: number }[] = [];

    for (const item of items) {
      const product = await prisma.products.findUnique({
        where: { id: Number(item.product_id) },
      });

      if (!product || product.deleted_at || !product.is_active) {
        return c.json({ message: `Product with ID ${item.product_id} not found or unavailable` }, 404);
      }

      const quantity = Number(item.quantity) || 1;
      const currentStock = product.stock ?? 0;

      if (currentStock < quantity) {
        return c.json(
          {
            message: `Insufficient stock for product "${product.name}". Available: ${currentStock}, requested: ${quantity}`,
          },
          400
        );
      }

      const itemPrice = Number(product.price);
      totalAmount += itemPrice * quantity;

      orderItemsData.push({
        product_id: product.id,
        product_name: product.name,
        price: itemPrice,
        quantity,
      });

      productsToUpdate.push({
        id: product.id,
        newStock: Math.max(0, currentStock - quantity),
      });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.orders.create({
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

      for (const p of productsToUpdate) {
        await tx.products.update({
          where: { id: p.id },
          data: { stock: p.newStock },
        });
      }

      return created;
    });

    return c.json(
      {
        success: true,
        message: 'Order created successfully',
        data: newOrder,
      },
      201
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ message: 'Failed to create order' }, 500);
  }
};

// 3. Get single order by ID
export const getOrderById = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    const userId = Number(user?.id);
    const id = Number(c.req.param('id'));

    const order = await prisma.orders.findUnique({
      where: { id },
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
      return c.json({ message: 'Order not found' }, 404);
    }

    if (order.user_id !== userId && user?.role !== 'admin' && user?.role !== 'seller') {
      return c.json({ message: 'Access denied' }, 403);
    }

    return c.json({ success: true, data: order }, 200);
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return c.json({ message: 'Failed to fetch order detail' }, 500);
  }
};

// 4. Get incoming orders for products belonging to the logged-in seller
export const getSellerOrders = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    const sellerId = Number(user?.id);

    if (!sellerId) {
      return c.json({ message: 'User not authenticated' }, 401);
    }

    const orders = await prisma.orders.findMany({
      where: {
        order_items: {
          some: {
            products: {
              seller_id: sellerId,
            },
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        order_items: {
          where: {
            products: {
              seller_id: sellerId,
            },
          },
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
    });

    return c.json(
      {
        success: true,
        count: orders.length,
        data: orders,
      },
      200
    );
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return c.json({ message: 'Failed to fetch seller orders' }, 500);
  }
};
