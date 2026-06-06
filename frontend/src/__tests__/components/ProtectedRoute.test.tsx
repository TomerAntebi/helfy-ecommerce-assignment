import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';
import type { Mock } from 'vitest';

const mockUseAuth = useAuth as unknown as Mock;

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated user to the login page', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <div>Cart content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Cart content')).not.toBeInTheDocument();
  });

  it('renders children when the user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'a@b.com', first_name: 'A', last_name: 'B' },
    });

    render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <div>Cart content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Cart content')).toBeInTheDocument();
  });
});
