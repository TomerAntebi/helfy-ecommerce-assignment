import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';

interface ValidateCartRequest {
  cart_item_ids: number[];
}

interface ValidateCartResponse {
  valid: boolean;
  errors: string[];
}

export const validateCart = async (
  userId: number,
  data: ValidateCartRequest
): Promise<ValidateCartResponse> => {
  const errors: string[] = [];

  if (!data.cart_item_ids || data.cart_item_ids.length === 0) {
    return { valid: false, errors: ['No cart items provided'] };
  }

  // Fetch cart items with product data
  const placeholders = data.cart_item_ids.map(() => '?').join(',');
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      ci.id,
      ci.quantity,
      p.id AS product_id,
      p.name,
      p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.id IN (${placeholders}) AND ci.user_id = ?`,
    [...data.cart_item_ids, userId]
  );

  // Check if all requested items exist
  if (rows.length !== data.cart_item_ids.length) {
    errors.push('Some cart items not found');
  }

  // Check stock for each item
  for (const row of rows) {
    if (row.stock < row.quantity) {
      errors.push(`Insufficient stock for: ${row.name}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
