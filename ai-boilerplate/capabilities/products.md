# Products Capability

This document defines the product catalog implementation patterns for both backend and frontend.

---

## 1. Search and Filter

The products service must support all of these simultaneously:

| Filter | Query param | SQL pattern |
|--------|-------------|-------------|
| Text search | `search` | `name LIKE '%{value}%'` |
| Category | `category` | `category = '{value}'` |
| Min price | `min_price` | `price >= {value}` |
| Max price | `max_price` | `price <= {value}` |
| Pagination | `page`, `limit` | `LIMIT {limit} OFFSET {(page-1)*limit}` |

All filters are optional and can be combined. The total count for pagination must come from a separate `SELECT COUNT(*)` query using the same filters (without LIMIT/OFFSET).

---

## 2. Categories Endpoint

The `/api/products/categories` endpoint returns all distinct category values:

```sql
SELECT DISTINCT category FROM products ORDER BY category ASC;
```

This route must be registered **before** `/api/products/:id` in the router. If registered after, Express will interpret the literal string `"categories"` as the `:id` parameter, causing a 404 or wrong response.

---

## 3. ProductCard Component (Frontend)

Reusable `ProductCard` component displaying:
- Product image with fallback for missing images
- Product name (truncated to 2 lines with `line-clamp-2`)
- Category badge
- Price formatted as currency (`$XX.XX`)
- "Add to Cart" button or "View Details" link
