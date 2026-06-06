import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/auth.service', () => ({
  signup: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';
import type { Mock } from 'vitest';
import { SignupPage } from '../../pages/SignupPage';

const mockUseAuth = useAuth as unknown as Mock;

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/signup']}>
      <SignupPage />
    </MemoryRouter>
  );

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, login: vi.fn() });
  });

  it('renders all required fields', () => {
    renderPage();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('shows a password length error when password is shorter than 8 characters', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(
      screen.getByText('Password must be at least 8 characters')
    ).toBeInTheDocument();
  });

  it('uses the redirect query param as the post-auth destination', () => {
    render(
      <MemoryRouter initialEntries={['/signup?redirect=%2Forders']}>
        <SignupPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });
});
