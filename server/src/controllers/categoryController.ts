import type { Context } from 'hono';
import type { AppContext } from '../types/context.js';
import { cache } from '../utils/cache.js';

// create new category
// @route   POST /api/categories
export const createCategory = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const body = (await c.req.json().catch(() => ({}))) || {};
    const { name, description, image } = body;

    if (!name) {
      return c.json({ message: 'እባክዎ የምድብ ስም (name) ያስገቡ' }, 400);
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

    const existingCategory = await prisma.categories.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return c.json({ message: 'በዚህ ስም የተመዘገበ ምድብ ከዚህ ቀደም አለ' }, 400);
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

    return c.json(
      {
        message: 'ምድቡ በተሳካ ሁኔታ ተፈጥሯል',
        data: newCategory,
      },
      201
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Category creation error:', error);
    return c.json({ message: 'ምድብ መፍጠር አልተቻለም', error: errorMessage }, 500);
  }
};

// get all categories, optionally limited / paginated
// @route   GET /api/categories
export const getCategories = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const page = Math.max(1, parseInt(String(c.req.query('page') || '1'), 10) || 1);
    const limitParam = c.req.query('limit') ? parseInt(String(c.req.query('limit')), 10) : undefined;
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

    c.header('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');

    if (cached) {
      return c.json(cached, 200);
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

    cache.set(cacheKey, responsePayload, 300);

    return c.json(responsePayload, 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching categories:', error);
    return c.json({ message: 'የምድብ መረጃዎችን ማምጣት አልተቻለም', error: errorMessage }, 500);
  }
};

// get one category Category by ID
// @route   GET /api/categories/:id
export const getCategoryById = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const id = Number(c.req.param('id'));

    const category = await prisma.categories.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!category) {
      return c.json({ message: 'ምድቡ አልተገኘም' }, 404);
    }

    return c.json({ success: true, data: category }, 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching category:', error);
    return c.json({ message: 'የአገልጋይ ስህተት አጋጥሟል', error: errorMessage }, 500);
  }
};

// update Category
// @route   PUT /api/categories/:id
export const updateCategory = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const id = Number(c.req.param('id'));
    const body = (await c.req.json().catch(() => ({}))) || {};
    const { name, description, image } = body;

    const category = await prisma.categories.findFirst({
      where: { id, deleted_at: null },
    });

    if (!category) {
      return c.json({ message: 'ሊሻሻል የተፈለገው ምድብ አልተገኘም' }, 404);
    }

    let slug = category.slug;
    if (name) {
      slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    }

    const updatedCategory = await prisma.categories.update({
      where: { id },
      data: {
        name: name || category.name,
        slug,
        description: description !== undefined ? description : category.description,
        image: image !== undefined ? image : category.image,
      },
    });

    cache.invalidatePrefix('categories:');

    return c.json(
      {
        message: 'ምድቡ በተሳካ ሁኔታ ተሻሽሏል',
        data: updatedCategory,
      },
      200
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating category:', error);
    return c.json({ message: 'ምድቡን ማሻሻል አልተቻለም', error: errorMessage }, 500);
  }
};

// delete category temporarily
// @route   DELETE /api/categories/:id
export const deleteCategory = async (c: Context<AppContext>) => {
  try {
    const prisma = c.get('prisma');
    const id = Number(c.req.param('id'));

    const category = await prisma.categories.findFirst({
      where: { id, deleted_at: null },
    });

    if (!category) {
      return c.json({ message: 'የተፈለገው ምድብ አልተገኘም ወይም አስቀድሞ ተሰርዟል' }, 404);
    }

    await prisma.categories.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });

    cache.invalidatePrefix('categories:');

    return c.json({ message: 'ምድቡ በተሳካ ሁኔታ ተሰርዟል' }, 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting category:', error);
    return c.json({ message: 'ምድቡን መሰረዝ አልተቻለም', error: errorMessage }, 500);
  }
};
