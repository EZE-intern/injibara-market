import type { Context } from 'hono';
import type { AppContext } from '../types/context.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';

// @route   POST /api/stores
// @desc    Create a new store profile with optional logo upload
// @access  Private (Seller only)
export const createStore = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    const sellerId = user?.id;

    if (!sellerId) {
      return c.json({ message: 'ያልተፈቀደ መዳረሻ' }, 401);
    }

    let store_name = '';
    let description: string | null = null;
    let phone: string | null = null;
    let address: string | null = null;
    let logoUrl: string | null = null;

    const contentType = c.req.header('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      store_name = String(body['store_name'] || '').trim();
      description = body['description'] ? String(body['description']).trim() : null;
      phone = body['phone'] ? String(body['phone']).trim() : null;
      address = body['address'] ? String(body['address']).trim() : null;

      if (body['logo'] instanceof File) {
        const result = await uploadToCloudinary(body['logo'], 'stores', c.env);
        logoUrl = result.secure_url;
      }
    } else {
      const json = await c.req.json();
      store_name = String(json.store_name || '').trim();
      description = json.description ? String(json.description).trim() : null;
      phone = json.phone ? String(json.phone).trim() : null;
      address = json.address ? String(json.address).trim() : null;
      logoUrl = json.logo || null;
    }

    if (!store_name) {
      return c.json({ message: 'የመደብር ስም ያስፈልጋል' }, 400);
    }

    const slug = store_name
      .toLowerCase()
      .replace(/[^a-z0-9\u1200-\u137F]+/g, '-')
      .replace(/^-|-$/g, '');

    const existingStore = await prisma.stores.findUnique({ where: { slug } });
    if (existingStore) {
      return c.json({ message: 'ይህ የመደብር ስም ቀድሞ ተይዟል' }, 400);
    }

    const store = await prisma.stores.create({
      data: {
        seller_id: Number(sellerId),
        store_name,
        slug,
        logo: logoUrl,
        description: description || null,
        phone: phone || null,
        address: address || null,
      },
    });

    return c.json(
      {
        message: 'መደብር በተሳካ ሁኔታ ተፈጥሯል',
        data: store,
      },
      201
    );
  } catch (error: unknown) {
    console.error('Error in createStore:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ message: 'የአገልጋይ ስህተት አጋጥሟል', error: errorMessage }, 500);
  }
};

// @route   GET /api/stores
// @desc    Get all active stores
// @access  Public
export const getStores = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const stores = await prisma.stores.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { created_at: 'desc' },
    });

    return c.json({ success: true, count: stores.length, data: stores }, 200);
  } catch (error: unknown) {
    console.error('Error in getStores:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ message: 'የአገልጋይ ስህተት አጋጥሟል', error: errorMessage }, 500);
  }
};

// @route   GET /api/stores/:id
// @desc    Get a store by ID
// @access  Public
export const getStoreById = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const id = Number(c.req.param('id'));

    const store = await prisma.stores.findFirst({
      where: { id, deleted_at: null },
    });

    if (!store) {
      return c.json({ message: 'መደብር አልተገኘም' }, 404);
    }

    return c.json({ success: true, data: store }, 200);
  } catch (error: unknown) {
    console.error('Error in getStoreById:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ message: 'የአገልጋይ ስህተት አጋጥሟል', error: errorMessage }, 500);
  }
};
