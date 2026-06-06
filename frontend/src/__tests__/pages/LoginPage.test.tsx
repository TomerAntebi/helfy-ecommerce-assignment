import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/auth.service', () => ({
  login: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';
import type { Mock } from 'vitest';
import { LoginPage } from '../../pages/LoginPage';

const mockUseAuth = useAuth as unknown as Mock;

const renderPage = (search = '') =>
  render(
    <MemoryRouter initialEntries={[`/login${search}`]}>
      <LoginPage />
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, login: vi.fn() });
  });

  it('renders email and password input fields', () => {
    renderPage();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('shows required-field validation errors when the form is submitted empty', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows an invalid email format error for a malformed email', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });
});
