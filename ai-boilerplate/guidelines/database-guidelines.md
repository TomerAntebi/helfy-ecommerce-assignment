# Database Guidelines

These guidelines define the MySQL schema, seed data, and database access patterns. Read `coding-standards.md` before reading this file.

---

## 1. MySQL Schema — `mysql/init/01-schema.sql`

The schema runs automatically on first MySQL container startup via `/docker-entrypoint-initdb.d/`. Never run it manually.

```sql
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_full_name VARCHAR(200) NOT NULL,
  shipping_street VARCHAR(255) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_zip_code VARCHAR(20) NOT NULL,
  shipping_country VARCHAR(100) NOT NULL,
  payment_method ENUM('credit_card','paypal','bank_transfer') NOT NULL,
  payment_last_four VARCHAR(4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 2. Seed Data — `mysql/init/02-seed.sql`

Insert at least 25 products across 5 categories: Electronics, Clothing, Home & Garden, Sports, Books.

Use realistic product names, descriptions, prices, and placeholder image URLs from `https://picsum.photos/seed/{productname}/400/400`.

Scripts in `mysql/init/` execute in lexicographic order — `01-schema.sql` before `02-seed.sql`.

### Phase 2 acceptance criteria

- `01-schema.sql` runs without errors on a fresh MySQL 8.0 instance
- `02-seed.sql` inserts at least 25 products across at least 5 categories
- All foreign key constraints are correct
- All tables have `created_at` timestamps

---

## 3. Database Access Patterns

### Connection pool

Single `mysql2/promise` pool shared across all services. Initialized once in `config/db.ts`. Imported by each service that needs database access.

**Select single row:**
```typescript
const [rows] = await pool.query<RowDataPacket[]>(
  'SELECT * FROM products WHERE id = ?',
  [id]
);
if (rows.length === 0) throw new AppError('Product not found', 404);
return rows[0] as Product;
```

**Select multiple rows with filters:**
```typescript
const conditions: string[] = [];
const params: (string | number)[] = [];

if (search) {
  conditions.push('name LIKE ?');
  params.push(`%${search}%`);
}
if (category) {
  conditions.push('category = ?');
  params.push(category);
}

const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
const [rows] = await pool.query<RowDataPacket[]>(
  `SELECT * FROM products ${where} LIMIT ? OFFSET ?`,
  [...params, limit, offset]
);
```

**Insert:**
```typescript
const [result] = await pool.query<ResultSetHeader>(
  'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
  [email, passwordHash, first_name, last_name]
);
return result.insertId;
```

**Update:**
```typescript
await pool.query(
  'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
  [first_name, last_name, id]
);
```

**Transaction (for order creation):**
```typescript
const connection = await pool.getConnection();
await connection.beginTransaction();
try {
  const [orderResult] = await connection.query<ResultSetHeader>(...);
  const orderId = orderResult.insertId;
  for (const item of cartItems) {
    await connection.query('INSERT INTO order_items ...', [...]);
  }
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

Order creation **must use a transaction** to ensure atomicity. If any step fails, the entire operation rolls back. See `capabilities/orders.md` for the full order creation sequence including the stock concurrency guard.
