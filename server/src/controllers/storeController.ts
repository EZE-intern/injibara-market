import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { prisma } from '../lib/prisma.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';

// @route   POST /api/stores
// @desc    Create a new store profile with optional logo upload
// @access  Private (Seller only)
export const createStore = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ message: 'ያልተፈቀደ መዳረሻ' });
    }

    const { store_name, description, phone, address } = req.body;

    if (!store_name) {
      return res.status(400).json({ message: 'የመደብር ስም ያስፈልጋል' });
    }

    // Generate slug from store name
    const slug = store_name
      .toLowerCase()
      .replace(/[^a-z0-9\u1200-\u137F]+/g, '-') // support Amharic chars in slug
      .replace(/^-|-$/g, '');

    // Check for duplicate slug
    const existingStore = await prisma.stores.findUnique({ where: { slug } });
    if (existingStore) {
      return res.status(400).json({ message: 'ይህ የመደብር ስም ቀድሞ ተይዟል' });
    }

    // Handle logo upload if a file was provided
    let logoUrl: string | null = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'stores');
      logoUrl = result.secure_url;
    }

    // Save to database
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

    return res.status(201).json({
      message: 'መደብር በተሳካ ሁኔታ ተፈጥሯል',
      data: store,
    });
  } catch (error: unknown) {
    console.error('Error in createStore:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል', error: errorMessage });
  }
};

// @route   GET /api/stores
// @desc    Get all active stores
// @access  Public
export const getStores = async (_req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const stores = await prisma.stores.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { created_at: 'desc' },
    });

    return res.json({ success: true, count: stores.length, data: stores });
  } catch (error: unknown) {
    console.error('Error in getStores:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል', error: errorMessage });
  }
};

// @route   GET /api/stores/:id
// @desc    Get a store by ID
// @access  Public
export const getStoreById = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const store = await prisma.stores.findFirst({
      where: { id: Number(req.params.id), deleted_at: null },
    });

    if (!store) {
      return res.status(404).json({ message: 'መደብር አልተገኘም' });
    }

    return res.json({ success: true, data: store });
  } catch (error: unknown) {
    console.error('Error in getStoreById:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል', error: errorMessage });
  }
};
