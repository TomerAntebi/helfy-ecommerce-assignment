import { useState, useEffect, useCallback } from 'react';
import type { Order } from '../types';
import * as ordersService from '../services/orders.service';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOrders = (): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await ordersService.getOrders();
        if (!cancelled) setOrders(result);
      } catch {
        if (!cancelled) setError('Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { orders, loading, error, refetch };
};
