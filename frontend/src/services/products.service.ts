import api from './api';
import type { ApiResponse, Product, ProductFilters, ProductsResult } from '../types';

export const getProducts = async (filters: ProductFilters = {}): Promise<ProductsResult> => {
  const params: Record<string, string | number> = {};
  if (filters.search) params.search = filters.search;
  if (filters.category) params.category = filters.category;
  if (filters.min_price !== undefined) params.min_price = filters.min_price;
  if (filters.max_price !== undefined) params.max_price = filters.max_price;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;

  const res = await api.get<ApiResponse<ProductsResult>>('/api/products', { params });
  return res.data.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const res = await api.get<ApiResponse<{ product: Product }>>(`/api/products/${id}`);
  return res.data.data.product;
};

export const getCategories = async (): Promise<string[]> => {
  const res = await api.get<ApiResponse<{ categories: string[] }>>('/api/products/categories');
  return res.data.data.categories;
};
