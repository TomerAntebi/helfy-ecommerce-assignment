import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard';
import type { Product } from '../../types';

const MOCK_PRODUCT: Product = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Great sound quality',
  price: 79.99,
  image_url: null,
  category: 'Electronics',
  stock: 10,
  created_at: '2024-01-01T00:00:00Z',
};

describe('ProductCard', () => {
  const renderCard = (product = MOCK_PRODUCT) =>
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    );

  it('renders the product name', () => {
    renderCard();
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
  });

  it('renders the price formatted as $X.XX', () => {
    renderCard();
    expect(screen.getByText('$79.99')).toBeInTheDocument();
  });

  it('renders the category label', () => {
    renderCard();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('shows "Out of stock" when stock is 0', () => {
    renderCard({ ...MOCK_PRODUCT, stock: 0 });
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });
});
