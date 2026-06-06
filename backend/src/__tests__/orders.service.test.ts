import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('../config/db', () => ({
  pool: {
    query: vi.fn(),
    getConnection: vi.fn(),
  },
}));

import { pool } from '../config/db';
import { createOrder } from '../modules/orders/orders.service';
import { AppError } from '../types';

const mockQuery = pool.query as unknown as Mock;
const mockGetConnection = pool.getConnection as unknown as Mock;

const mockConn = {
  beginTransaction: vi.fn(),
  query: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
  release: vi.fn(),
};

const VALID_ORDER_DATA = {
  shipping_full_name: 'John Doe',
  shipping_street: '123 Main St',
  shipping_city: 'New York',
  shipping_state: 'NY',
  shipping_zip_code: '10001',
  shipping_country: 'US',
  payment_method: 'credit_card' as const,
  payment_last_four: '4242',
};

const MOCK_CART_ROW = {
  id: 1,
  user_id: 1,
  product_id: 10,
  quantity: 2,
  created_at: new Date(),
  updated_at: new Date(),
  p_id: 10,
  p_name: 'Widget',
  p_description: 'A widget',
  p_price: 29.99,
  p_image_url: null,
  p_category: 'Gadgets',
  p_stock: 10,
  p_created_at: new Date(),
};

const MOCK_ORDER_ROW = {
  id: 100,
  user_id: 1,
  status: 'pending',
  total_amount: 59.98,
  ...VALID_ORDER_DATA,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('orders.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConn.beginTransaction.mockResolvedValue(undefined);
    mockConn.commit.mockResolvedValue(undefined);
    mockConn.rollback.mockResolvedValue(undefined);
    mockConn.release.mockReturnValue(undefined);
    mockGetConnection.mockResolvedValue(mockConn);
  });

  it('throws AppError 400 when cart is empty', async () => {
    mockQuery.mockResolvedValueOnce([[]]); // empty cart

    const err = await createOrder(1, VALID_ORDER_DATA).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).message).toBe('Cart is empty');
    expect((err as AppError).statusCode).toBe(400);
  });

  it('throws AppError 400 when a cart item exceeds available stock', async () => {
    const lowStockRow = { ...MOCK_CART_ROW, p_stock: 1 }; // only 1 in stock, but qty=2
    mockQuery.mockResolvedValueOnce([[lowStockRow]]);

    const err = await createOrder(1, VALID_ORDER_DATA).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).statusCode).toBe(400);
    // No DB transaction should have started
    expect(mockGetConnection).not.toHaveBeenCalled();
  });

  it('reduces stock for each cart item inside the transaction', async () => {
    mockQuery.mockResolvedValueOnce([[MOCK_CART_ROW]]); // cart fetch
    mockConn.query
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE stock
      .mockResolvedValueOnce([{ insertId: 100, affectedRows: 1 }]) // INSERT order
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // INSERT order_item
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE cart
    mockQuery.mockResolvedValueOnce([[MOCK_ORDER_ROW]]); // final SELECT order

    await createOrder(1, VALID_ORDER_DATA);

    const stockUpdateCall = mockConn.query.mock.calls[0] as [string, unknown[]];
    expect(stockUpdateCall[0].toUpperCase()).toContain('UPDATE');
    expect(stockUpdateCall[0]).toContain('stock');
    expect(stockUpdateCall[1]).toContain(MOCK_CART_ROW.quantity);
  });

  it('inserts order items for each cart item inside the transaction', async () => {
    mockQuery.mockResolvedValueOnce([[MOCK_CART_ROW]]);
    mockConn.query
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ insertId: 100, affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    mockQuery.mockResolvedValueOnce([[MOCK_ORDER_ROW]]);

    await createOrder(1, VALID_ORDER_DATA);

    const orderItemCall = mockConn.query.mock.calls[2] as [string, unknown[]];
    expect(orderItemCall[0]).toContain('order_items');
    expect(orderItemCall[1]).toContain(MOCK_CART_ROW.product_id);
    expect(orderItemCall[1]).toContain(MOCK_CART_ROW.quantity);
  });

  it('clears the cart after a successful order', async () => {
    mockQuery.mockResolvedValueOnce([[MOCK_CART_ROW]]);
    mockConn.query
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ insertId: 100, affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    mockQuery.mockResolvedValueOnce([[MOCK_ORDER_ROW]]);

    await createOrder(1, VALID_ORDER_DATA);

    const clearCartCall = mockConn.query.mock.calls[3] as [string, unknown[]];
    expect(clearCartCall[0].toUpperCase()).toContain('DELETE');
    expect(clearCartCall[0]).toContain('cart_items');
  });

  it('rolls back the transaction when stock reduction fails', async () => {
    mockQuery.mockResolvedValueOnce([[MOCK_CART_ROW]]);
    mockConn.query.mockRejectedValueOnce(new Error('stock update failed'));

    await expect(createOrder(1, VALID_ORDER_DATA)).rejects.toThrow('stock update failed');

    expect(mockConn.rollback).toHaveBeenCalledOnce();
    expect(mockConn.release).toHaveBeenCalledOnce();
    expect(mockConn.commit).not.toHaveBeenCalled();
  });
});
