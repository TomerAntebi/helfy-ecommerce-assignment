import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSafeRedirect } from '../../hooks/useSafeRedirect';

const wrapper =
  (initialEntries: string[]) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

describe('useSafeRedirect', () => {
  it('returns "/" when no redirect param is present', () => {
    const { result } = renderHook(() => useSafeRedirect(), {
      wrapper: wrapper(['/']),
    });
    expect(result.current).toBe('/');
  });

  it('returns the path for a valid internal redirect param', () => {
    const { result } = renderHook(() => useSafeRedirect(), {
      wrapper: wrapper(['/login?redirect=%2Forders']),
    });
    expect(result.current).toBe('/orders');
  });

  it('returns "/" and rejects a protocol-relative external URL', () => {
    const { result } = renderHook(() => useSafeRedirect(), {
      wrapper: wrapper(['/login?redirect=%2F%2Fevil.com']),
    });
    expect(result.current).toBe('/');
  });
});
