# Backend Guidelines

These guidelines define the backend architecture, patterns, and conventions for the Express + TypeScript backend. Read `coding-standards.md` before reading this file.

---

## 1. Layered Module Pattern

Every backend module follows the same three-layer structure with strict separation of concerns:

```
router → controller → service → database
```

| Layer | File | Responsibility |
|-------|------|---------------|
| Router | `*.router.ts` | Register Express routes, bind controllers |
| Controller | `*.controller.ts` | Parse request, validate input, call service, send response |
| Service | `*.service.ts` | Business logic, database queries using the connection pool |

**Rules:**
- No database queries in controllers
- No business logic in routers
- No `req`/`res` objects passed into services
- Services receive plain typed arguments and return typed results
- Services throw typed errors that controllers catch and convert to HTTP responses

### Folder structure

```
backend/src/
├── index.ts                    — app bootstrap, listen on PORT from env
├── config/
│   └── db.ts                   — mysql2 connection pool using env vars
├── middleware/
│   ├── auth.middleware.ts       — JWT verification, attach user to request
│   └── error.middleware.ts     — global error handler, standardized response
├── types/
│   └── index.ts                — shared TypeScript interfaces (User, Product, CartItem, Order, OrderItem)
└── modules/
    ├── auth/
    │   ├── auth.router.ts
    │   ├── auth.controller.ts
    │   └── auth.service.ts
    ├── users/
    │   ├── users.router.ts
    │   ├── users.controller.ts
    │   └── users.service.ts
    ├── products/
    │   ├── products.router.ts
    │   ├── products.controller.ts
    │   └── products.service.ts
    ├── cart/
    │   ├── cart.router.ts
    │   ├── cart.controller.ts
    │   └── cart.service.ts
    ├── orders/
    │   ├── orders.router.ts
    │   ├── orders.controller.ts
    │   └── orders.service.ts
    ├── checkout/
    │   ├── checkout.router.ts
    │   ├── checkout.controller.ts
    │   └── checkout.service.ts
    └── health/
        └── health.router.ts
```

Each module has exactly three files: router, controller, service.

---

## 2. Request Validation

Use `express-validator` for all input validation. Validation rules are defined in the router file as an array of middleware, not inside the controller.

```typescript
// Example: auth.router.ts
import { body, validationResult } from 'express-validator';

router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('first_name').notEmpty().trim(),
    body('last_name').notEmpty().trim(),
  ],
  authController.signup
);
```

The controller must check `validationResult(req)` and return 400 if validation fails before calling the service.

### Validation matrix

Every endpoint that accepts input must have validation rules defined in its router file. The complete required ruleset for each endpoint is:

| Endpoint | Field | Rule |
|----------|-------|------|
| POST /api/auth/signup | `email` | Valid email format, normalized to lowercase |
| POST /api/auth/signup | `password` | Minimum 8 characters |
| POST /api/auth/signup | `first_name` | Required, not empty, max 100 characters |
| POST /api/auth/signup | `last_name` | Required, not empty, max 100 characters |
| POST /api/auth/login | `email` | Valid email format |
| POST /api/auth/login | `password` | Required, not empty |
| POST /api/cart/items | `product_id` | Required, must be an integer |
| POST /api/cart/items | `quantity` | Required, integer, minimum value 1 |
| PUT /api/cart/items/:id | `quantity` | Required, integer, minimum value 0 (quantity of 0 triggers item deletion in the service) |
| POST /api/orders | `shipping_full_name` | Required, max 200 characters |
| POST /api/orders | `shipping_street` | Required, max 255 characters |
| POST /api/orders | `shipping_city` | Required, max 100 characters |
| POST /api/orders | `shipping_state` | Required, max 100 characters |
| POST /api/orders | `shipping_zip_code` | Required, max 20 characters |
| POST /api/orders | `shipping_country` | Required, max 100 characters |
| POST /api/orders | `payment_method` | Required, must be one of: `credit_card`, `paypal`, `bank_transfer` |
| POST /api/orders | `payment_last_four` | Required when `payment_method === 'credit_card'`, must be exactly 4 numeric digits |
| PUT /api/users/me | `first_name` | Optional; if provided, max 100 characters |
| PUT /api/users/me | `last_name` | Optional; if provided, max 100 characters |
| PUT /api/users/me | `phone` | Optional; if provided, max 30 characters |
| PUT /api/users/me | `address` | Optional; if provided, max 500 characters |

Validation for `payment_last_four` is conditional. Use `express-validator`'s `.if()` to apply the rule only when `payment_method` is `credit_card`:

```typescript
body('payment_last_four').if(body('payment_method').equals('credit_card'))
  .notEmpty()
  .matches(/^\d{4}$/)
  .withMessage('Last four digits must be exactly 4 numeric characters'),
```

---

## 3. Error Handling

All errors must be handled by the global error middleware in `middleware/error.middleware.ts`. Controllers must not swallow errors.

**Controller pattern:**
```typescript
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: errors.array()[0].msg });
    return;
  }
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

**Global error middleware:**
```typescript
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);
  const status = (err as { statusCode?: number }).statusCode ?? 500;
  res.status(status).json({ success: false, error: err.message });
};
```

**AppError class:**
```typescript
export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}
```

- Never swallow errors. If a service throws, the controller must call `next(error)`.
- Use specific HTTP status codes: 400 (bad request), 401 (unauthenticated), 403 (unauthorized), 404 (not found), 409 (conflict), 500 (server error).
- Throw `AppError` in services. The global error middleware reads `statusCode` from it.

---

## 4. Standard API Response Envelope

Every API response must use one of two shapes:

**Success:**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{ "success": false, "error": "Human-readable error message" }
```

No other response shapes are permitted.

**Documented exception — `GET /api/health`:**
This endpoint returns `{ "status": "ok", "timestamp": "<ISO string>" }` directly, without the success envelope. This is intentional: Docker health checks verify the HTTP 200 status code, not the response body. Keeping the health check response flat avoids any risk of the envelope breaking the health check. Do not wrap this response in `{ success, data }`. This is the only permitted exception.

---

## 5. Authentication Middleware

```typescript
// middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; email: string };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
```

---

## 6. Database Access

Use a single `mysql2` connection pool initialized in `config/db.ts` from environment variables. Import and use the pool in services.

```typescript
// config/db.ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
});
```

Services query the pool directly. No ORM. No query builder.

```typescript
// Example service query
const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
```

See `guidelines/database-guidelines.md` for all query patterns.

---

## 7. Security

- Passwords must be hashed with `bcrypt` at cost factor 12. Never store plain-text passwords.
- JWTs must be signed with `JWT_SECRET` from environment variables. Never hard-code secrets.
- JWT expiry must be set from `JWT_EXPIRES_IN` environment variable.
- The JWT payload must contain only `{ id: number, email: string }`. Never put sensitive data in the payload.
- All SQL queries must use parameterized queries. Never concatenate user input into SQL strings.
- CORS must be configured to allow only the frontend origin in production.
