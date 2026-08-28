import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ProductSide =
  | 'front'
  | 'back'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

export interface CreateProductInput {
  name: string;
  price: number | string;
  description?: string;
  category_id: number | string;
  seller_id: number | string;
  slug?: string;
  image?: string;
}

const normalizeImageName = (value: string): string => {
  return String(value)
    .trim()
    .replace(/^[/\\]+/, '')
    .replace(/^uploads[/\\]+/, '');
};

export class ProductModel {
  static async getAll() {
    return await prisma.products.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        description: true,
        image: true,
        category_id: true,
        seller_id: true,
        created_at: true,
        product_images: {
          select: {
            id: true,
            image_url: true,
            side_angle: true,
            is_primary: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  static async getByCategory(categoryId: number) {
    return await prisma.products.findMany({
      where: { category_id: Number(categoryId) },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        description: true,
        image: true,
        category_id: true,
        seller_id: true,
        created_at: true,
        product_images: {
          select: {
            id: true,
            image_url: true,
            side_angle: true,
            is_primary: true,
          },
        },
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
            { id: 'asc' },
          ],
        },
      },
    });
  }

  static async create(
    data: CreateProductInput,
    images?: Partial<Record<ProductSide, string>>
  ) {
    const name = String(data.name ?? '').trim();
    if (!name) throw new Error('Product name is required');

    const price = Number(data.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error('Invalid product price');
    }

    const categoryId = Number(data.category_id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      throw new Error('Invalid category ID');
    }

    const sellerId = Number(data.seller_id);
    if (!Number.isInteger(sellerId) || sellerId <= 0) {
      throw new Error('Invalid seller ID');
    }

    const seller = await prisma.users.findUnique({ where: { id: sellerId } });
    if (!seller) throw new Error(`User ${sellerId} does not exist`);

    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new Error(`Category ${categoryId} does not exist`);

    const normalizedImages: Partial<Record<ProductSide, string>> = {};
    if (images) {
      for (const [side, imageUrl] of Object.entries(images)) {
        if (imageUrl && String(imageUrl).trim()) {
          normalizedImages[side as ProductSide] = normalizeImageName(
            String(imageUrl)
          );
        }
      }
    }

    const primaryImage =
      data.image
        ? normalizeImageName(data.image)
        : normalizedImages.front ?? null;

    const generatedSlug =
      data.slug?.trim() ||
      `${name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')}-${Date.now()}`;

    return await prisma.$transaction(async (tx) => {
      const newProduct = await tx.products.create({
        data: {
          name,
          slug: generatedSlug,
          price,
          description: data.description?.trim() || '',
          category_id: categoryId,
          seller_id: sellerId,
          image: primaryImage,
        },
      });

      for (const [side, imageUrl] of Object.entries(normalizedImages)) {
        if (!imageUrl) continue;

        await tx.product_images.create({
          data: {
            product_id: newProduct.id,
            image_url: imageUrl,
            side_angle: side,
            is_primary: side === 'front',
          },
        });
      }

      return newProduct.id;
    });
  }

  static async update(
    id: number,
    data: Partial<CreateProductInput>,
    images?: Partial<Record<ProductSide, string>>
  ) {
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new Error('Invalid product ID');
    }

    return await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.products.update({
        where: { id: productId },
        data: {
          ...(data.name !== undefined && {
            name: String(data.name).trim(),
          }),
          ...(data.price !== undefined && {
            price: Number(data.price),
          }),
          ...(data.description !== undefined && {
            description: String(data.description).trim(),
          }),
          ...(data.category_id !== undefined && {
            category_id: Number(data.category_id),
          }),
          ...(data.slug !== undefined && {
            slug: String(data.slug).trim(),
          }),
          ...(data.image !== undefined && {
            image: normalizeImageName(data.image),
          }),
        },
      });

      if (images) {
        for (const [side, rawUrl] of Object.entries(images)) {
          if (!rawUrl) continue;

          const imageUrl = normalizeImageName(rawUrl);

          const existingImage = await tx.product_images.findFirst({
            where: {
              product_id: productId,
              side_angle: side,
            },
          });

          if (existingImage) {
            await tx.product_images.update({
              where: { id: existingImage.id },
              data: {
                image_url: imageUrl,
                is_primary: side === 'front',
              },
            });
          } else {
            await tx.product_images.create({
              data: {
                product_id: productId,
                image_url: imageUrl,
                side_angle: side,
                is_primary: side === 'front',
              },
            });
          }
        }
      }

      // front ን primary አድርግ
      const frontImage = await tx.product_images.findFirst({
        where: {
          product_id: productId,
          side_angle: 'front',
        },
      });

      if (frontImage) {
        await tx.product_images.updateMany({
          where: { product_id: productId },
          data: { is_primary: false },
        });

        await tx.product_images.update({
          where: { id: frontImage.id },
          data: { is_primary: true },
        });

        await tx.products.update({
          where: { id: productId },
          data: { image: frontImage.image_url },
        });
      }

      return updatedProduct;
    });
  }

  static async delete(id: number) {
    return await prisma.products.delete({
      where: { id: Number(id) },
    });
  }
}

export default ProductModel;
