import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { CartItemWithProduct, Order } from '../../types';

vi.mock('../../hooks/useCart', () => ({
  useCart: vi.fn(),
}));

vi.mock('../../services/orders.service', () => ({
  createOrder: vi.fn(),
}));

vi.mock('../../services/checkout.service', () => ({
  validateCart: vi.fn(),
}));

import { useCart } from '../../hooks/useCart';
import * as ordersService from '../../services/orders.service';
import * as checkoutService from '../../services/checkout.service';
import { CheckoutPage } from '../../pages/CheckoutPage';

const mockUseCart = useCart as unknown as Mock;
const mockCreateOrder = ordersService.createOrder as unknown as Mock;
const mockValidateCart = checkoutService.validateCart as unknown as Mock;

const MOCK_ITEM: CartItemWithProduct = {
  id: 1,
  user_id: 1,
  product_id: 10,
  quantity: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  product: {
    id: 10,
    name: 'Widget',
    description: null,
    price: 29.99,
    image_url: null,
    category: 'Gadgets',
    stock: 5,
    created_at: '2024-01-01T00:00:00Z',
  },
};

const baseCart = {
  loading: false,
  fetchCart: vi.fn().mockResolvedValue(undefined),
  addItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  itemCount: 1,
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <CheckoutPage />
    </MemoryRouter>
  );

const fillShipping = () => {
  fireEvent.change(screen.getByPlaceholderText('Jane Doe'), {
    target: { value: 'John Doe' },
  });
  fireEvent.change(screen.getByPlaceholderText('123 Main St'), {
    target: { value: '123 Main St' },
  });
  fireEvent.change(screen.getByPlaceholderText('New York'), {
    target: { value: 'New York' },
  });
  fireEvent.change(screen.getByPlaceholderText('NY'), { target: { value: 'NY' } });
  fireEvent.change(screen.getByPlaceholderText('10001'), {
    target: { value: '10001' },
  });
  fireEvent.change(screen.getByPlaceholderText('United States'), {
    target: { value: 'United States' },
  });
  fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
};

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    baseCart.fetchCart.mockResolvedValue(undefined);
  });

  it('shows the empty-cart state when the cart has no items', () => {
    mockUseCart.mockReturnValue({ ...baseCart, items: [], total: 0, itemCount: 0 });
    renderPage();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.queryByText('Shipping Address')).not.toBeInTheDocument();
  });

  it('shows the shipping form when the cart has items', () => {
    mockUseCart.mockReturnValue({ ...baseCart, items: [MOCK_ITEM], total: 29.99 });
    renderPage();
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
  });

  it('shows shipping validation errors when the form is submitted blank', () => {
    mockUseCart.mockReturnValue({ ...baseCart, items: [MOCK_ITEM], total: 29.99 });
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Street is required')).toBeInTheDocument();
  });

  it('shows a payment validation error when credit card last-four is missing', () => {
    mockUseCart.mockReturnValue({ ...baseCart, items: [MOCK_ITEM], total: 29.99 });
    renderPage();
    fillShipping();
    // Credit card is selected by default — submit without last four digits
    fireEvent.click(screen.getByRole('button', { name: /review order/i }));
    expect(screen.getByText('Last 4 digits are required')).toBeInTheDocument();
  });

  it('shows the confirmation step after a successful order', async () => {
    mockUseCart.mockReturnValue({ ...baseCart, items: [MOCK_ITEM], total: 29.99 });
    mockValidateCart.mockResolvedValue({ valid: true, errors: [] });
    mockCreateOrder.mockResolvedValue({ id: 42 } as Order);

    renderPage();

    // Step 1: Shipping
    fillShipping();

    // Step 2: Payment — fill in last four digits
    fireEvent.change(screen.getByPlaceholderText('1234'), {
      target: { value: '4242' },
    });
    fireEvent.click(screen.getByRole('button', { name: /review order/i }));

    // Step 3: Review — place order
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(screen.getByText('Order placed successfully!')).toBeInTheDocument();
    });
  });
});
