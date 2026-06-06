# Orders Capability

This document defines the order creation sequence, atomicity requirements, and order status flow.

---

## 1. Order Creation Sequence (Must Be Atomic)

### Pre-transaction steps (run before acquiring a connection)

1. Fetch the authenticated user's cart items using the full JOIN query (same query as `getCart` — see `capabilities/cart.md`)
2. If the cart is empty, throw `AppError('Cart is empty', 400)`
3. Pre-flight stock check: for each cart item, verify `item.product.stock >= item.quantity`. If any fails, throw `AppError('Insufficient stock for: ${item.product.name}', 400)` immediately — do not open the transaction

### Inside transaction (steps 4–9 must be atomic)

```typescript
// orders.service.ts — createOrder
const connection = await pool.getConnection();
await connection.beginTransaction();
try {
  // Step 4: Reduce stock for each item atomically
  for (const item of cartItems) {
    const [result] = await connection.query<ResultSetHeader>(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [item.quantity, item.product_id, item.quantity]
    );
    if (result.affectedRows === 0) {
      throw new AppError(`Insufficient stock for: ${item.product.name}`, 400);
    }
  }

  // Step 5: Compute total
  const total_amount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  // Step 6: Insert order
  const [orderResult] = await connection.query<ResultSetHeader>(
    'INSERT INTO orders (user_id, total_amount, shipping_full_name, ...) VALUES (...)',
    [userId, total_amount, ...]
  );
  const orderId = orderResult.insertId;

  // Step 7: Insert order_items (store price_at_purchase from current product price)
  for (const item of cartItems) {
    await connection.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
      [orderId, item.product_id, item.quantity, item.product.price]
    );
  }

  // Step 8: Clear cart
  await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  await connection.commit();
  return orderId;
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

The `AND stock >= ?` condition in the UPDATE is the concurrency guard. If two requests attempt to purchase the last unit simultaneously, only one will get `affectedRows === 1`. The other gets 0 and the transaction rolls back with a 400 error.

---

## 2. Order Status Flow

```
pending → processing → shipped → delivered
                              ↘
                               cancelled
```

New orders always start as `pending`. Status transitions are not implemented in this version (no admin panel). The status is read-only from the customer perspective.
