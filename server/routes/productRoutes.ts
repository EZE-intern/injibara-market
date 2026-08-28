import { Router, Request, Response } from 'express';
import {
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticateUser, authorize } from '../middleware/authMiddleware';
import { uploadProductSides } from '../middleware/pictureUpload';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

const normalizeImageUrl = (imageUrl: unknown): string | null => {
  if (!imageUrl) return null;
  const filename = String(imageUrl)
    .trim()
    .replace(/^\/+/, '')
    .replace(/^uploads\/+/, '');
  if (!filename) return null;
  return `/uploads/${filename}`;
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const { categoryId, category, subCategoryId } = req.query;

    let resolvedCategoryId: number | undefined;
    let resolvedSubCategoryId: number | undefined;

    if (categoryId !== undefined) {
      const id = Number(categoryId);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }
      resolvedCategoryId = id;
    }

    if (resolvedCategoryId === undefined && category !== undefined) {
      const categoryValue = String(category).trim().toLowerCase();

      if (!categoryValue) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be empty',
        });
      }

      let foundCategory = await prisma.categories.findFirst({
        where: { slug: categoryValue },
      });

      if (!foundCategory) {
        const allCategories = await prisma.categories.findMany();
        foundCategory =
          allCategories.find(
            (item: any) =>
              String(item.name).trim().toLowerCase() === categoryValue
          ) || null;
      }

      if (!foundCategory) {
        return res.status(404).json({
          success: false,
          message: `Category "${categoryValue}" not found`,
        });
      }

      resolvedCategoryId = Number(foundCategory.id);
    }

    if (subCategoryId !== undefined) {
      const id = Number(subCategoryId);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subcategory ID',
        });
      }
      resolvedSubCategoryId = id;
    }

    const where: any = {};
    if (resolvedCategoryId !== undefined) {
      where.category_id = resolvedCategoryId;
    }
    if (resolvedSubCategoryId !== undefined) {
      where.sub_category_id = resolvedSubCategoryId;
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
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    const normalizedProducts = products.map((product: any) => ({
      ...product,
      image: normalizeImageUrl(product.image),
      product_images: product.product_images.map((img: any) => ({
        ...img,
        image_url: normalizeImageUrl(img.image_url),
      })),
    }));

    return res.status(200).json({
      success: true,
      categoryId: resolvedCategoryId ?? null,
      subCategoryId: resolvedSubCategoryId ?? null,
      count: normalizedProducts.length,
      data: normalizedProducts,
    });
  } catch (error: any) {
    console.error('GET PRODUCTS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error?.message || 'Unknown error',
    });
  }
});

router.get('/:productId/angles', async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const images = await prisma.product_images.findMany({
      where: { product_id: productId },
    });

    const angles: Record<string, string | null> = {
      front: null,
      back: null,
      top: null,
      bottom: null,
      left: null,
      right: null,
    };

    for (const image of images) {
      if (image.side_angle && image.image_url) {
        const normalizedUrl = normalizeImageUrl(image.image_url);
        if (normalizedUrl) {
          angles[image.side_angle] = normalizedUrl;
        }
      }
    }

    return res.status(200).json(angles);
  } catch (error: any) {
    console.error('GET PRODUCT ANGLES ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product images',
      error: error?.message || 'Unknown error',
    });
  }
});

router.get('/:id', getProductById);

router.post(
  '/',
  authenticateUser,
  authorize('admin', 'seller'),
  uploadProductSides,
  createProduct
);

router.put(
  '/:id',
  authenticateUser,
  authorize('admin', 'seller'),
  uploadProductSides,
  updateProduct
);

router.delete(
  '/:id',
  authenticateUser,
  authorize('admin', 'seller'),
  deleteProduct
);

export default router;
