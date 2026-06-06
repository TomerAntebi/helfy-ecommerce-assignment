import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';
import { config } from '../../config/env';
import { AppError } from '../../types';

const BCRYPT_ROUNDS = 12;

const issueToken = (userId: number, email: string): string =>
  jwt.sign(
    { id: userId, email },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
  );

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

  return {
    token: issueToken(userId, email),
    user: { id: userId, email, first_name, last_name },
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

  return {
    token: issueToken(user.id, user.email),
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  };
};
