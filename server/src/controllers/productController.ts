import type { Context } from 'hono';
import type { AppContext } from '../types/context.js';
import { Prisma } from '@prisma/client';
import { uploadToCloudinary } from '../lib/cloudinary.js';
import { cache } from '../utils/cache.js';

// @route   GET /api/products
// @desc    Get all products, optionally filtered by category or search (Public)
export const getProducts = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const category = c.req.query('category');
    const categoryId = c.req.query('categoryId');
    const search = c.req.query('search');
    const location = c.req.query('location');

    const page = Math.max(1, parseInt(String(c.req.query('page') || '1'), 10) || 1);
    const limitParam = c.req.query('limit') ? parseInt(String(c.req.query('limit')), 10) : undefined;
    const limit = limitParam && Number.isInteger(limitParam) && limitParam > 0 ? Math.min(100, limitParam) : undefined;

    const cacheKey = `products:${JSON.stringify({ category, categoryId, search, location, page, limit })}`;
    const cached = cache.get<unknown>(cacheKey);

    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=180');

    if (cached) {
      return c.json(cached, 200);
    }

    const where: Prisma.productsWhereInput = { deleted_at: null, is_active: true };

    if (categoryId) {
      const id = Number(categoryId);
      if (Number.isInteger(id) && id > 0) {
        where.category_id = id;
      }
    }

    if (!where.category_id && category && String(category).trim().toLowerCase() !== 'all') {
      const categoryValue = String(category).trim().toLowerCase();
      let foundCategory = await prisma.categories.findFirst({
        where: { slug: categoryValue },
      });

      if (!foundCategory) {
        const allCategories = await prisma.categories.findMany();
        foundCategory =
          allCategories.find((item) => {
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

    if (search && String(search).trim()) {
      const searchStr = String(search).trim().toLowerCase();
      where.OR = [
        { name: { contains: searchStr } },
        { description: { contains: searchStr } },
        { location: { contains: searchStr } },
      ];
    }

    if (location && String(location).trim() && String(location).trim().toLowerCase() !== 'all') {
      const locStr = String(location).trim().toLowerCase();
      where.location = { contains: locStr };
    }

    const [total, products] = await Promise.all([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        ...(limit !== undefined ? { skip: (page - 1) * limit, take: limit } : {}),
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
      }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;
    const hasMore = limit ? page < totalPages : false;

    const responsePayload = {
      success: true,
      count: products.length,
      total,
      page,
      limit: limit || total,
      totalPages,
      hasMore,
      data: products,
    };

    cache.set(cacheKey, responsePayload, 120);

    return c.json(responsePayload, 200);
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return c.json({ message: 'የአገልጋይ ስህተት አጋጥሟል' }, 500);
  }
};

// @route   GET /api/products/my-products
// @desc    Get all active products listed by the logged-in user (Private - Authenticated Seller)
export const getMyProducts = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    const sellerId = user?.id;

    if (!sellerId) {
      return c.json({ success: false, message: 'ያልተፈቀደ መዳረሻ' }, 401);
    }

    const where: Prisma.productsWhereInput = {
      seller_id: Number(sellerId),
      deleted_at: null,
    };

    const page = Math.max(1, parseInt(String(c.req.query('page') || '1'), 10) || 1);
    const limitParam = c.req.query('limit') ? parseInt(String(c.req.query('limit')), 10) : undefined;
    const limit = limitParam && Number.isInteger(limitParam) && limitParam > 0 ? Math.min(100, limitParam) : undefined;

    const [total, products] = await Promise.all([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        ...(limit !== undefined ? { skip: (page - 1) * limit, take: limit } : {}),
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
      }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;
    const hasMore = limit ? page < totalPages : false;

    return c.json(
      {
        success: true,
        count: products.length,
        total,
        page,
        limit: limit || total,
        totalPages,
        hasMore,
        data: products,
      },
      200
    );
  } catch (error: unknown) {
    console.error('Error fetching seller products:', error);
    return c.json({ success: false, message: 'የአገልጋይ ስህተት አጋጥሟል' }, 500);
  }
};

// @route   GET /api/products/:id
// @desc    Get a single product by ID (Public)
export const getProductById = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const id = Number(c.req.param('id'));

    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ success: false, message: 'Invalid product ID' }, 400);
    }

    c.header('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');

    const cacheKey = `product:${id}`;
    const cached = cache.get<unknown>(cacheKey);
    if (cached) {
      return c.json({ success: true, data: cached }, 200);
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
      return c.json({ success: false, message: 'ምርቱ አልተገኘም' }, 404);
    }

    cache.set(cacheKey, product, 180);

    return c.json({ success: true, data: product }, 200);
  } catch (error: unknown) {
    console.error('Error fetching product by ID:', error);
    return c.json({ message: 'የአገልጋይ ስህተት አጋጥሟል' }, 500);
  }
};

