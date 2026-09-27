import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { cache } from '../utils/cache.js';

// create new category
// @route   POST /api/categories
export const createCategory = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const body = req.body || {};
    const { name, description, image } = body;

    if (!name) {
      return res.status(400).json({ message: 'እባክዎ የምድብ ስም (name) ያስገቡ' });
    }

    // Slug ማዘጋጀት (ለምሳሌ: "Men Shoes" -> "men-shoes")
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

    // Slug ከዚህ ቀደም መኖሩን ማረጋገጥ
    const existingCategory = await prisma.categories.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'በዚህ ስም የተመዘገበ ምድብ ከዚህ ቀደም አለ' });
    }

    const newCategory = await prisma.categories.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
      },
    });

    // Invalidate categories cache
    cache.invalidatePrefix('categories:');

    return res.status(201).json({
      message: 'ምድቡ በተሳካ ሁኔታ ተፈጥሯል',
      data: newCategory,
    });
  } catch (error: unknown) {
      const errorMessage = (error as Error).message;

    console.error('Category creation error:', error);
    return res.status(500).json({
      message: 'ምድብ መፍጠር አልተቻለም',
      error: errorMessage,
    });
  }
};

// get all categories, optionally limited / paginated
// @route   GET /api/categories
export const getCategories = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limitParam = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const limit = limitParam && Number.isInteger(limitParam) && limitParam > 0 ? Math.min(100, limitParam) : undefined;

    // Cache key based on pagination
    const cacheKey = `categories:${page}:${limit || 'all'}`;
    const cached = cache.get<{
      success: boolean;
      count: number;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
      data: unknown[];
    }>(cacheKey);

    // Set standard cache control header for clients & edge caches
    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');

    if (cached) {
      return res.status(200).json(cached);
    }

    const where = { deleted_at: null };

    const [total, categories] = await Promise.all([
      prisma.categories.count({ where }),
      prisma.categories.findMany({
        where,
        ...(limit !== undefined ? { skip: (page - 1) * limit, take: limit } : {}),
        include: {
          _count: {
            select: { products: { where: { deleted_at: null, is_active: true } } },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    const totalPages = limit ? Math.ceil(total / limit) : 1;
    const hasMore = limit ? page < totalPages : false;

    const responsePayload = {
      success: true,
      count: categories.length,
      total,
      page,
      limit: limit || total,
      totalPages,
      hasMore,
      data: categories,
    };

    // Store in server cache for 5 minutes (300 seconds)
    cache.set(cacheKey, responsePayload, 300);

    return res.status(200).json(responsePayload);
  } catch (error: unknown) {
    const errorMessage = (error as Error).message;

    console.error('Error fetching categories:', error);
    return res.status(500).json({
      message: 'የምድብ መረጃዎችን ማምጣት አልተቻለም',
      error: errorMessage,
    });
  }
};

// get one category  Category by ID
// @route   GET /api/categories/:id
export const getCategoryById = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const category = await prisma.categories.findFirst({
      where: {
        id: Number(id),
        deleted_at: null,
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'ምድቡ አልተገኘም' });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: unknown) {
      const errorMessage = (error as Error).message;
    console.error('Error fetching category:', error);
    return res.status(500).json({
      message: 'የአገልጋይ ስህተት አጋጥሟል',
      error: errorMessage,
    });
  }
};



// update  Category
// @route   PUT /api/categories/:id
export const updateCategory = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { name, description, image } = body;

    const category = await prisma.categories.findFirst({
      where: { id: Number(id), deleted_at: null },
    });

    if (!category) {
      return res.status(404).json({ message: 'ሊሻሻል የተፈለገው ምድብ አልተገኘም' });
    }

    let slug = category.slug;
    if (name) {
      slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    }

    const updatedCategory = await prisma.categories.update({
      where: { id: Number(id) },
      data: {
        name: name || category.name,
        slug,
        description: description !== undefined ? description : category.description,
        image: image !== undefined ? image : category.image,
      },
    });

    cache.invalidatePrefix('categories:');

    return res.status(200).json({
      message: 'ምድቡ በተሳካ ሁኔታ ተሻሽሏል',
      data: updatedCategory,
    });
  } catch (error: unknown) {
      const errorMessage = (error as Error).message;

    console.error('Error updating category:', error);
    return res.status(500).json({
      message: 'ምድቡን ማሻሻል አልተቻለም',
      error: errorMessage,
    });
  }
};

// delet category temopererly
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const category = await prisma.categories.findFirst({
      where: { id: Number(id), deleted_at: null },
    });

    if (!category) {
      return res.status(404).json({ message: 'የተፈለገው ምድብ አልተገኘም ወይም አስቀድሞ ተሰርዟል' });
    }

    await prisma.categories.update({
      where: { id: Number(id) },
      data: {
        deleted_at: new Date(),
      },
    });

    cache.invalidatePrefix('categories:');

    return res.status(200).json({
      message: 'ምድቡ በተሳካ ሁኔታ ተሰርዟል',
    });
  } catch (error: unknown) {
      const errorMessage = (error as Error).message;

    console.error('Error deleting category:', error);
    return res.status(500).json({
      message: 'ምድቡን መሰረዝ አልተቻለም',
      error: errorMessage,
    });
  }
};
