import axios from 'axios';
import { getToken } from '../utils/authStorage';

const AUTH_EXCLUDED_PATHS = ['/api/auth/login', '/api/auth/signup'];

const isAuthExemptRequest = (url?: string): boolean =>
  AUTH_EXCLUDED_PATHS.some((path) => url?.startsWith(path));

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !isAuthExemptRequest(error.config?.url)
    ) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
