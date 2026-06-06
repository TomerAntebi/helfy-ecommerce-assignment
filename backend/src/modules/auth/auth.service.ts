import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';
import { AppError } from '../../types';

const BCRYPT_ROUNDS = 12;

interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const { email, password, first_name, last_name } = data;

  // Check if email already exists
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    throw new AppError('Email already in use', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Insert user
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
    [email, passwordHash, first_name, last_name]
  );

  const userId = result.insertId;

  // Generate JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new AppError('JWT_SECRET is not configured', 500);
  const token = jwt.sign(
    { id: userId, email },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: userId,
      email,
      first_name,
      last_name,
    },
  };
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const { email, password } = data;

  // Find user by email
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    throw new AppError('Invalid credentials', 401);
  }

  const user = rows[0];

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new AppError('JWT_SECRET is not configured', 500);
  const token = jwt.sign(
    { id: user.id, email: user.email },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  };
};
