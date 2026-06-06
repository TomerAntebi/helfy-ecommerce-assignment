import api from './api';
import type { ApiResponse, Order, OrderItemWithProduct, CreateOrderPayload } from '../types';

interface OrdersResult {
  orders: Order[];
}

interface OrderDetailResult {
  order: Order;
  items: OrderItemWithProduct[];
}

export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get<ApiResponse<OrdersResult>>('/api/orders');
  return res.data.data.orders;
};

export const getOrderById = async (id: number): Promise<OrderDetailResult> => {
  const res = await api.get<ApiResponse<OrderDetailResult>>(`/api/orders/${id}`);
  return res.data.data;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const res = await api.post<ApiResponse<{ order: Order }>>('/api/orders', payload);
  return res.data.data.order;
};
