const db = require('../config/db');

class StoreModel {
  // 1. አዲስ Store መፍጠር (seller_id በመጠቀም)
  static async create(sellerId, storeName, description, logo, phone, address) {
    const query = `
      INSERT INTO stores (seller_id, store_name, description, logo, phone, address)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const [result] = await db.execute(query, [
      sellerId,
      storeName,
      description,
      logo,
      phone,
      address,
    ]);
    return result.insertId;
  }

  // 2. የተጠቃሚውን (Seller) Store ማግኘት
  static async getByUserId(sellerId) {
    const query = 'SELECT * FROM stores WHERE seller_id = ?;';
    const [rows] = await db.execute(query, [sellerId]);
    return rows[0];
  }

  // 3. በ ID የ Store መረጃን ማግኘት
  static async getById(storeId) {
    const query = `
      SELECT s.*, u.full_name AS owner_name, u.email AS owner_email
      FROM stores s
      JOIN users u ON s.seller_id = u.id
      WHERE s.id = ?;
    `;
    const [rows] = await db.execute(query, [storeId]);
    return rows[0];
  }

  // 4. ሁሉንም Stores ማምጣት
  static async getAll() {
    const query = 'SELECT * FROM stores WHERE is_active = 1 ORDER BY created_at DESC;';
    const [rows] = await db.execute(query);
    return rows;
  }

  // 5. Store መረጃ ማስተካከል (Update)
  static async update(sellerId, storeName, description, logo, phone, address) {
    const query = `
      UPDATE stores
      SET store_name = ?, description = ?, logo = ?, phone = ?, address = ?
      WHERE seller_id = ?;
    `;
    const [result] = await db.execute(query, [
      storeName,
      description,
      logo,
      phone,
      address,
      sellerId,
    ]);
    return result.affectedRows > 0;
  }

  // 6. Store ማጥፋት
  static async remove(sellerId) {
    const query = 'DELETE FROM stores WHERE seller_id = ?;';
    const [result] = await db.execute(query, [sellerId]);
    return result.affectedRows > 0;
  }
}

module.exports = StoreModel;
