import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('../config/db', () => ({
  pool: { query: vi.fn() },
}));

import { pool } from '../config/db';
import { addItem, updateItem, removeItem } from '../modules/cart/cart.service';
import { AppError } from '../types';

const mockQuery = pool.query as unknown as Mock;

const MOCK_PRODUCT_ROW = { id: 10, stock: 5 };

describe('cart.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addItem', () => {
    it('throws AppError 404 when product does not exist', async () => {
      mockQuery.mockResolvedValueOnce([[]]); // product not found

      const err = await addItem(1, 999, 1).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(404);
    });

    it('throws AppError 400 when requested quantity exceeds available stock', async () => {
      mockQuery
        .mockResolvedValueOnce([[MOCK_PRODUCT_ROW]]) // product: stock=5
        .mockResolvedValueOnce([[]]); // no existing cart entry

      const err = await addItem(1, 10, 10).catch((e: unknown) => e); // 10 > 5
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    });

    it('throws AppError 400 when cumulative quantity would exceed stock', async () => {
      mockQuery
        .mockResolvedValueOnce([[MOCK_PRODUCT_ROW]]) // product: stock=5
        .mockResolvedValueOnce([[{ quantity: 4 }]]); // already 4 in cart

      const err = await addItem(1, 10, 2).catch((e: unknown) => e); // 4+2=6 > 5
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    });
  });

  describe('updateItem', () => {
    it('throws AppError 400 when new quantity exceeds product stock', async () => {
      mockQuery.mockResolvedValueOnce([[{ stock: 3 }]]); // product has stock=3

      const err = await updateItem(1, 1, 10).catch((e: unknown) => e); // 10 > 3
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    });

    it('returns null and issues a DELETE when quantity is set to 0', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await updateItem(1, 1, 0);
      expect(result).toBeNull();

      const deleteSql = mockQuery.mock.calls[0][0] as string;
      expect(deleteSql.toUpperCase()).toContain('DELETE');
    });
  });

  describe('removeItem', () => {
    it('throws AppError 404 when item does not belong to the authenticated user', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]); // no row matched

      const err = await removeItem(1, 99).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(404);
    });

    it('DELETE query scopes to user_id to enforce ownership', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await removeItem(42, 7);

      const sql = mockQuery.mock.calls[0][0] as string;
      const args = mockQuery.mock.calls[0][1] as unknown[];
      expect(sql.toUpperCase()).toContain('DELETE');
      expect(sql).toContain('user_id');
      expect(args).toContain(42);
    });
  });
});
