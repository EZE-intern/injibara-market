// ከ MySQL ዳታቤዝ ጋር በመገናኘት ምርቶችን ለመመዝገብ እና ለመጠየቅ የሚያገለግል ፋይል ነው።

const db = require('../config/db');

class ProductModel {
  // 1. ሁሉንም የተፈቀዱ (Approved) ምርቶች ከነፎቷቸው ማምጫ
  static async getAll() {
    const query = `
      SELECT p.*, pi.image_url 
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE p.status = 'approved' AND p.deleted_at IS NULL
      ORDER BY p.id DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  // 2. አንድ ምርት በ ID ማምጫ (ከነሙሉ ምስሎቹ)
  static async getById(id) {
    const query = `
      SELECT p.*, GROUP_CONCAT(pi.image_url) AS all_images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ? AND p.deleted_at IS NULL
      GROUP BY p.id
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // 3. አዲስ ምርት መመዝገቢያ (ከነ ሱቅ ID እና ምስል ጋር)
  static async create({ name, slug, description, price, stock, category, store_id, imageUrl }) {
    // ሀ. ምርቱን በ Products Table ውስጥ መመዝገብ (መጀመሪያ Status 'pending' ይሆናል)
    const [result] = await db.execute(
      `INSERT INTO products (store_id, category_id, name, slug, description, price, stock, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        store_id || null,
        category || null,
        name,
        slug || name.toLowerCase().replace(/ /g, '-'),
        description,
        price,
        stock,
      ]
    );

    const productId = result.insertId;

    // ለ. ምስል ካለ ወደ product_images Table ማስገባት
    if (imageUrl) {
      await db.execute(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)',
        [productId, imageUrl]
      );
    }

    return productId;
  }
  // Soft Delete Method:
  static async delete(id) {
    const [result] = await db.execute(
      'UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result;
  }
}

module.exports = ProductModel;
