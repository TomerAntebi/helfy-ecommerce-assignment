import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../../config/db';
import { CartItemWithProduct, AppError } from '../../types';

interface CartResult {
  items: CartItemWithProduct[];
  total: number;
}

export const getCart = async (userId: number): Promise<CartResult> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      ci.id,
      ci.user_id,
      ci.product_id,
      ci.quantity,
      ci.created_at,
      ci.updated_at,
      p.id          AS p_id,
      p.name        AS p_name,
      p.description AS p_description,
      p.price       AS p_price,
      p.image_url   AS p_image_url,
      p.category    AS p_category,
      p.stock       AS p_stock,
      p.created_at  AS p_created_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?`,
    [userId]
  );

  const items: CartItemWithProduct[] = rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    quantity: row.quantity,
    created_at: row.created_at,
    updated_at: row.updated_at,
    product: {
      id: row.p_id,
      name: row.p_name,
      description: row.p_description,
      price: row.p_price,
      image_url: row.p_image_url,
      category: row.p_category,
      stock: row.p_stock,
      created_at: row.p_created_at,
    },
  }));

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return { items, total };
};

export const addItem = async (
  userId: number,
  productId: number,
  quantity: number
): Promise<CartItemWithProduct> => {
  // Validate product exists and has sufficient stock
  const [productRows] = await pool.query<RowDataPacket[]>(
    'SELECT id, stock FROM products WHERE id = ?',
    [productId]
  );

  if (productRows.length === 0) {
    throw new AppError('Product not found', 404);
  }

  // Check existing cart quantity for this user + product before upsert
  const [existingRows] = await pool.query<RowDataPacket[]>(
    'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
  const existingQty = existingRows.length > 0 ? (existingRows[0].quantity as number) : 0;

  if (productRows[0].stock < existingQty + quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  // Upsert cart item
  await pool.query<ResultSetHeader>(
    `INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [userId, productId, quantity]
  );

  // Get the updated cart item
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      ci.id,
      ci.user_id,
      ci.product_id,
      ci.quantity,
      ci.created_at,
      ci.updated_at,
      p.id          AS p_id,
      p.name        AS p_name,
      p.description AS p_description,
      p.price       AS p_price,
      p.image_url   AS p_image_url,
      p.category    AS p_category,
      p.stock       AS p_stock,
      p.created_at  AS p_created_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ? AND ci.product_id = ?`,
    [userId, productId]
  );

  const row = rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    quantity: row.quantity,
    created_at: row.created_at,
    updated_at: row.updated_at,
    product: {
      id: row.p_id,
      name: row.p_name,
      description: row.p_description,
      price: row.p_price,
      image_url: row.p_image_url,
      category: row.p_category,
      stock: row.p_stock,
      created_at: row.p_created_at,
    },
  };
};

export const updateItem = async (
  userId: number,
  itemId: number,
  quantity: number
): Promise<CartItemWithProduct | null> => {
  // If quantity is 0 or less, delete the item
  if (quantity <= 0) {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );
    if (result.affectedRows === 0) {
      throw new AppError('Cart item not found', 404);
    }
    return null;
  }

  // Fetch item + product stock in one query to validate before updating
  const [stockRows] = await pool.query<RowDataPacket[]>(
    `SELECT p.stock FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.id = ? AND ci.user_id = ?`,
    [itemId, userId]
  );

  if (stockRows.length === 0) {
    throw new AppError('Cart item not found', 404);
  }

  if ((stockRows[0].stock as number) < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  // Update quantity
  await pool.query<ResultSetHeader>(
    'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, itemId, userId]
  );

  // Get the updated cart item
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      ci.id,
      ci.user_id,
      ci.product_id,
      ci.quantity,
      ci.created_at,
      ci.updated_at,
      p.id          AS p_id,
      p.name        AS p_name,
      p.description AS p_description,
      p.price       AS p_price,
      p.image_url   AS p_image_url,
      p.category    AS p_category,
      p.stock       AS p_stock,
      p.created_at  AS p_created_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.id = ?`,
    [itemId]
  );

  const row = rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    quantity: row.quantity,
    created_at: row.created_at,
    updated_at: row.updated_at,
    product: {
      id: row.p_id,
      name: row.p_name,
      description: row.p_description,
      price: row.p_price,
      image_url: row.p_image_url,
      category: row.p_category,
      stock: row.p_stock,
      created_at: row.p_created_at,
    },
  };
};

export const removeItem = async (
  userId: number,
  itemId: number
): Promise<void> => {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [itemId, userId]
  );

  if (result.affectedRows === 0) {
    throw new AppError('Cart item not found', 404);
  }
};

export const clearCart = async (userId: number): Promise<void> => {
  await pool.query<ResultSetHeader>(
    'DELETE FROM cart_items WHERE user_id = ?',
    [userId]
  );
};
