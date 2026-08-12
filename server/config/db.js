const mysql = require('mysql2/promise');
require('dotenv').config();

// Create MySQL connection pool using .env variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'injibara_ecommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection helper
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connected Successfully (injibara_ecommerce)');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
  }
};

testDbConnection();

module.exports = pool;
