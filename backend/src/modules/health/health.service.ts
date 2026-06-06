import { pool } from '../../config/db';

export const checkHealth = async (): Promise<boolean> => {
  await pool.query('SELECT 1');
  return true;
};
