import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { prisma } from '../lib/prisma.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';

// @route   GET /api/products
// @desc    Get all products, optionally filtered by category or search (Public)
export const getProducts = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { category, categoryId, search } = req.query;
    const where: Prisma.productsWhereInput = { deleted_at: null, is_active: true };

    // Support filtering by category ID
    if (categoryId) {
      const id = Number(categoryId);
      if (Number.isInteger(id) && id > 0) {
        where.category_id = id;
      }
    }

    // Support filtering by category slug or name
    if (!where.category_id && category && String(category).trim().toLowerCase() !== 'all') {
      const categoryValue = String(category).trim().toLowerCase();
      let foundCategory = await prisma.categories.findFirst({
        where: { slug: categoryValue },
      });

      if (!foundCategory) {
        const allCategories = await prisma.categories.findMany();
        foundCategory = allCategories.find((item) => {
          const name = String(item.name).trim().toLowerCase();
          const slug = String(item.slug).trim().toLowerCase();
          const firstWord = categoryValue.split(/[\s(&,-]+/)[0];
          return (
            name === categoryValue ||
            slug === categoryValue ||
            name.includes(categoryValue) ||
            categoryValue.includes(name) ||
            (firstWord && firstWord.length > 2 && name.includes(firstWord))
          );
        }) || null;
      }

      if (foundCategory) {
        where.category_id = foundCategory.id;
      }
    }

    // Support search query
    if (search && String(search).trim()) {
      const searchStr = String(search).trim();
      where.OR = [
        { name: { contains: searchStr } },
        { description: { contains: searchStr } },
      ];
    }

    const products = await prisma.products.findMany({
      where,
      include: {
        product_images: {
          select: {
            id: true,
            image_url: true,
            side_angle: true,
            is_primary: true,
            sort_order: true,
          },
        },
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

// @route   GET /api/products/my-products
// @desc    Get all active products listed by the logged-in user (Private - Authenticated Seller)
export const getMyProducts = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: 'ያልተፈቀደ መዳረሻ' });
    }

    const products = await prisma.products.findMany({
      where: {
        seller_id: Number(sellerId),
        deleted_at: null,
      },
      include: {
        product_images: {
          select: {
            id: true,
            image_url: true,
            side_angle: true,
            is_primary: true,
            sort_order: true,
          },
        },
        categories: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: unknown) {
    console.error('Error fetching seller products:', error);
    return res.status(500).json({ success: false, message: 'የአገልጋይ ስህተት አጋጥሟል' });
  }
};

// @route   GET /api/products/:id
// @desc    Get a single product by ID (Public)
export const getProductById = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        product_images: {
          orderBy: [
            { is_primary: 'desc' },
            { sort_order: 'asc' },
          ],
        },
        categories: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'ምርቱ አልተገኘም' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error: unknown) {
    console.error('Error fetching product by ID:', error);
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል' });
  }
};

// @route   POST /api/products
// @desc    Create a new product with multiple images (Private - Seller/Admin only)
export const createProduct = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ message: 'ያልተፈቀደ መዳረሻ' });

    // req.body is already validated and sanitized by validate(createProductSchema):
    // - name is trimmed, min 3 chars
    // - price is a positive number
    // - stock is a non-negative integer
    // - category_id and store_id are positive integers (if provided)
    const { name, description, price, discount_price, stock, category_id, store_id } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9\u1200-\u137F]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

    // 1. Create the product first
    const product = await prisma.products.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        discount_price: discount_price ?? null,
        stock: stock ?? 0,
        seller_id: Number(sellerId),
        category_id: category_id ?? null,
        store_id: store_id ?? null,
      },
    });

    // Auto-promote user to 'seller' if they are currently registered as 'customer'
    if (req.user?.role === 'customer') {
      await prisma.users
        .update({
          where: { id: Number(sellerId) },
          data: { role: 'seller' },
        })
        .catch((err) => console.error('Failed to update user role to seller:', err));
    }

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
      success: true,
      message: 'ምርት በተሳካ ሁኔታ ተፈጥሯል',
      data: completeProduct
    });
  } catch (error: unknown) {
    console.error('Error in createProduct:', error);
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል' });
  }
};

// @route   PUT /api/products/:id
// @desc    Update a product (Private - Owner or Admin only)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'ያልተፈቀደ መዳረሻ' });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // Check if product exists
    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'ምርቱ አልተገኘም' });
    }

    // Check ownership: only the seller who created it or an admin can update
    if (req.user.role !== 'admin' && Number(product.seller_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'የራስዎን ምርት ብቻ ማሻሻል ይችላሉ' });
    }

    // req.body is validated by validate(updateProductSchema)
    const { name, description, price, discount_price, stock, category_id, store_id } = req.body;

    // Update the product fields
    await prisma.products.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(discount_price !== undefined && { discount_price }),
        ...(stock !== undefined && { stock }),
        ...(category_id !== undefined && { category_id }),
        ...(store_id !== undefined && { store_id }),
      },
    });

    // Handle new image uploads if provided
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, 'products'));
      const uploadResults = await Promise.all(uploadPromises);

      const imageRecords = uploadResults.map((result, index) => ({
        product_id: id,
        image_url: result.secure_url,
        is_primary: false,
        sort_order: index,
      }));

      await prisma.product_images.createMany({ data: imageRecords });

      // Update the primary image if this is the first image
      if (!product.image) {
        await prisma.products.update({
          where: { id },
          data: { image: uploadResults[0].secure_url },
        });
      }
    }

    // Fetch and return the complete updated product
    const completeProduct = await prisma.products.findUnique({
      where: { id },
      include: { product_images: true, categories: true },
    });

    return res.status(200).json({
      success: true,
      message: 'ምርቱ በተሳካ ሁኔታ ተሻሽሏል',
      data: completeProduct,
    });
  } catch (error: unknown) {
    console.error('Error in updateProduct:', error);
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል' });
  }
};

// @route   DELETE /api/products/:id
// @desc    Soft-delete a product (Private - Owner or Admin only)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'ያልተፈቀደ መዳረሻ' });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // Check if product exists
    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'ምርቱ አልተገኘም' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && Number(product.seller_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'የራስዎን ምርት ብቻ ማጥፋት ይችላሉ' });
    }

    // Soft delete: set deleted_at and is_active = false
    await prisma.products.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'ምርቱ በተሳካ ሁኔታ ተሰርዟል',
    });
  } catch (error: unknown) {
    console.error('Error in deleteProduct:', error);
    return res.status(500).json({ message: 'የአገልጋይ ስህተት አጋጥሟል' });
  }
};
