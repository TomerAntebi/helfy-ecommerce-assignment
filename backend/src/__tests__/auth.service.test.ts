import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('../config/db', () => ({
  pool: { query: vi.fn() },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signup, login } from '../modules/auth/auth.service';
import { AppError } from '../types';

const mockQuery = pool.query as unknown as Mock;
const mockHash = bcrypt.hash as unknown as Mock;
const mockCompare = bcrypt.compare as unknown as Mock;

const VALID_SIGNUP = {
  email: 'test@example.com',
  password: 'password123',
  first_name: 'Test',
  last_name: 'User',
};

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHash.mockResolvedValue('$2b$12$hashedpassword');
    mockCompare.mockResolvedValue(true);
  });

  describe('signup', () => {
    it('throws AppError 409 when email already exists', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);

      const err = await signup(VALID_SIGNUP).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(409);
    });

    it('stores a bcrypt hash, not the plain-text password', async () => {
      mockQuery
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 42, affectedRows: 1 }]);

      await signup(VALID_SIGNUP);

      expect(mockHash).toHaveBeenCalledWith('password123', 12);
      const insertArgs = mockQuery.mock.calls[1][1] as unknown[];
      expect(insertArgs[1]).toBe('$2b$12$hashedpassword');
      expect(insertArgs[1]).not.toBe('password123');
    });

    it('JWT payload does not contain password or password_hash', async () => {
      mockQuery
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 7, affectedRows: 1 }]);

      const result = await signup({ ...VALID_SIGNUP, email: 'jwt@example.com' });

      const decoded = jwt.decode(result.token) as Record<string, unknown>;
      expect(decoded).not.toHaveProperty('password');
      expect(decoded).not.toHaveProperty('password_hash');
      expect(decoded.id).toBe(7);
      expect(decoded.email).toBe('jwt@example.com');
    });
  });

  describe('login', () => {
    it('throws AppError 401 when user is not found', async () => {
      mockQuery.mockResolvedValueOnce([[]]); // no rows

      const err = await login({ email: 'ghost@example.com', password: 'pass' }).catch(
        (e: unknown) => e
      );
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    });

    it('throws AppError 401 when password does not match', async () => {
      mockQuery.mockResolvedValueOnce([
        [
          {
            id: 1,
            email: 'user@example.com',
            password_hash: '$2b$12$wronghash',
            first_name: 'Jane',
            last_name: 'Doe',
          },
        ],
      ]);
      mockCompare.mockResolvedValueOnce(false);

      const err = await login({ email: 'user@example.com', password: 'wrongpass' }).catch(
        (e: unknown) => e
      );
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    });

    it('JWT payload does not contain password or password_hash', async () => {
      mockQuery.mockResolvedValueOnce([
        [
          {
            id: 5,
            email: 'user@example.com',
            password_hash: '$2b$12$correcthash',
            first_name: 'Jane',
            last_name: 'Doe',
          },
        ],
      ]);
      mockCompare.mockResolvedValueOnce(true);

      const result = await login({ email: 'user@example.com', password: 'correctpass' });

      const decoded = jwt.decode(result.token) as Record<string, unknown>;
      expect(decoded).not.toHaveProperty('password');
      expect(decoded).not.toHaveProperty('password_hash');
      expect(decoded.id).toBe(5);
      expect(decoded.email).toBe('user@example.com');
    });
  });
});
