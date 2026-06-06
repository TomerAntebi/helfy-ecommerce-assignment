import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import {
  getToken,
  getRawUser,
  storeToken,
  storeUser,
  removeToken,
  removeUser,
} from '../utils/authStorage';

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const loadUserFromStorage = (): AuthUser | null => {
  try {
    const raw = getRawUser();
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(loadUserFromStorage);
  const [token, setToken] = useState<string | null>(getToken);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    storeToken(newToken);
    storeUser(newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setToken(null);
    setUser(null);
  }, []);

  // Handle session expiry: api.ts dispatches this event on 401 (non-auth endpoints).
  // ProtectedRoute redirects to /login automatically once user becomes null.
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
