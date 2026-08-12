const db = require('../config/db');

class ReviewModel {
  // 1. አዲስ Review እና Rating መጨመር
  static async create(userId, productId, rating, comment) {
    const query = `
      INSERT INTO reviews (user_id, product_id, rating, comment)
      VALUES (?, ?, ?, ?);
    `;
    const [result] = await db.execute(query, [userId, productId, rating, comment]);
    return result;
  }

  // 2. የአንድን ምርት Review-ዎች በሙሉ ማምጣት (ከ ተጠቃሚው full_name ጋር)
  static async getByProductId(productId) {
    const query = `
      SELECT r.id, r.rating, r.comment, r.created_at, u.id AS user_id, u.full_name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC;
    `;
    const [rows] = await db.execute(query, [productId]);
    return rows;
  }

  // 3. የአንድን ምርት አማካይ Rating (Average Rating) እና አጠቃላይ የ Review ብዛት መስራት
  static async getProductRatingSummary(productId) {
    const query = `
      SELECT 
        COALESCE(AVG(rating), 0) AS averageRating,
        COUNT(id) AS totalReviews
      FROM reviews
      WHERE product_id = ?;
    `;
    const [rows] = await db.execute(query, [productId]);
    return rows[0];
  }

  // 4. ተጠቃሚው ቀደም ብሎ ለዚህ ምርት Review መስጠቱን ማረጋገጥ
  static async findUserReview(userId, productId) {
    const query = 'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?;';
    const [rows] = await db.execute(query, [userId, productId]);
    return rows[0];
  }

  // 5. Review ማስተካከል (Update)
  static async update(reviewId, userId, rating, comment) {
    const query = `
      UPDATE reviews
      SET rating = ?, comment = ?
      WHERE id = ? AND user_id = ?;
    `;
    const [result] = await db.execute(query, [rating, comment, reviewId, userId]);
    return result.affectedRows > 0;
  }

  // 6. Review ማጥፋት (Delete)
  static async remove(reviewId, userId) {
    const query = 'DELETE FROM reviews WHERE id = ? AND user_id = ?;';
    const [result] = await db.execute(query, [reviewId, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = ReviewModel;
