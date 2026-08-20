import { Request, Response } from 'express';
import subCategoryModel from '../models/subcategoryModel';

export const getAllSubCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const subCategories = await subCategoryModel.getAll();
    res.status(200).json(subCategories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get sub categories', error });
  }
};

export const getSubCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subCategory = await subCategoryModel.findById(Number(id));

    if (!subCategory) {
      res.status(404).json({ message: 'Sub category not found' });
      return;
    }

    res.status(200).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get sub category', error });
  }
};

export const getSubCategoriesByCategoryId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const subCategories = await subCategoryModel.findByCategoryId(Number(categoryId));

    res.status(200).json(subCategories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get sub categories', error });
  }
};

export const createSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, name, slug, description, image } = req.body;

    if (!categoryId || !name || !slug) {
      res.status(400).json({ message: 'categoryId, name and slug are required' });
      return;
    }

    const newSubCategory = await subCategoryModel.create({
      categoryId: Number(categoryId),
      name,
      slug,
      description,
      image,
    });

    res.status(201).json({
      message: 'Sub category created successfully',
      data: newSubCategory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create sub category', error });
  }
};

export const updateSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { categoryId, name, slug, description, image } = req.body;

    const updated = await subCategoryModel.update(Number(id), {
      categoryId: categoryId ? Number(categoryId) : undefined,
      name,
      slug,
      description,
      image,
    });

    res.status(200).json({
      message: 'Sub category updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update sub category', error });
  }
};

export const deleteSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await subCategoryModel.softDelete(Number(id));

    res.status(200).json({ message: 'Sub category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete sub category', error });
  }
};
