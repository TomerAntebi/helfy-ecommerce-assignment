import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../../config/db';
import { User, AppError } from '../../types';

export const getUserById = async (userId: number): Promise<User> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, email, first_name, last_name, phone, address, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return rows[0] as User;
};

interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

export const updateUser = async (
  userId: number,
  data: UpdateUserData
): Promise<User> => {
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.first_name !== undefined) {
    updates.push('first_name = ?');
    values.push(data.first_name);
  }
  if (data.last_name !== undefined) {
    updates.push('last_name = ?');
    values.push(data.last_name);
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?');
    values.push(data.phone);
  }
  if (data.address !== undefined) {
    updates.push('address = ?');
    values.push(data.address);
  }

  if (updates.length === 0) {
    return getUserById(userId);
  }

  values.push(userId);

  await pool.query<ResultSetHeader>(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return getUserById(userId);
};
