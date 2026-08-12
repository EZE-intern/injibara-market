const FavoriteModel = require('../models/favoriteModel');

// 1. ምርትን ወደ Favorite መጨመር (Add to Favorites)
const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'እባክዎ Product ID ያስገቡ።' });
    }

    await FavoriteModel.add(userId, productId);

    return res.status(201).json({
      message: 'ምርቱ ወደ Favorite በተሳካ ሁኔታ ተጨምሯል!',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'ምርቱን ወደ Favorite መጨመር አልተቻለም።',
      error: error.message,
    });
  }
};

// 2. የተጠቃሚውን Favorites በሙሉ ማምጣት (Get User Favorites)
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await FavoriteModel.getByUserId(userId);

    return res.status(200).json(favorites);
  } catch (error) {
    return res.status(500).json({
      message: 'የ Favorite መረጃዎችን ማምጣት አልተቻለም።',
      error: error.message,
    });
  }
};

// 3. ምርትን ከ Favorite ማስወገድ (Remove from Favorites)
const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const isDeleted = await FavoriteModel.remove(userId, productId);

    if (!isDeleted) {
      return res.status(404).json({
        message: 'ምርቱ በ Favorite ውስጥ አልተገኘም።',
      });
    }

    return res.status(200).json({
      message: 'ምርቱ ከ Favorite ተወግዷል!',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'ምርቱን ከ Favorite ማስወገድ አልተቻለም።',
      error: error.message,
    });
  }
};

// 4. ምርት በ Favorite ውስጥ መኖሩን ማረጋገጥ (Check if Favorited)
const checkIsFavorited = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const isFavorited = await FavoriteModel.isFavorited(userId, productId);

    return res.status(200).json({ isFavorited });
  } catch (error) {
    return res.status(500).json({
      message: 'የ Favorite ሁኔታን ማረጋገጥ አልተቻለም።',
      error: error.message,
    });
  }
};

module.exports = {
  addToFavorites,
  getUserFavorites,
  removeFromFavorites,
  checkIsFavorited,
};
