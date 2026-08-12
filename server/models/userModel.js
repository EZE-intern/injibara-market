const db = require('../config/db');

// 1. Find user by email
const findByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

// 2. Find user by ID
const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

// 3. Create new user
const create = async (userData) => {
  const { full_name, email, password, role, phone } = userData;

  const [result] = await db.query(
    `INSERT INTO users (full_name, email, password, role, phone) 
     VALUES (?, ?, ?, ?, ?)`,
    [full_name, email, password, role || 'customer', phone || null]
  );

  return result.insertId;
};

// 4. Update user
const update = async (id, userData) => {
  const { full_name, email, phone, role } = userData;

  const [result] = await db.query(
    `UPDATE users 
     SET full_name = ?, email = ?, phone = ?, role = ?
     WHERE id = ?`,
    [full_name, email, phone || null, role, id]
  );

  return result.affectedRows > 0;
};

// 5. Soft delete user
const softDelete = async (id) => {
  const [result] = await db.query(`UPDATE users SET deleted_at = NOW() WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

// 6. Get all users (optional - for admin)
const getAll = async () => {
  const [rows] = await db.query(
    `SELECT id, full_name, email, phone, role, created_at 
     FROM users 
     WHERE deleted_at IS NULL 
     ORDER BY created_at DESC`
  );
  return rows;
};

module.exports = {
  findByEmail,
  findById,
  create,
  update,
  softDelete,
  getAll,
};
