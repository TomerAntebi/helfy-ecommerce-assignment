import { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { pool } from '../../config/db';
import { Order, OrderItemWithProduct, CartItemWithProduct, AppError } from '../../types';

interface CreateOrderData {
  shipping_full_name: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer';
  payment_last_four?: string;
}

// ─── Private helpers ───────────────────────────────────────────────────────────

const SELECT_ORDER_COLS = `
  id, user_id, status, total_amount,
  shipping_full_name, shipping_street, shipping_city, shipping_state,
  shipping_zip_code, shipping_country, payment_method, payment_last_four,
  created_at, updated_at`;

const CART_ITEM_JOIN_SQL = `SELECT
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
JOIN products p ON ci.product_id = p.id`;

const mapCartItemRow = (row: RowDataPacket): CartItemWithProduct => ({
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
});

const fetchCartItemsForOrder = async (
  userId: number
): Promise<CartItemWithProduct[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${CART_ITEM_JOIN_SQL} WHERE ci.user_id = ?`,
    [userId]
  );
  return rows.map(mapCartItemRow);
};

const ensureCartIsNotEmpty = (items: CartItemWithProduct[]): void => {
  if (items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }
};

const validateCartStock = (items: CartItemWithProduct[]): void => {
  for (const item of items) {
    if (item.product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for: ${item.product.name}`, 400);
    }
  }
};

const reduceStockForOrderItems = async (
  conn: PoolConnection,
  items: CartItemWithProduct[]
): Promise<void> => {
  for (const item of items) {
    const [result] = await conn.query<ResultSetHeader>(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [item.quantity, item.product_id, item.quantity]
    );
    if (result.affectedRows === 0) {
      throw new AppError(`Insufficient stock for: ${item.product.name}`, 400);
    }
  }
};

const createOrderRecord = async (
  conn: PoolConnection,
  userId: number,
  totalAmount: number,
  data: CreateOrderData
): Promise<number> => {
  const [result] = await conn.query<ResultSetHeader>(
    `INSERT INTO orders (
      user_id, total_amount,
      shipping_full_name, shipping_street, shipping_city, shipping_state,
      shipping_zip_code, shipping_country, payment_method, payment_last_four
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      totalAmount,
      data.shipping_full_name,
      data.shipping_street,
      data.shipping_city,
      data.shipping_state,
      data.shipping_zip_code,
      data.shipping_country,
      data.payment_method,
      data.payment_last_four || null,
    ]
  );
  return result.insertId;
};

const insertOrderItems = async (
  conn: PoolConnection,
  orderId: number,
  items: CartItemWithProduct[]
): Promise<void> => {
  for (const item of items) {
    await conn.query<ResultSetHeader>(
      'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
      [orderId, item.product_id, item.quantity, item.product.price]
    );
  }
};

const clearUserCart = async (
  conn: PoolConnection,
  userId: number
): Promise<void> => {
  await conn.query<ResultSetHeader>(
    'DELETE FROM cart_items WHERE user_id = ?',
    [userId]
  );
};

// ─── Public service functions ──────────────────────────────────────────────────

export const createOrder = async (
  userId: number,
  data: CreateOrderData
): Promise<Order> => {
  const cartItems = await fetchCartItemsForOrder(userId);
  ensureCartIsNotEmpty(cartItems);
  validateCartStock(cartItems);

  const total_amount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    await reduceStockForOrderItems(connection, cartItems);
    const orderId = await createOrderRecord(connection, userId, total_amount, data);
    await insertOrderItems(connection, orderId, cartItems);
    await clearUserCart(connection, userId);
    await connection.commit();

    const [orderRows] = await pool.query<RowDataPacket[]>(
      `SELECT ${SELECT_ORDER_COLS} FROM orders WHERE id = ?`,
      [orderId]
    );

    return orderRows[0] as Order;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getOrders = async (userId: number): Promise<Order[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${SELECT_ORDER_COLS} FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows as Order[];
};

interface OrderWithItems {
  order: Order;
  items: OrderItemWithProduct[];
}

export const getOrderById = async (
  userId: number,
  orderId: number
): Promise<OrderWithItems> => {
  const [orderRows] = await pool.query<RowDataPacket[]>(
    `SELECT ${SELECT_ORDER_COLS} FROM orders WHERE id = ?`,
    [orderId]
  );

  if (orderRows.length === 0) {
    throw new AppError('Order not found', 404);
  }

  if (orderRows[0].user_id !== userId) {
    throw new AppError('Access denied', 403);
  }

  const order = orderRows[0] as Order;

  const [itemRows] = await pool.query<RowDataPacket[]>(
    `SELECT
      oi.id,
      oi.order_id,
      oi.product_id,
      oi.quantity,
      oi.price_at_purchase,
      p.id          AS p_id,
      p.name        AS p_name,
      p.description AS p_description,
      p.price       AS p_price,
      p.image_url   AS p_image_url,
      p.category    AS p_category,
      p.stock       AS p_stock,
      p.created_at  AS p_created_at
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?`,
    [orderId]
  );

  const items: OrderItemWithProduct[] = itemRows.map((row) => ({
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    quantity: row.quantity,
    price_at_purchase: row.price_at_purchase,
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

  return { order, items };
};
