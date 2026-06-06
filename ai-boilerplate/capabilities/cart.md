# Cart Capability

This document defines the cart persistence model, stock validation, database query patterns, and frontend CartContext.

---

## 1. Persistent Cart Behavior

- Cart is user-scoped and database-backed. It lives in the `cart_items` table, keyed by `user_id`.
- Only authenticated users can add items to the cart or access the cart.
- If an unauthenticated user clicks "Add to Cart" or navigates to `/cart` or `/checkout`, redirect them immediately to `/login?redirect={current_path}`.
- There is no guest cart. There is no localStorage cart. Do not implement cart merging on login.
- When a user logs out, the cart data stays in the database and is restored on next login.
- Cart total is always computed server-side. The frontend displays the total returned by the API and never recalculates it independently.

---

## 2. Stock Validation Before Add

Before running the upsert, validate that the product exists and has sufficient stock:

```typescript
// cart.service.ts — addItem
const [productRows] = await pool.query<RowDataPacket[]>(
  'SELECT id, stock FROM products WHERE id = ?',
  [productId]
);
if (productRows.length === 0) {
  throw new AppError('Product not found', 404);
}
if (productRows[0].stock < quantity) {
  throw new AppError('Insufficient stock', 400);
}
// proceed with upsert
```

---

## 3. Upsert Pattern

When a user adds a product that is already in their cart, increment the quantity rather than creating a duplicate row:

```sql
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
```

---

## 4. Cart JOIN Query and Total Computation

The cart total is always computed server-side. The JOIN query must select every column required to construct the full `CartItemWithProduct` interface — both the `CartItem` fields and the nested `Product` fields. Use aliased column names to avoid collisions between `ci.id` and `p.id`, and between `ci.created_at` and `p.created_at`.

```sql
SELECT
  ci.id,
  ci.user_id,
  ci.product_id,
  ci.quantity,
  ci.created_at,
  ci.updated_at,
  p.id          AS p_id,
  p.name        AS p_name,
  p.description AS p_description,
  p.price       AS p_price,
  p.image_url   AS p_image_url,
  p.category    AS p_category,
  p.stock       AS p_stock,
  p.created_at  AS p_created_at
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = ?;
```

The service must reshape the flat SQL result rows into the nested `CartItemWithProduct` structure. MySQL returns flat rows — nesting must be done explicitly in TypeScript:

```typescript
// cart.service.ts — getCart
const [rows] = await pool.query<RowDataPacket[]>(cartQuery, [userId]);

const items: CartItemWithProduct[] = rows.map((row) => ({
  id: row.id,
  user_id: row.user_id,
  product_id: row.product_id,
  quantity: row.quantity,
  created_at: row.created_at,
  updated_at: row.updated_at,
  product: {
    id: row.p_id,
    name: row.p_name,
    description: row.p_description,
    price: row.p_price,
    image_url: row.p_image_url,
    category: row.p_category,
    stock: row.p_stock,
    created_at: row.p_created_at,
  },
}));

const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
return { items, total };
```

Do not sum `line_total` in SQL — compute `total` from the mapped array in the service layer as shown above.

---

## 5. CartContext (Frontend)

```typescript
interface CartContextValue {
  items: CartItemWithProduct[];
  total: number;
  itemCount: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}
```

`itemCount` is the sum of all `item.quantity` values. Displayed as a badge on the cart icon in the Navbar.
