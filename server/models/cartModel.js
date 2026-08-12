const db = require('../config/db');

class CartModel {
  // 1. የተጠቃሚውን Cart ID ማግኘት (ከሌለ አዲስ መፍጠር)
  static async getOrCreateCart(userId) {
    const [existingCart] = await db.execute(
      'SELECT id FROM carts WHERE user_id = ?',
      [userId]
    );

    if (existingCart.length > 0) {
      return existingCart[0].id;
    }

    // Cart ከሌለ አዲስ መፍጠር
    const [newCart] = await db.execute(
      'INSERT INTO carts (user_id) VALUES (?)',
      [userId]
    );
    return newCart.insertId;
  }

  // 2. ዕቃ ወደ cart_items መጨመር
  static async addItem(userId, productId, quantity) {
    const cartId = await this.getOrCreateCart(userId);

    // ዕቃው አስቀድሞ Cart ውስጥ ካለ ብዛቱን መጨመር
    const [existingItem] = await db.execute(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    if (existingItem.length > 0) {
      const updatedQuantity = existingItem[0].quantity + Number(quantity);
      await db.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [updatedQuantity, existingItem[0].id]
      );
      return { message: 'የዕቃው ብዛት ጨምሯል' };
    }

    // አዲስ ዕቃ ከሆነ ማስገባት
    const [result] = await db.execute(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
      [cartId, productId, quantity]
    );
    return result;
  }

  // 3. የተጠቃሚውን የ Cart ዕቃዎች ዝርዝር ማምጣት
  static async getByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT 
          ci.id AS cart_item_id, 
          ci.product_id, 
          ci.quantity, 
          p.name, 
          p.price 
        FROM carts c
        JOIN cart_items ci ON c.id = ci.cart_id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  }

  // 4. የ Cart Item ብዛት ማስተካከል (UPDATE) - አዲስ የተጨመረ
  static async updateItemQuantity(cartItemId, userId, quantity) {
    const [result] = await db.execute(
      `UPDATE cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       SET ci.quantity = ?
       WHERE ci.id = ? AND c.user_id = ?`,
      [quantity, cartItemId, userId]
    );
    return result.affectedRows > 0;
  }

  // 5. ዕቃ ከ Cart ማጥፋት (DELETE) - አዲስ የተጨመረ
  static async removeItem(cartItemId, userId) {
    const [result] = await db.execute(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [cartItemId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CartModel;