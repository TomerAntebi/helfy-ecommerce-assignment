import { RowDataPacket, ResultSetHeader } from 'mysql2';
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

export const createOrder = async (
  userId: number,
  data: CreateOrderData
): Promise<Order> => {
  // Step 1: Fetch cart items with product data
  const [cartRows] = await pool.query<RowDataPacket[]>(
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

  // Step 2: Check if cart is empty
  if (cartRows.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const cartItems: CartItemWithProduct[] = cartRows.map((row) => ({
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

  // Step 3: Pre-flight stock check (before opening transaction)
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for: ${item.product.name}`, 400);
    }
  }

  // Step 4-9: Atomic transaction
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Step 4: Reduce stock for each item atomically with concurrency guard
    for (const item of cartItems) {
      const [result] = await connection.query<ResultSetHeader>(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.quantity, item.product_id, item.quantity]
      );

      if (result.affectedRows === 0) {
        throw new AppError(`Insufficient stock for: ${item.product.name}`, 400);
      }
    }

    // Step 5: Compute total
    const total_amount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Step 6: Insert order
    const [orderResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO orders (
        user_id,
        total_amount,
        shipping_full_name,
        shipping_street,
        shipping_city,
        shipping_state,
        shipping_zip_code,
        shipping_country,
        payment_method,
        payment_last_four
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        total_amount,
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

    const orderId = orderResult.insertId;

    // Step 7: Insert order_items (store price_at_purchase from current product price)
    for (const item of cartItems) {
      await connection.query<ResultSetHeader>(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.product.price]
      );
    }

    // Step 8: Clear cart
    await connection.query<ResultSetHeader>(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    await connection.commit();

    // Fetch and return the created order
    const [orderRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM orders WHERE id = ?',
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
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
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
  // Query by id only first to distinguish 404 (not found) from 403 (wrong owner)
  const [orderRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM orders WHERE id = ?',
    [orderId]
  );

  if (orderRows.length === 0) {
    throw new AppError('Order not found', 404);
  }

  if (orderRows[0].user_id !== userId) {
    throw new AppError('Access denied', 403);
  }

  const order = orderRows[0] as Order;

  // Get order items with product data
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