// @route   POST /api/products
// @desc    Create a new product with multiple images (Private - Seller/Admin only)
export const createProduct = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');
    const sellerId = user?.id;

    if (!sellerId) return c.json({ message: 'ያልተፈቀደ መዳረሻ' }, 401);

    let name = '';
    let description: string | undefined;
    let price: number = 0;
    let discount_price: number | null = null;
    let stock: number = 0;
    let category_id: number | null = null;
    let store_id: number | null = null;
    let location: string | null = null;
    let imageFiles: File[] = [];
    let imageUrls: string[] = [];

    const contentType = c.req.header('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody({ all: true });
      name = String(body['name'] || '').trim();
      description = body['description'] ? String(body['description']).trim() : undefined;
      price = Number(body['price'] || 0);
      discount_price = body['discount_price'] ? Number(body['discount_price']) : null;
      stock = body['stock'] ? Number(body['stock']) : 0;
      category_id = body['category_id'] ? Number(body['category_id']) : null;
      store_id = body['store_id'] ? Number(body['store_id']) : null;
      location = body['location'] ? String(body['location']).trim().toLowerCase() : null;

      const rawImages = body['images'];
      if (Array.isArray(rawImages)) {
        imageFiles = rawImages.filter((f): f is File => f instanceof File);
      } else if (rawImages instanceof File) {
        imageFiles = [rawImages];
      }
    } else {
      const json = await c.req.json();
      name = String(json.name || '').trim();
      description = json.description ? String(json.description).trim() : undefined;
      price = Number(json.price || 0);
      discount_price = json.discount_price ? Number(json.discount_price) : null;
      stock = Number(json.stock || 0);
      category_id = json.category_id ? Number(json.category_id) : null;
      store_id = json.store_id ? Number(json.store_id) : null;
      location = json.location ? String(json.location).trim().toLowerCase() : null;
      if (Array.isArray(json.image_urls)) {
        imageUrls = json.image_urls;
      }
    }

    if (!name || price <= 0) {
      return c.json({ message: 'Product name and valid price are required' }, 400);
    }

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9\u1200-\u137F]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now();

    // 1. Create the product first
    const product = await prisma.products.create({
      data: {
        name,
        slug,
        description: description || null,
        location: location || null,
        price,
        discount_price: discount_price ?? null,
        stock: stock ?? 0,
        seller_id: Number(sellerId),
        category_id: category_id ?? null,
        store_id: store_id ?? null,
      },
    });

    // Auto-promote user to 'seller' if they are currently registered as 'customer'
    if (user?.role === 'customer') {
      await prisma.users
        .update({
          where: { id: Number(sellerId) },
          data: { role: 'seller' },
        })
        .catch((err) => console.error('Failed to update user role to seller:', err));
    }

    // 2. Handle Image Uploads if any files sent
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map((file) => uploadToCloudinary(file, 'products', c.env));
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map((r) => r.secure_url);
    }

    // 3. Save images to product_images table
    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        is_primary: index === 0,
        sort_order: index,
      }));

      await prisma.product_images.createMany({
        data: imageRecords,
      });

      await prisma.products.update({
        where: { id: product.id },
        data: { image: imageUrls[0] },
      });
    }

    const completeProduct = await prisma.products.findUnique({
      where: { id: product.id },
      include: { product_images: true },
    });

    cache.invalidatePrefix('products:');

    return c.json(
      {
        success: true,
        message: 'ምርት በተሳካ ሁኔታ ተፈጥሯል',
        data: completeProduct,
      },
      201
    );
  } catch (error: unknown) {
    console.error('Error in createProduct:', error);
    return c.json({ message: 'የአገልጋይ ስህተት አጋጥሟል' }, 500);
  }
};

