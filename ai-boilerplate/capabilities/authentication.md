# Authentication Capability

This document defines the authentication strategy, token lifecycle, backend implementation patterns, and frontend AuthContext. Read `guidelines/backend-guidelines.md` and `guidelines/frontend-guidelines.md` before this file.

---

## 1. Strategy

JWT (JSON Web Token) stateless authentication. No sessions. No cookies.

### Token lifecycle

| Event | Action |
|-------|--------|
| Signup | Issue JWT signed with `JWT_SECRET`, expires in `JWT_EXPIRES_IN` |
| Login | Verify password with bcrypt, issue JWT |
| Authenticated request | Read `Authorization: Bearer {token}` header, verify JWT |
| 401 received (frontend) | Clear localStorage, redirect to `/login` |
| Logout (frontend) | Remove `token` and `user` from localStorage, redirect to `/` |

### JWT payload shape

```typescript
interface JWTPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}
```

Never include passwords, roles, or sensitive data in the JWT payload.

---

## 2. Email Uniqueness Check (Backend)

Always perform a SELECT before INSERT. Do not rely on catching MySQL error code 1062 — that requires parsing the error object and produces unclear failure messages.

```typescript
// auth.service.ts — signup
const [existing] = await pool.query<RowDataPacket[]>(
  'SELECT id FROM users WHERE email = ?',
  [email] // email is already normalized to lowercase by express-validator
);
if (existing.length > 0) {
  throw new AppError('Email already in use', 409);
}
// proceed with bcrypt hash and INSERT
```

The controller receives the `AppError` with `statusCode: 409` and passes it to `next(error)`. The global error middleware returns it as:
```json
{ "success": false, "error": "Email already in use" }
```

---

## 3. Password Hashing (Backend)

```typescript
import bcrypt from 'bcrypt';

// Hashing (on signup)
const BCRYPT_ROUNDS = 12;
const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

// Verification (on login)
const isValid = await bcrypt.compare(password, user.password_hash);
```

---

## 4. AuthContext (Frontend)

```typescript
interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}
```

- Initialized from `localStorage` on app mount.
- Wraps the entire React tree in `App.tsx`.
- The `login(token, user)` function stores both values in localStorage and updates React state.
- The `logout()` function clears localStorage and redirects to `/`.
- On login success, redirect to the `?redirect` query param if present, otherwise to `/`.

---

## 5. Axios Instance and 401 Interceptor

Create a single Axios instance in `src/services/api.ts`. The 401 response interceptor must **not** redirect when the failing request is to an auth endpoint. If `POST /api/auth/login` returns 401 (wrong credentials), the interceptor must allow the rejection to bubble up so the login page can display the error message. Without this exception, the user would be silently redirected to `/login` with no feedback.

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/api/auth');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```
