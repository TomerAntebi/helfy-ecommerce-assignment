import { useState, useEffect } from 'react';
import type { Product, ProductFilters, ProductsResult } from '../types';
import * as productsService from '../services/products.service';

interface UseProductsReturn extends ProductsResult {
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useProducts = (filters: ProductFilters): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await productsService.getProducts(filters);
        if (!cancelled) {
          setProducts(result.products);
          setTotal(result.total);
          setPage(result.page);
          setLimit(result.limit);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load products');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchProducts();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.category,
    filters.min_price,
    filters.max_price,
    filters.page,
    filters.limit,
    tick,
  ]);

  const refetch = () => setTick((t) => t + 1);

  return { products, total, page, limit, loading, error, refetch };
};
