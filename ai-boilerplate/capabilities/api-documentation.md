# API Documentation

This document defines all API endpoint contracts. Read `guidelines/backend-guidelines.md` before this file for validation rules and response envelope requirements.

---

## Auth — `/api/auth`

### POST /api/auth/signup

- **Auth required:** No
- **Body:** `{ email: string, password: string, first_name: string, last_name: string }`
- **Validation:** See validation matrix in `guidelines/backend-guidelines.md`
- **Service-level email uniqueness check:**
  1. `SELECT id FROM users WHERE email = ?` (email is normalized to lowercase by `express-validator`)
  2. If a row is found, throw `AppError('Email already in use', 409)`
  3. Do not rely on catching MySQL error code 1062 — always SELECT first
- Hashes password with bcrypt (cost factor 12)
- Inserts user into `users` table
- **Response:** `{ success: true, data: { token: string, user: { id, email, first_name, last_name } } }`
- **Errors:** 400 if validation fails, 409 if email already exists

### POST /api/auth/login

- **Auth required:** No
- **Body:** `{ email: string, password: string }`
- Validates credentials against bcrypt hash
- **Response:** `{ success: true, data: { token: string, user: { id, email, first_name, last_name } } }`
- **Errors:** 400 if fields missing, 401 if credentials invalid

---

## Users — `/api/users`

### GET /api/users/me

- **Auth required:** Yes
- Returns the authenticated user profile
- **Response:** `{ success: true, data: { user: User } }`

### PUT /api/users/me

- **Auth required:** Yes
- **Body:** `{ first_name?: string, last_name?: string, phone?: string, address?: string }`
- Updates only the provided fields
- **Response:** `{ success: true, data: { user: User } }`

---

## Products — `/api/products`

### GET /api/products

- **Auth required:** No
- **Query:** `search`, `category`, `min_price`, `max_price`, `page` (default 1), `limit` (default 12)
- All query params are optional
- **Response:** `{ success: true, data: { products: Product[], total: number, page: number, limit: number } }`

### GET /api/products/categories

- **Auth required:** No
- Returns all distinct categories from the products table
- **Response:** `{ success: true, data: { categories: string[] } }`
- **Important:** This route must be registered BEFORE `/api/products/:id` in the router to avoid "categories" being interpreted as an ID.

### GET /api/products/:id

- **Auth required:** No
- **Response:** `{ success: true, data: { product: Product } }`
- **Errors:** 404 if not found

---

## Cart — `/api/cart` — All routes require Auth

### GET /api/cart

- Returns all cart items for the authenticated user, joined with product data
- **Response:** `{ success: true, data: { items: CartItemWithProduct[], total: number } }`
- `total` is computed server-side by summing `product.price * quantity`

### POST /api/cart/items

- **Body:** `{ product_id: number, quantity: number }` (see validation matrix in `guidelines/backend-guidelines.md`)
- Stock validation: `SELECT id, stock FROM products WHERE id = ?` — if not found, return 404; if `product.stock < quantity`, throw `AppError('Insufficient stock', 400)`
- If the product is already in the user's cart, increment quantity using upsert
- **Response:** `{ success: true, data: { item: CartItemWithProduct } }`

### PUT /api/cart/items/:id

- **Body:** `{ quantity: number }`
- Updates the quantity of a specific cart item owned by the authenticated user
- If quantity is 0 or less, delete the item instead
- **Response:** `{ success: true, data: { item: CartItemWithProduct } }`

### DELETE /api/cart/items/:id

- Deletes a specific cart item owned by the authenticated user
- **Response:** `{ success: true, data: { success: true } }`

### DELETE /api/cart

- Deletes all cart items for the authenticated user
- **Response:** `{ success: true, data: { success: true } }`

---

## Orders — `/api/orders` — All routes require Auth

### GET /api/orders

- Returns all orders for the authenticated user, ordered by `created_at` DESC
- **Response:** `{ success: true, data: { orders: Order[] } }`

### GET /api/orders/:id

- Returns a specific order with its line items, owned by the authenticated user
- **Response:** `{ success: true, data: { order: Order, items: OrderItemWithProduct[] } }`
- **Errors:** 404 if not found, 403 if order belongs to another user

### POST /api/orders

- **Auth required:** Yes
- **Body** (see validation matrix in `guidelines/backend-guidelines.md` for field rules):
  ```
  {
    shipping_full_name: string,
    shipping_street: string,
    shipping_city: string,
    shipping_state: string,
    shipping_zip_code: string,
    shipping_country: string,
    payment_method: 'credit_card' | 'paypal' | 'bank_transfer',
    payment_last_four?: string   (required when payment_method === 'credit_card')
  }
  ```
- **Transaction sequence** (full atomic sequence defined in `capabilities/orders.md`):
  1. Fetch authenticated user's cart items joined with current product prices and stock
  2. If cart is empty, return 400 (before opening the transaction)
  3. Pre-flight stock check (before opening the transaction): for each cart item, verify `product.stock >= item.quantity` — if any fails, throw `AppError('Insufficient stock for: {product.name}', 400)` immediately
  4. Open transaction
  5. For each cart item, run `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?` — check `affectedRows`. If 0, the concurrent stock check failed — throw `AppError` to trigger rollback
  6. Compute `total_amount` by summing `item.quantity * item.product.price`
  7. Insert one row into `orders`
  8. Insert one row per cart item into `order_items` (store `price_at_purchase` from current product price)
  9. Delete all rows from `cart_items` for this user
  10. Commit
- **Response:** `{ success: true, data: { order: Order } }`

---

## Checkout — `/api/checkout`

### POST /api/checkout/validate

- **Auth required:** Yes
- **Body:** `{ cart_item_ids: number[] }`
- Validates that all specified cart items exist, belong to the user, and the products have sufficient stock
- **Response:** `{ success: true, data: { valid: boolean, errors: string[] } }`

---

## Health — `/api/health`

### GET /api/health

- **Auth required:** No
- **Response:** `{ status: 'ok', timestamp: string }`
- Used by Docker health checks.
- **Deliberate exception:** This endpoint does not use the standard `{ success, data }` response envelope. Docker health checks only validate the HTTP 200 status code, not the response body. Keeping the response flat makes it easier to verify manually. This is the only permitted exception to the envelope rule.
