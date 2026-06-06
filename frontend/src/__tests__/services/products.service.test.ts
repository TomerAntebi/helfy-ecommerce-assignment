import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn() },
}));

import api from '../../services/api';
import * as productsService from '../../services/products.service';

const mockGet = api.get as unknown as Mock;

describe('products.service — API envelope handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps the ApiResponse envelope and returns only the data payload', async () => {
    const inner = { products: [], total: 0, page: 1, limit: 12 };
    mockGet.mockResolvedValueOnce({ data: { success: true, data: inner } });

    const result = await productsService.getProducts();

    expect(result).toEqual(inner);
    expect(result).not.toHaveProperty('success');
  });

  it('unwraps getProductById and returns only the product object', async () => {
    const mockProduct = {
      id: 1,
      name: 'Widget',
      price: 9.99,
      category: 'Gadgets',
      stock: 5,
      description: null,
      image_url: null,
      created_at: '',
    };
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { product: mockProduct } },
    });

    const result = await productsService.getProductById(1);

    expect(result).toEqual(mockProduct);
    expect(result).not.toHaveProperty('success');
  });

  it('forwards query filters as request params', async () => {
    const inner = { products: [], total: 0, page: 1, limit: 12 };
    mockGet.mockResolvedValueOnce({ data: { success: true, data: inner } });

    await productsService.getProducts({ search: 'laptop', category: 'Electronics' });

    expect(mockGet).toHaveBeenCalledWith('/api/products', {
      params: { search: 'laptop', category: 'Electronics' },
    });
  });
});
