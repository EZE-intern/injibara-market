import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { prisma } from '../lib/prisma.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';

// @route   GET /api/products
// @desc    Get all products (Public)
export const getProducts = async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    const products = await prisma.products.findMany({
      where: { deleted_at: null, is_active: true },
      include: {
        product_images: true,
        categories: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    
    return res.status(200).json({ 
      success: true, 
      count: products.length, 
      data: products 
    });
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል' });
  }
};

// @route   POST /api/products
// @desc    Create a new product with multiple images (Private - Seller/Admin only)
export const createProduct = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ message: 'ያልተፈቀደ መዳረሻ' });

    const { name, description, price, discount_price, stock, category_id, store_id } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'የምርት ስም እና ዋጋ ያስፈልጋል' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9\u1200-\u137F]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

    // 1. Create the product first
    const product = await prisma.products.create({
      data: {
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: stock ? parseInt(stock, 10) : 0,
        seller_id: Number(sellerId),
        category_id: category_id ? Number(category_id) : null,
        store_id: store_id ? Number(store_id) : null,
      },
    });

    // 2. Handle Image Uploads if any
    let primaryImageUrl: string | null = null;
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      // Upload all files to Cloudinary in parallel
      const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, 'products'));
      const uploadResults = await Promise.all(uploadPromises);

      // Create product_images records
      const imageRecords = uploadResults.map((result, index) => {
        if (index === 0) primaryImageUrl = result.secure_url; // First image is primary
        
        return {
          product_id: product.id,
          image_url: result.secure_url,
          is_primary: index === 0,
          sort_order: index,
        };
      });

      await prisma.product_images.createMany({
        data: imageRecords,
      });

      // Update the main product with the primary image
      if (primaryImageUrl) {
        await prisma.products.update({
          where: { id: product.id },
          data: { image: primaryImageUrl },
        });
      }
    }

    // Fetch the complete product with images to return
    const completeProduct = await prisma.products.findUnique({
      where: { id: product.id },
      include: { product_images: true },
    });

    return res.status(201).json({
      message: 'ምርት በተሳካ ሁኔታ ተፈጥሯል',
      data: completeProduct
    });
  } catch (error: unknown) {
    console.error('Error in createProduct:', error);
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል' });
  }
};
