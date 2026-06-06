import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import { Product, AppError } from '../../types';

interface GetProductsParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

interface GetProductsResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export const getProducts = async (
  params: GetProductsParams
): Promise<GetProductsResult> => {
  const {
    search,
    category,
    min_price,
    max_price,
    page = 1,
    limit = 12,
  } = params;

  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (search) {
    conditions.push('name LIKE ?');
    values.push(`%${search}%`);
  }

  if (category) {
    conditions.push('category = ?');
    values.push(category);
  }

  if (min_price !== undefined) {
    conditions.push('price >= ?');
    values.push(min_price);
  }

  if (max_price !== undefined) {
    conditions.push('price <= ?');
    values.push(max_price);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM products ${where}`,
    values
  );
  const total = countRows[0].total;

  // Get paginated products
  const offset = (page - 1) * limit;
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    products: rows as Product[],
    total,
    page,
    limit,
  };
};

export const getProductById = async (productId: number): Promise<Product> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM products WHERE id = ?',
    [productId]
  );

  if (rows.length === 0) {
    throw new AppError('Product not found', 404);
  }

  return rows[0] as Product;
};

export const getCategories = async (): Promise<string[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT DISTINCT category FROM products ORDER BY category ASC'
  );

  return rows.map((row) => row.category);
};
