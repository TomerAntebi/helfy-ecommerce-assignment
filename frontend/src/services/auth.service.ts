import api from './api';
import type { ApiResponse, AuthResponse } from '../types';

interface SignupPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/signup', payload);
  return res.data.data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', payload);
  return res.data.data;
};
