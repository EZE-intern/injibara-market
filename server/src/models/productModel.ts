import { prisma } from '../lib/prisma.js';

export type ProductSide = 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right';

export interface CreateProductInput {
  name: string;
  price: number | string;
  description?: string;
  category_id: number | string;
  seller_id: number | string;
  slug?: string;
  image?: string;
}

export class ProductModel {
  static async getAll(categoryId?: number) {
    const where: any = { deleted_at: null, is_active: true };
    if (categoryId) where.category_id = categoryId;

    return await prisma.products.findMany({
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
  }

  static async getById(id: number) {
    return await prisma.products.findUnique({
      where: { id: Number(id) },
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
  }

  static async delete(id: number) {
    // Soft delete - set deleted_at and is_active
    return await prisma.products.update({
      where: { id: Number(id) },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });
  }
}

export default ProductModel;
