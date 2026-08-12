const ProductModel = require('../models/productModel');

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await ProductModel.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'ምርቶችን ማምጣት አልተቻለም።', error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await ProductModel.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'ምርቱ አልተገኘም።' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'ምርቱን ማምጣት አልተቻለም።', error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, category, store_id, slug } = req.body;

    // pictureupload (Multer) ከተጠቀመ ፎቶው በ req.file ውስጥ ይገኛል
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || null;

    if (!name || !price) {
      return res.status(400).json({ message: 'እባክዎ የስም እና የዋጋ መስኮችን ይሙሉ' });
    }

    const productId = await ProductModel.create({
      name,
      slug: slug || name.toLowerCase().replace(/ /g, '-'),
      description: description || '',
      price,
      stock: stock || 0,
      category: category_id || category || null,
      store_id: store_id || null,
      imageUrl: imageUrl, // የፎቶውን path ወደ Model መላክ
    });

    res.status(201).json({
      message: 'ምርቱ በተሳካ ሁኔታ ተመዝግቧል!',
      productId,
    });
  } catch (error) {
    res.status(500).json({ message: 'ምርቱን መመዝገብ አልተቻለም።', error: error.message });
  }
};

// @desc    Soft Delete product by ID
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // ምርቱ ዳታቤዝ ላይ እንዳለ ማረጋገጥ
    const product = await ProductModel.getById(productId);
    if (!product) {
      return res.status(404).json({ message: 'ምርቱ አልተገኘም።' });
    }

    // Soft Delete ለማድረግ Model ላይ መጥራት (delete method ካለህ)
    if (ProductModel.delete) {
      await ProductModel.delete(productId);
    }

    res.json({ message: `ምርት ቁጥር ${productId} በተሳካ ሁኔታ ተሰርዟል!` });
  } catch (error) {
    res.status(500).json({ message: 'ምርቱን ማጥፋት አልተቻለም።', error: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, deleteProduct };
