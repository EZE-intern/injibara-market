const ReviewModel = require('../models/reviewModel');
const db = require('../config/db');

// 1. አዲስ Review መጨመር
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'እባክዎ Product ID፣ Rating (1-5) እና Comment ያስገቡ።' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating ከ 1 እስከ 5 ባለው ቁጥር ውስጥ መሆን አለበት።' });
    }

    // ምርቱ በ Products ቴብል ውስጥ መኖሩን ማረጋገጥ
    const [productExists] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
    if (productExists.length === 0) {
      return res.status(404).json({ message: `ID ${productId} የሆነ ምርት አልተገኘም።` });
    }

    // ተጠቃሚው አስቀድሞ አስተያየት ሰጥቶ እንደሆነ ማረጋገጥ
    const existingReview = await ReviewModel.findUserReview(userId, productId);
    if (existingReview) {
      return res.status(400).json({ message: 'ለዚህ ምርት አስቀድመው አስተያየት ሰጥተዋል። ማስተካከል ይችላሉ።' });
    }

    await ReviewModel.create(userId, productId, rating, comment);
    return res.status(201).json({ message: 'አስተያየትዎ በተሳካ ሁኔታ ተመዝግቧል!' });
  } catch (error) {
    return res.status(500).json({ message: 'አስተያየት መመዝገብ አልተቻለም።', error: error.message });
  }
};

// 2. የምርቱን Review-ዎች እና Average Rating ማምጣት
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await ReviewModel.getByProductId(productId);
    const summary = await ReviewModel.getProductRatingSummary(productId);

    return res.status(200).json({
      averageRating: parseFloat(summary.averageRating).toFixed(1),
      totalReviews: summary.totalReviews,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ message: 'Review-ዎችን ማምጣት አልተቻለም።', error: error.message });
  }
};

// 3. Review ማስተካከል
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'እባክዎ Rating እና Comment ያስገቡ።' });
    }

    const isUpdated = await ReviewModel.update(reviewId, userId, rating, comment);

    if (!isUpdated) {
      return res.status(404).json({ message: 'Review-ው አልተገኘም ወይም የማስተካከል ፈቃድ የለዎትም።' });
    }

    return res.status(200).json({ message: 'አስተያየትዎ አስተካክለዋል።' });
  } catch (error) {
    return res.status(500).json({ message: 'Review ማስተካከል አልተቻለም።', error: error.message });
  }
};

// 4. Review ማጥፋት
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const isDeleted = await ReviewModel.remove(reviewId, userId);

    if (!isDeleted) {
      return res.status(404).json({ message: 'Review-ው አልተገኘም ወይም የማጥፋት ፈቃድ የለዎትም።' });
    }

    return res.status(200).json({ message: 'አስተያየትዎ ተወግዷል!' });
  } catch (error) {
    return res.status(500).json({ message: 'Review ማጥፋት አልተቻለም።', error: error.message });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview
};