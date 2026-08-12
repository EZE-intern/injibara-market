// const db = require('../config/db');
// class PaymentModel {

// static async create({oredr_id, user_id, amount, payment_method, transaction_id, status = 'pending' }) {}

// const query = ` INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)`;

// Const [result] = await db.execute(query, [order_id, user_id, amount, payment_method, transaction_id, status]);

// return result.insertId;


// }



const db = require('../config/db');

class PaymentModel {
  // 1. አዲስ ክፍያ መመዝገብ
  static async create({ order_id, user_id, amount, payment_method, transaction_id, status = 'pending' }) {
   const query = `
  INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_id, status)
  VALUES (?, ?, ?, ?, ?, ?)
`;
    const [result] = await db.execute(query, [
      order_id,
      user_id,
      amount,
      payment_method,
      transaction_id || null,
      status
    ]);
    return result.insertId;
  }

  // 2. በ Order ID የክፍያ መረጃ ማምጣት
  static async getByOrderId(orderId) {
    const query = `SELECT * FROM payments WHERE order_id = ?`;
    const [rows] = await db.execute(query, [orderId]);
    return rows[0] || null;
  }

  // 3. የክፍያ Status መቀየር (ለምሳሌ success ሲሆን)
  static async updateStatus(orderId, status, transactionId = null) {
    const query = `
      UPDATE payments 
      SET status = ?, transaction_id = COALESCE(?, transaction_id)
      WHERE order_id = ?
    `;
    const [result] = await db.execute(query, [status, transactionId, orderId]);
    return result.affectedRows > 0;
  }
}

module.exports = PaymentModel;