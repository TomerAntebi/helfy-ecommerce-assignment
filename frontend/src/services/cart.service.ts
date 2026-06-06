import api from './api';
import type { ApiResponse, CartItemWithProduct, CartResult } from '../types';

export const getCart = async (): Promise<CartResult> => {
  const res = await api.get<ApiResponse<CartResult>>('/api/cart');
  return res.data.data;
};

export const addItem = async (
  product_id: number,
  quantity: number
): Promise<CartItemWithProduct> => {
  const res = await api.post<ApiResponse<{ item: CartItemWithProduct }>>('/api/cart/items', {
    product_id,
    quantity,
  });
  return res.data.data.item;
};

export const updateItem = async (
  itemId: number,
  quantity: number
): Promise<CartItemWithProduct | null> => {
  const res = await api.put<ApiResponse<{ item?: CartItemWithProduct; success?: boolean }>>(
    `/api/cart/items/${itemId}`,
    { quantity }
  );
  return res.data.data.item ?? null;
};

export const removeItem = async (itemId: number): Promise<void> => {
  await api.delete(`/api/cart/items/${itemId}`);
};

export const clearCart = async (): Promise<void> => {
  await api.delete('/api/cart');
};
