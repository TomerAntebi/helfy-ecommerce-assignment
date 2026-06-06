import type { AxiosError } from 'axios';

export const extractApiError = (error: unknown, fallback: string): string => {
  const axiosErr = error as AxiosError<{ error: string }>;
  return axiosErr.response?.data?.error ?? fallback;
};
