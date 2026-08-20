import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// this interface are  give typescript that hundel error befor run 

export interface CreateSubCategoryItemInput {
  subCategoryId: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

export interface UpdateSubCategoryItemInput {
  subCategoryId?: number;
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
}



//  Create item
export const create = async (data: CreateSubCategoryItemInput) => {
  return await prisma.subcategory_items.create({
    data: {
      subCategoryId: data.subCategoryId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      image: data.image ?? null,
    },
  });
};

//  Get all active items
export const getAll = async () => {
  return await prisma.subcategory_items.findMany({
    where: { deletedAt: null },
    include: {
      subCategory: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

//  Find item by ID
export const findById = async (id: number) => {
  return await prisma.subcategory_items.findFirst({
    where: { id, deletedAt: null },
    include: {
      subCategory: true,
    },
  });
};

//  Find items by SubCategory ID
export const findBySubCategoryId = async (subCategoryId: number) => {
  return await prisma.subcategory_items.findMany({
    where: { subCategoryId, deletedAt: null },
  });
};



//  Update item
export const update = async (
  id: number,
  data: UpdateSubCategoryItemInput
) => {
  const updateData: Prisma.subcategory_itemsUncheckedUpdateInput = {};

  if (data.subCategoryId !== undefined) updateData.subCategoryId = data.subCategoryId;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image !== undefined) updateData.image = data.image;

  return await prisma.subcategory_items.update({
    where: { id },
    data: updateData,
  });
};

//  Soft delete item
export const softDelete = async (id: number) => {
  return await prisma.subcategory_items.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const subcategoryitemModel = {
  getAll,
  findById,
  findBySubCategoryId,
  create,
  update,
  softDelete,
};

export default subcategoryitemModel;
