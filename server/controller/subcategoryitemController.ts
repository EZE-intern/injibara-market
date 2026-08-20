import { Request, Response } from 'express';
import subcategoryitemModel from '../models/subcategoryitemModel';


export const createSubCategoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subCategoryId, name, slug, description, image } = req.body;

    if (!subCategoryId || !name || !slug) {
      res.status(400).json({ message: 'subCategoryId, name, and slug are required' });
      return;
    }

    const newItem = await subcategoryitemModel.create({
      subCategoryId: Number(subCategoryId),
      name,
      slug,
      description,
      image,
    });

    res.status(201).json({
      message: 'Subcategory item created successfully',
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subcategory item', error });
  }
};

export const getAllSubCategoryItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await subcategoryitemModel.getAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subcategory items', error });
  }
};

export const getSubCategoryItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await subcategoryitemModel.findById(Number(id));

    if (!item) {
      res.status(404).json({ message: 'Subcategory item not found' });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subcategory item', error });
  }
};

export const getItemsBySubCategoryId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subCategoryId } = req.params;
    const items = await subcategoryitemModel.findBySubCategoryId(Number(subCategoryId));

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch items for subcategory', error });
  }
};



export const updateSubCategoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { subCategoryId, name, slug, description, image } = req.body;

    const updatedItem = await subcategoryitemModel.update(Number(id), {
      subCategoryId: subCategoryId ? Number(subCategoryId) : undefined,
      name,
      slug,
      description,
      image,
    });

    res.status(200).json({
      message: 'Subcategory item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subcategory item', error });
  }
};

export const deleteSubCategoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await subcategoryitemModel.softDelete(Number(id));

    res.status(200).json({ message: 'Subcategory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subcategory item', error });
  }
};
