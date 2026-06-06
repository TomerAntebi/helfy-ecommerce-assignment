import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { CartItemWithProduct } from '../../types';

vi.mock('../../hooks/useCart', () => ({
  useCart: vi.fn(),
}));

import { useCart } from '../../hooks/useCart';
import { CartPage } from '../../pages/CartPage';

const mockUseCart = useCart as unknown as Mock;

const MOCK_ITEM: CartItemWithProduct = {
  id: 1,
  user_id: 1,
  product_id: 10,
  quantity: 2,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  product: {
    id: 10,
    name: 'Wireless Headphones',
    description: 'Great sound',
    price: 79.99,
    image_url: null,
    category: 'Electronics',
    stock: 10,
    created_at: '2024-01-01T00:00:00Z',
  },
};

const baseCart = {
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  addItem: vi.fn(),
  fetchCart: vi.fn(),
  itemCount: 0,
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>
  );

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the empty-cart state when there are no items', () => {
    mockUseCart.mockReturnValue({ ...baseCart, items: [], total: 0, loading: false });
    renderPage();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('renders cart item names when the cart has items', () => {
    mockUseCart.mockReturnValue({
      ...baseCart,
      items: [MOCK_ITEM],
      total: 159.98,
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
  });

  it('shows the Proceed to Checkout link when the cart has items', () => {
    mockUseCart.mockReturnValue({
      ...baseCart,
      items: [MOCK_ITEM],
      total: 159.98,
      loading: false,
    });
    renderPage();
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
  });

  it('disables the item controls while that item is loading', () => {
    const slowRemove = vi.fn(() => new Promise<void>(() => undefined));
    mockUseCart.mockReturnValue({
      ...baseCart,
      items: [MOCK_ITEM],
      total: 159.98,
      loading: false,
      removeItem: slowRemove,
    });
    renderPage();

    fireEvent.click(screen.getByLabelText('Remove item'));

    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
  });
});
