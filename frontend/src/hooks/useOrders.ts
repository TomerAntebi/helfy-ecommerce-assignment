import { useState, useEffect } from 'react';
import type { Order } from '../types';
import * as ordersService from '../services/orders.service';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await ordersService.getOrders();
        setOrders(result);
      } catch {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    void fetchOrders();
  }, []);

  return { orders, loading, error };
};
