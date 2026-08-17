import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../config/db';

// 1. Full User (from database)
export interface IUser extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  password?: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string | null;
  created_at?: Date;
  deleted_at?: Date | null;
}

// 2. Data needed to create a new user
export interface ICreateUserData {
  full_name: string;
  email: string;
  password: string;
  role?: 'customer' | 'seller' | 'admin';
  phone?: string | null;
}

// 3. Data needed to update a user
export interface IUpdateUserData {
  full_name: string;
  email: string;
  phone?: string | null;
  role: 'customer' | 'seller' | 'admin';
}

// ====================== FUNCTIONS ======================

// Find user by email
export const findByEmail = async (email: string): Promise<IUser | undefined> => {
  const [rows] = await db.query<IUser[]>('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

// Find user by ID
export const findById = async (id: number | string): Promise<IUser | undefined> => {
  const [rows] = await db.query<IUser[]>('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

// Create new user
export const create = async (userData: ICreateUserData): Promise<number> => {
  const { full_name, email, password, role = 'customer', phone = null } = userData;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO users (full_name, email, password, role, phone) 
     VALUES (?, ?, ?, ?, ?)`,
    [full_name, email, password, role, phone]
  );

  return result.insertId;
};

// Update user
export const update = async (id: number | string, userData: IUpdateUserData): Promise<boolean> => {
  const { full_name, email, phone = null, role } = userData;

  const [result] = await db.query<ResultSetHeader>(
    `UPDATE users 
     SET full_name = ?, email = ?, phone = ?, role = ?
     WHERE id = ?`,
    [full_name, email, phone, role, id]
  );

  return result.affectedRows > 0;
};

// Soft delete user
export const softDelete = async (id: number | string): Promise<boolean> => {
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE users SET deleted_at = NOW() WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// Get all users
export const getAll = async (): Promise<IUser[]> => {
  const [rows] = await db.query<IUser[]>(
    `SELECT id, full_name, email, phone, role, created_at 
     FROM users 
     WHERE deleted_at IS NULL 
     ORDER BY created_at DESC`
  );
  return rows;
};

// Export all functions together
const userModel = {
  findByEmail,
  findById,
  create,
  update,
  softDelete,
  getAll,
};

export default userModel;
