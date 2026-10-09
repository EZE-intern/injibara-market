import type { Prisma, PrismaClient } from '@prisma/client';

export type ProductSide = 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right';

export interface CreateProductInput {
  name: string;
  price: number | string;
  description?: string;
  location?: string;
  category_id: number | string;
  seller_id: number | string;
  slug?: string;
  image?: string;
}

export class ProductModel {
  static async getAll(prisma: PrismaClient, categoryId?: number, location?: string) {
    const where: Prisma.productsWhereInput = { deleted_at: null, is_active: true };
    if (categoryId) where.category_id = categoryId;
    if (location) where.location = { contains: location.trim().toLowerCase() };

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

  static async getById(prisma: PrismaClient, id: number) {
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

  static async delete(prisma: PrismaClient, id: number) {
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
