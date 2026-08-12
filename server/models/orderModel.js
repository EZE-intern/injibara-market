const db = require('../config/db');

class OrderModel {
  // 1. ሁሉንም ኦርደሮች ማምጫ
  static async getAll() {
    const query = `
      SELECT 
        o.*, 
        u.full_name AS customer_name,
        a.region, a.city, a.kebele, a.phone AS shipping_phone,
        p.status AS payment_status, p.payment_method
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      LEFT JOIN payments p ON o.id = p.order_id
      ORDER BY o.id DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  // 2. የአንድን ተጠቃሚ (User) ኦርደሮች ማምጫ
  static async getByUserId(userId) {
    const query = `
      SELECT 
        o.*, 
        a.region, a.city, a.kebele,
        p.status AS payment_status
      FROM orders o
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.user_id = ?
      ORDER BY o.id DESC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // 3. የአንድን ኦርደር ዝርዝር በ ID ማምጫ
  static async getById(id) {
    const orderQuery = `
      SELECT 
        o.*, 
        u.full_name AS customer_name, u.email AS customer_email,
        a.region, a.city, a.kebele, a.phone AS shipping_phone,
        p.status AS payment_status, p.payment_method, p.transaction_id
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.shipping_address_id = a.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = ?
    `;
    const [orders] = await db.execute(orderQuery, [id]);
    if (orders.length === 0) return null;

    const itemsQuery = `
      SELECT oi.*, p.name AS product_name 
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    const [items] = await db.execute(itemsQuery, [id]);

    return { ...orders[0], items };
  }

  // 4. አዲስ ኦርደር መመዝገቢያ
  static async create({ user_id, shipping_address_id, total_amount, note, items }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const orderNumber = 'ORD-' + Date.now();

      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, shipping_address_id, order_number, total_amount, status, note) 
         VALUES (?, ?, ?, ?, 'pending', ?)`,
        [user_id, shipping_address_id || null, orderNumber, total_amount, note || null]
      );
      const orderId = orderResult.insertId;

      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) 
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.product_name || '', item.price, item.quantity]
        );
      }

      await connection.execute(
        `INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, 'pending', ?)`,
        [orderId, user_id]
      );

      await connection.commit();
      return { orderId, orderNumber };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 5. የኦርደር Status መቀየሪያ
  static async updateStatus(orderId, status, changedByUserId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );

      await connection.execute(
        'INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, ?, ?)',
        [orderId, status, changedByUserId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = OrderModel;