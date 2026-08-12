const CartModel = require('../models/cartModel');

const addItemToCart = async (req, res) => {
  try {
    const { productId, product_id, quantity } = req.body;

    // authMiddleware የጫነውን ተጠቃሚ ID መውሰድ
    const userId = req.user ? req.user.id || req.user.userId || req.user.user_id : null;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized, User ID አልተገኘም' });
    }

    const selectedProduct = productId || product_id;

    if (!selectedProduct) {
      return res.status(400).json({ message: 'እባክዎ Product ID ያስገቡ' });
    }

    const cart = await CartModel.addItem(userId, selectedProduct, quantity || 1);

    res.status(201).json({
      message: 'ዕቃው ወደ Cart በተሳካ ሁኔታ ተጨምሯል!',
      cart,
    });
  } catch (error) {
    console.error('Cart Error Detail:', error);
    res.status(500).json({ message: 'Cart error', error: error.message });
  }
};

const getUserCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId || req.user.user_id : null;
    const items = await CartModel.getByUserId(userId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Cart error', error: error.message });
  }
};
// UPDATE quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id;
    const cartItemId = req.params.id;
    const { quantity } = req.body;

    const updated = await CartModel.updateItemQuantity(cartItemId, userId, quantity);
    if (!updated) {
      return res.status(404).json({ message: 'Cart item አልተገኘም!' });
    }

    res.json({ message: 'የዕቃው ብዛት ተስተካክሏል!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE item
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.user_id;
    const cartItemId = req.params.id;

    const removed = await CartModel.removeItem(cartItemId, userId);
    if (!removed) {
      return res.status(404).json({ message: 'Cart item አልተገኘም!' });
    }

    res.json({ message: 'ዕቃው ከቅርጫት ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addItemToCart, getUserCart, updateCartItem, removeCartItem };