// @route   PUT /api/products/:id
// @desc    Update a product (Private - Owner or Admin only)
export const updateProduct = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, message: 'ያልተፈቀደ መዳረሻ' }, 401);
    }

    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ success: false, message: 'Invalid product ID' }, 400);
    }

    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return c.json({ success: false, message: 'ምርቱ አልተገኘም' }, 404);
    }

    if (user.role !== 'admin' && Number(product.seller_id) !== Number(user.id)) {
      return c.json({ success: false, message: 'የራስዎን ምርት ብቻ ማሻሻል ይችላሉ' }, 403);
    }

    let name: string | undefined;
    let description: string | undefined;
    let price: number | undefined;
    let discount_price: number | null | undefined;
    let stock: number | undefined;
    let category_id: number | null | undefined;
    let store_id: number | null | undefined;
    let location: string | null | undefined;
    let imageFiles: File[] = [];
    let imageUrls: string[] = [];

    const contentType = c.req.header('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody({ all: true });
      if (body['name'] !== undefined) name = String(body['name']).trim();
      if (body['description'] !== undefined) description = String(body['description']).trim();
      if (body['price'] !== undefined) price = Number(body['price']);
      if (body['discount_price'] !== undefined) discount_price = body['discount_price'] ? Number(body['discount_price']) : null;
      if (body['stock'] !== undefined) stock = Number(body['stock']);
      if (body['category_id'] !== undefined) category_id = body['category_id'] ? Number(body['category_id']) : null;
      if (body['store_id'] !== undefined) store_id = body['store_id'] ? Number(body['store_id']) : null;
      if (body['location'] !== undefined) location = body['location'] ? String(body['location']).trim().toLowerCase() : null;

      const rawImages = body['images'];
      if (Array.isArray(rawImages)) {
        imageFiles = rawImages.filter((f): f is File => f instanceof File);
      } else if (rawImages instanceof File) {
        imageFiles = [rawImages];
      }
    } else {
      const json = await c.req.json();
      name = json.name;
      description = json.description;
      price = json.price !== undefined ? Number(json.price) : undefined;
      discount_price = json.discount_price !== undefined ? (json.discount_price ? Number(json.discount_price) : null) : undefined;
      stock = json.stock !== undefined ? Number(json.stock) : undefined;
      category_id = json.category_id !== undefined ? (json.category_id ? Number(json.category_id) : null) : undefined;
      store_id = json.store_id !== undefined ? (json.store_id ? Number(json.store_id) : null) : undefined;
      location = json.location !== undefined ? (json.location ? String(json.location).trim().toLowerCase() : null) : undefined;
      if (Array.isArray(json.image_urls)) {
        imageUrls = json.image_urls;
      }
    }

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
        ...(location !== undefined && { location }),
      },
    });

    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map((file) => uploadToCloudinary(file, 'products', c.env));
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = [...imageUrls, ...uploadResults.map((r) => r.secure_url)];
    }

    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url, index) => ({
        product_id: id,
        image_url: url,
        is_primary: false,
        sort_order: index,
      }));

      await prisma.product_images.createMany({ data: imageRecords });

      if (!product.image) {
        await prisma.products.update({
          where: { id },
          data: { image: imageUrls[0] },
        });
      }
    }

    const completeProduct = await prisma.products.findUnique({
      where: { id },
      include: { product_images: true, categories: true },
    });

    cache.invalidatePrefix('products:');
    cache.delete(`product:${id}`);

    return c.json(
      {
        success: true,
        message: 'ምርቱ በተሳካ ሁኔታ ተሻሽሏል',
        data: completeProduct,
      },
      200
    );
  } catch (error: unknown) {
    console.error('Error in updateProduct:', error);
    return c.json({ message: 'የአገልጋይ ስህተት አጋጥሟል' }, 500);
  }
};

// @route   DELETE /api/products/:id
// @desc    Soft-delete a product (Private - Owner or Admin only)
export const deleteProduct = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, message: 'ያልተፈቀደ መዳረሻ' }, 401);
    }

    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ success: false, message: 'Invalid product ID' }, 400);
    }

    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return c.json({ success: false, message: 'ምርቱ አልተገኘም' }, 404);
    }

    if (user.role !== 'admin' && Number(product.seller_id) !== Number(user.id)) {
      return c.json({ success: false, message: 'የራስዎን ምርት ብቻ ማጥፋት ይችላሉ' }, 403);
    }

    await prisma.products.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });

    cache.invalidatePrefix('products:');
    cache.delete(`product:${id}`);

    return c.json({ success: true, message: 'ምርቱ በተሳካ ሁኔታ ተሰርዟል' }, 200);
  } catch (error: unknown) {
    console.error('Error in deleteProduct:', error);
    return c.json({ message: 'የአገልጋይ ስህተት አጋጥሟል' }, 500);
  }
};
