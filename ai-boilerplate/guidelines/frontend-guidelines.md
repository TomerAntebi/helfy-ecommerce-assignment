# Frontend Guidelines

These guidelines define the frontend architecture, patterns, pages, and UI requirements for the React + TypeScript frontend. Read `coding-standards.md` before reading this file.

---

## 1. Architecture

### Service layer

All HTTP calls must go through service files in `src/services/`. No component may call `axios` or `fetch` directly.

```
src/services/
├── api.ts           — Axios instance with interceptors
├── auth.service.ts
├── products.service.ts
├── cart.service.ts
├── orders.service.ts
└── users.service.ts
```

The Axios instance and its 401 interceptor (with the auth endpoint exception guard) are defined in `capabilities/authentication.md`.

### Hook layer

Custom hooks in `src/hooks/` handle data fetching, loading state, and error state. They call services and expose clean data to pages.

```typescript
// Example hook pattern
export const useProducts = (filters: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsService.getProducts(filters);
        setProducts(response.products);
        setTotal(response.total);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  return { products, total, loading, error };
};
```

### State management

- **Auth state**: React Context (`AuthContext`) wrapping the entire app — see `capabilities/authentication.md`
- **Cart state**: React Context (`CartContext`) or managed within hooks, not duplicated across components
- No external state management library (no Redux, no Zustand) unless explicitly required

### Component rules

- Components are UI only. No API calls inside components.
- Props must be explicitly typed with interfaces.
- No prop drilling beyond two levels — lift state or use context.
- Every async action that can fail must show an error state, not a blank screen.

### Protected route pattern

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};
```

### Error handling

- Every API call must handle loading and error states explicitly.
- Never show a raw error object or stack trace to the user.
- Error messages must be human-readable strings.
- Use a consistent error display component (`ErrorMessage`) across all pages.

---

## 2. Pages

### Home (`/`)

- Hero section with tagline and a "Shop Now" button linking to `/products`
- Featured Products section showing the first 8 products from the API
- Premium visual design using Tailwind CSS

### Login (`/login`)

- Email and password form
- On success: store token in localStorage via `AuthContext.login()`, redirect to `?redirect` param or `/`
- On error: display the API error message
- Link to `/signup`
- Redirect to `/` if already authenticated

### Signup (`/signup`)

- First name, last name, email, password form
- On success: same behavior as login
- Link to `/login`
- Redirect to `/` if already authenticated

### Products (`/products`)

- Search input (debounced 400ms)
- Category filter dropdown (populated from `/api/products/categories`)
- Price range inputs (min and max)
- Product grid of `ProductCard` components
- Pagination controls
- Loading and error states

### Product Detail (`/products/:id`)

- Product image, name, description, price, category, stock status
- "Add to Cart" button
- If unauthenticated, "Add to Cart" redirects to `/login?redirect=/products/{id}`
- If authenticated, calls `POST /api/cart/items` and shows a success toast

### Cart (`/cart`) — Protected

- List of cart items with product image, name, price, and quantity control
- Quantity increase/decrease buttons calling `PUT /api/cart/items/:id`
- Remove button calling `DELETE /api/cart/items/:id`
- Order total computed from API response (not recalculated in the frontend)
- "Proceed to Checkout" button linking to `/checkout`
- Empty cart state with a link back to `/products`

### Checkout (`/checkout`) — Protected

Multi-step form controlled by local React state (`currentStep: 1 | 2 | 3 | 4`). See `capabilities/checkout.md` for full step definitions, state shape, field mapping, and step indicator specification.

**Step 1 — Shipping Address**
Fields: `full_name`, `street`, `city`, `state`, `zip_code`, `country`
All fields required. Show inline validation errors. "Continue" button advances to Step 2.

**Step 2 — Payment Method**
Radio group: Credit Card, PayPal, Bank Transfer.
If Credit Card selected: show a "Last 4 digits" text input.
"Back" button returns to Step 1. "Continue" advances to Step 3.

**Step 3 — Review Order**
Read-only display of:
- All cart items with quantities and prices
- Shipping address from Step 1
- Payment method from Step 2
- Order total
"Back" button returns to Step 2.
"Place Order" button calls `POST /api/orders` with accumulated form data. On success, advance to Step 4.

**Step 4 — Confirmation**
Display: "Order placed successfully!", the returned `order.id`, and a link to `/orders`.
Back navigation is disabled on this step.
Cart is already cleared by the backend.

### Profile (`/profile`) — Protected

- Display current user data (first name, last name, email, phone, address)
- Editable form with Save button calling `PUT /api/users/me`
- Email is read-only
- Success and error feedback

### Order History (`/orders`) — Protected

- List of all orders sorted by date descending
- Each row: order ID, date, status badge, total amount, "View Details" link
- Empty state with link to `/products`

### Order Detail (`/orders/:id`) — Protected

- Order metadata: ID, status, date, total
- Shipping address block using all individual shipping fields
- Payment method display
- Table of order items: product name, quantity, price at purchase, line total

---

## 3. UI Design Requirements

- Use Tailwind CSS for all styling. No other CSS framework. No CSS modules. No styled-components.
- The design must feel premium and modern.
- Use a consistent color palette — see `capabilities/ui-components.md` for the design system tokens.
- Navbar: logo on the left, navigation links in the center, cart icon with item count badge and user menu on the right.
- All interactive elements must have hover and focus states.
- Loading states must show a spinner component, not blank pages.
- Error states must show a user-friendly message, not a raw error string.

---

## 4. Form Validation

All forms use controlled React state (no form library). Validation runs on submit, not on every keystroke.

### Validation pattern

```typescript
const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

const validate = (data: FormData): boolean => {
  const newErrors: Partial<Record<keyof FormData, string>> = {};
  if (!data.email) newErrors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Invalid email format';
  if (!data.password || data.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

Inline error messages appear below each field in `text-red-500 text-sm`.
