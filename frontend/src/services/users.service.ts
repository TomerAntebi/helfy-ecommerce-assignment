import api from './api';
import type { ApiResponse, User } from '../types';

interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

export const getMe = async (): Promise<User> => {
  const res = await api.get<ApiResponse<{ user: User }>>('/api/users/me');
  return res.data.data.user;
};

export const updateMe = async (payload: UpdateUserPayload): Promise<User> => {
  const res = await api.put<ApiResponse<{ user: User }>>('/api/users/me', payload);
  return res.data.data.user;
};
