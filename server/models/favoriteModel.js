const db = require('../config/db');

class FavoriteModel {
  //  Add to Favorites
  static async add(userId, productId) {
    const query = `
      INSERT INTO favorites (user_id, product_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE id=id;
    `;
    const [result] = await db.execute(query, [userId, productId]);
    return result;
  }

  // Get User Favorites
  static async getByUserId(userId) {
    const query = `
      SELECT f.id AS favorite_id, f.created_at, p.*
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC;
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Remove from Favorites table
  static async remove(userId, productId) {
    const query = `
      DELETE FROM favorites 
      WHERE user_id = ? AND product_id = ?;
    `;
    const [result] = await db.execute(query, [userId, productId]);
    return result.affectedRows > 0;
  }

  //  (Check if Favorited)
  static async isFavorited(userId, productId) {
    const query = `
      SELECT id FROM favorites 
      WHERE user_id = ? AND product_id = ?;
    `;
    const [rows] = await db.execute(query, [userId, productId]);
    return rows.length > 0;
  }
}

module.exports = FavoriteModel;
