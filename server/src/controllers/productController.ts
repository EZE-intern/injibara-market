import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @route   GET /api/products
// @desc    Get all products (Public)
export const getProducts = async (req: Request, res: Response) => {
  try {
    // Later, you will fetch these from Prisma
    res.status(200).json({ message: 'ምርቶች በተሳካ ሁኔታ ተገኝተዋል', products: [] });
  } catch (_error) {
    res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል' });
  }
};

// @route   POST /api/products
// @desc    Create a new product (Private - Seller/Admin only)
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    // req.user is available here because of the 'protect' middleware
    const sellerId = req.user?.id;

    res.status(201).json({
      message: 'ምርት በተሳካ ሁኔታ ተፈጥሯል',
      product: { name: 'Test Product', sellerId }
    });
  } catch (_error) {
    res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል' });
  }
};
