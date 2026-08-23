import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';





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

    return res.status(201).json({
      message: 'ምድቡ በተሳካ ሁኔታ ተፈጥሯል',
      data: newCategory,
    });
  } catch (error: unkown) {
    console.error('Category creation error:', error);
    return res.status(500).json({
      message: 'ምድብ መፍጠር አልተቻለም',
      error: error.message,
    });
  }
};

// get all categories
// @route   GET /api/categories
export const getCategories = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      message: 'የምድብ መረጃዎችን ማምጣት አልተቻለም',
      error: error.message,
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
    console.error('Error fetching category:', error);
    return res.status(500).json({
      message: 'የአገልጋይ ስህተት አጋጥሟል',
      error: error.message,
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

    return res.status(200).json({
      message: 'ምድቡ በተሳካ ሁኔታ ተሻሽሏል',
      data: updatedCategory,
    });
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      message: 'ምድቡን ማሻሻል አልተቻለም',
      error: error.message,
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

    return res.status(200).json({
      message: 'ምድቡ በተሳካ ሁኔታ ተሰርዟል',
    });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      message: 'ምድቡን መሰረዝ አልተቻለም',
      error: error.message,
    });
  }
};
