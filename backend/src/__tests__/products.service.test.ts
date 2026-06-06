import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('../config/db', () => ({
  pool: { query: vi.fn() },
}));

import { pool } from '../config/db';
import { getProducts, getProductById } from '../modules/products/products.service';
import { AppError } from '../types';

const mockQuery = pool.query as unknown as Mock;

const MOCK_PRODUCT = {
  id: 1,
  name: 'Test Widget',
  description: 'A test widget',
  price: 29.99,
  image_url: null,
  category: 'Gadgets',
  stock: 10,
  created_at: new Date(),
};

describe('products.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('omits WHERE clause when no filters are provided', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);

      await getProducts({});

      const countSql = mockQuery.mock.calls[0][0] as string;
      expect(countSql).not.toContain('WHERE');
    });

    it('adds LIKE clause for the search filter', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[MOCK_PRODUCT]]);

      await getProducts({ search: 'laptop' });

      const countSql = mockQuery.mock.calls[0][0] as string;
      const countValues = mockQuery.mock.calls[0][1] as unknown[];
      expect(countSql).toContain('LIKE');
      expect(countValues).toContain('%laptop%');
    });

    it('adds exact match clause for the category filter', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[MOCK_PRODUCT]]);

      await getProducts({ category: 'Gadgets' });

      const countSql = mockQuery.mock.calls[0][0] as string;
      const countValues = mockQuery.mock.calls[0][1] as unknown[];
      expect(countSql).toContain('category = ?');
      expect(countValues).toContain('Gadgets');
    });

    it('adds price range clauses for min_price and max_price', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[MOCK_PRODUCT]]);

      await getProducts({ min_price: 10, max_price: 50 });

      const countSql = mockQuery.mock.calls[0][0] as string;
      const countValues = mockQuery.mock.calls[0][1] as unknown[];
      expect(countSql).toContain('price >= ?');
      expect(countSql).toContain('price <= ?');
      expect(countValues).toContain(10);
      expect(countValues).toContain(50);
    });
  });

  describe('getProductById', () => {
    it('throws AppError 404 when product does not exist', async () => {
      mockQuery.mockResolvedValueOnce([[]]); // no rows

      const err = await getProductById(999).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(404);
    });
  });
});
