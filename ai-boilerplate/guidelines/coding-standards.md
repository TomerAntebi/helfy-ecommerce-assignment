# Coding Standards

These standards apply to every file in both the `frontend/` and `backend/` directories. Read this file before writing any code.

---

## 1. Language Standard — TypeScript

TypeScript is mandatory on both the frontend and the backend. It is not optional and cannot be bypassed.

### Rules

- `strict: true` must be set in every `tsconfig.json`
- `noImplicitAny: true` must be enforced — never use `any`
- If a type is unknown at design time, use `unknown` with a type guard to narrow it
- Never use `@ts-ignore` or `@ts-expect-error` unless accompanied by a comment explaining exactly why
- All function parameters must be explicitly typed
- All function return values must be explicitly typed
- All API response shapes must be defined as TypeScript interfaces
- All database row shapes must be defined as TypeScript interfaces in `backend/src/types/index.ts`
- Frontend types in `frontend/src/types/index.ts` must mirror backend types exactly

### Why TypeScript is the engineering standard

AI-generated code is most reliable when the compiler enforces contracts. TypeScript serves as a second reviewer: hallucinated property names and wrong return shapes fail at compile time rather than silently at runtime. Both sides sharing type definitions prevents the most common class of integration bugs.

### TypeScript interface definitions

These interfaces are the source of truth. They must exactly match the database schema. Do not add, remove, or rename fields without updating both the schema and every interface.

```typescript
// backend/src/types/index.ts

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  created_at: Date;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_full_name: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer';
  payment_last_four: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}
```

---

## 2. Naming Conventions

### Files

| Context | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase with `use` prefix | `useCart.ts` |
| Services | camelCase with `.service` suffix | `cart.service.ts` |
| Backend routers | camelCase with `.router` suffix | `cart.router.ts` |
| Backend controllers | camelCase with `.controller` suffix | `cart.controller.ts` |
| Backend services | camelCase with `.service` suffix | `cart.service.ts` |

### Variables and functions

- Variables and functions: camelCase
- Classes and interfaces: PascalCase
- Constants: SCREAMING_SNAKE_CASE (for top-level module constants only)
- Database column names: snake_case
- TypeScript interface properties: snake_case (to match database columns without mapping)
- React component props: camelCase

### Handler naming

Event handlers in React must describe the action they perform:

```typescript
// Correct
const handleAddToCart = () => { ... };
const handleQuantityChange = (value: number) => { ... };
const handleFormSubmit = async (e: FormEvent) => { ... };

// Wrong
const onClick = () => { ... };
const handler = () => { ... };
const doThing = () => { ... };
```

---

## 3. Code Quality Rules

- No dead code. Do not generate commented-out blocks of alternative implementations.
- No console.log in production paths. Use `console.error` only in error handlers.
- No magic numbers. Use named constants for values that have semantic meaning.
- One responsibility per file. If a file is growing beyond its defined responsibility, split it.
- Keep functions focused. A function that does three things should be three functions.
- No nested ternary operators.
- No functions longer than 50 lines. If a function exceeds 50 lines, extract sub-functions.

---

## 4. Forbidden Patterns

The following patterns are forbidden. If you find yourself writing them, stop and use the correct pattern instead.

| Forbidden | Correct alternative |
|-----------|-------------------|
| `any` type in TypeScript | Define an interface or use `unknown` with a type guard |
| API calls inside React components | Use a service file and a custom hook |
| Business logic in Express controllers | Move to the service layer |
| Raw SQL string concatenation | Use parameterized queries |
| Hard-coded secrets | Read from environment variables |
| `console.log` in services | Remove or use `console.error` only in error handlers |
| Guest/localStorage cart | Database-backed cart for authenticated users only |
| Frontend-calculated order totals | Always use the total returned by the API |
| `@ts-ignore` | Fix the actual type error |
| Multiple responsibilities per file | Split into separate files |
| 401 Axios interceptor redirecting on `/api/auth/*` endpoints | Check `error.config?.url?.startsWith('/api/auth')` and skip redirect if true |
| Catching MySQL error 1062 for email uniqueness | Always `SELECT` the email first; throw `AppError('Email already in use', 409)` if found |
| Using `curl` in Docker alpine health checks | Use `wget --spider` — `curl` is not present in alpine-based images by default |
| Skipping `ARG`/`ENV` for Vite build args in Dockerfile | Declare `ARG VITE_API_URL=""` and `ENV VITE_API_URL=$VITE_API_URL` before `RUN npm run build` |
| Inserting an order without validating stock inside the transaction | Use `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?` and check `affectedRows` |

---

## 5. Approved Libraries

The following libraries are approved and must be used as specified. Do not substitute alternatives. Do not introduce libraries not on this list without explicit human approval.

### Backend

| Library | Version | Purpose |
|---------|---------|---------|
| `express` | latest | HTTP framework |
| `typescript` | latest | Language |
| `mysql2` | latest | MySQL client with promise support |
| `bcrypt` | latest | Password hashing |
| `jsonwebtoken` | latest | JWT signing and verification |
| `express-validator` | latest | Request validation middleware |
| `cors` | latest | CORS headers |
| `dotenv` | latest | Environment variable loading |
| `ts-node` | latest | TypeScript execution for development |
| `@types/express` | latest | Express TypeScript types |
| `@types/bcrypt` | latest | bcrypt TypeScript types |
| `@types/jsonwebtoken` | latest | JWT TypeScript types |
| `@types/cors` | latest | CORS TypeScript types |
| `@types/node` | latest | Node.js TypeScript types |

### Frontend

| Library | Version | Purpose |
|---------|---------|---------|
| `react` | 18 | UI framework |
| `react-dom` | 18 | React DOM renderer |
| `react-router-dom` | v6 | Client-side routing |
| `axios` | latest | HTTP client |
| `typescript` | latest | Language |
| `vite` | latest | Build tool |
| `tailwindcss` | latest | Utility-first CSS |
| `@vitejs/plugin-react` | latest | Vite React plugin |
| `@types/react` | latest | React TypeScript types |
| `@types/react-dom` | latest | ReactDOM TypeScript types |
| `autoprefixer` | latest | Tailwind dependency |
| `postcss` | latest | Tailwind dependency |
