const db = require('../config/db');

class CategoryModel {
  // ሁሉንም የምድብ ዓይነቶች ማምጣት
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  }

  // አዲስ Category መመዝገብ
  static async create(name, description = '') {
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    const [result] = await db.execute(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name, slug, description]
    );
    return result.insertId;
  }

  // Category መሰረዝ
  static async delete(id) {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = CategoryModel;