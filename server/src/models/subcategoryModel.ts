import { PrismaClient, sub_categories, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateSubCategoryInput {
  categoryId: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

export interface UpdateSubCategoryInput {
  categoryId?: number;
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
}

//  Create new subcategory
export const create = async (data: CreateSubCategoryInput): Promise<sub_categories> => {
  return await prisma.sub_categories.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      image: data.image ?? null,
    },
  });
};

//  Get all active subcategories
export const getAll = async (): Promise<sub_categories[]> => {
  return await prisma.sub_categories.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
};

//  Find subcategory by id
export const findById = async (id: number): Promise<sub_categories | null> => {
  return await prisma.sub_categories.findFirst({
    where: { id, deletedAt: null },
  });
};

//  Find subcategories by Category id
export const findByCategoryId = async (categoryId: number): Promise<sub_categories[]> => {
  return await prisma.sub_categories.findMany({
    where: { categoryId, deletedAt: null },
  });
};



//  Update subcategory
export const update = async (
  id: number,
  data: UpdateSubCategoryInput
): Promise<sub_categories> => {
  const updateData: Prisma.sub_categoriesUncheckedUpdateInput = {};

  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image !== undefined) updateData.image = data.image;

  return await prisma.sub_categories.update({
    where: { id },
    data: updateData,
  });
};

//  Soft delete or (temporerly delete) subcategory
export const softDelete = async (id: number): Promise<sub_categories> => {
  return await prisma.sub_categories.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const subCategoryModel = {
  getAll,
  findById,
  findByCategoryId,
  create,
  update,
  softDelete,
};

export default subCategoryModel;
