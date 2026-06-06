export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';

export const getToken = (): string | null =>
  localStorage.getItem(AUTH_TOKEN_KEY);

export const storeToken = (token: string): void =>
  localStorage.setItem(AUTH_TOKEN_KEY, token);

export const removeToken = (): void =>
  localStorage.removeItem(AUTH_TOKEN_KEY);

export const getRawUser = (): string | null =>
  localStorage.getItem(AUTH_USER_KEY);

export const storeUser = (user: object): void =>
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

export const removeUser = (): void =>
  localStorage.removeItem(AUTH_USER_KEY);
