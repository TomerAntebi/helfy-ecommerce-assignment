import mysql from 'mysql2/promise';
import { config } from './env';

export const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: config.DB_CONNECTION_LIMIT,
  decimalNumbers: true,
});
