const CategoryModel = require('../models/categoryModel');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.getAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Category fetch error', error: error.message });
  }
};

// @desc    Create new category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'እባክዎ የስም መረጃ ያስገቡ' });
    }

    const categoryId = await CategoryModel.create(name, description);
    res.status(201).json({ message: 'ምድቡ በተሳካ ሁኔታ ተመዝግቧል', categoryId });
  } catch (error) {
    res.status(500).json({ message: 'Category creation error', error: error.message });
  }
};

module.exports = { getCategories, createCategory };