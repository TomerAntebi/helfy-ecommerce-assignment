import { describe, it, expect, vi } from 'vitest';
import { extractApiError } from '../../utils/apiError';

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      isAxiosError: vi.fn(),
    },
  };
});

import axios from 'axios';
import type { Mock } from 'vitest';

const mockIsAxiosError = axios.isAxiosError as unknown as Mock;

describe('extractApiError', () => {
  it('returns the error string from a structured Axios error response', () => {
    mockIsAxiosError.mockReturnValue(true);
    const axiosError = {
      response: { data: { error: 'Invalid credentials' } },
    };

    const result = extractApiError(axiosError, 'Login failed');

    expect(result).toBe('Invalid credentials');
  });

  it('returns the fallback when the Axios error has no structured data', () => {
    mockIsAxiosError.mockReturnValue(true);
    const axiosError = { response: { data: {} } };

    const result = extractApiError(axiosError, 'Something went wrong');

    expect(result).toBe('Something went wrong');
  });

  it('returns the fallback for a non-Axios error', () => {
    mockIsAxiosError.mockReturnValue(false);

    const result = extractApiError(new Error('network failure'), 'Default message');

    expect(result).toBe('Default message');
  });
});
