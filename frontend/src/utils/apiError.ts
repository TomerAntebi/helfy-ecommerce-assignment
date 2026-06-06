import axios from 'axios';

export const extractApiError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (typeof data === 'object' && data !== null && 'error' in data) {
      const msg = (data as { error: unknown }).error;
      if (typeof msg === 'string') return msg;
    }
  }
  return fallback;
};
