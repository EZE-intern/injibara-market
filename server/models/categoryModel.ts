import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../config/db';

export interface ICategory extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  created_at?: Date;
  deleted_at?: Date | null;
}


 // create new category
  static async create(name: string, description: string = ''): Promise<number> {
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name, slug, description]
    );
    return result.insertId;
  }

export class CategoryModel {
  // Bringing all category types
  static async getAll(): Promise<ICategory[]> {
    const [rows] = await db.execute<ICategory[]>('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  }

 

  //  delete Category 
  static async delete(id: number | string): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default CategoryModel;
