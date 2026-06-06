# UI Components Capability

This document defines the design system tokens, reusable component specifications, and premium design requirements.

All UI is built with Tailwind CSS. No other CSS framework. No CSS modules. No styled-components.

---

## 1. Design System Tokens

| Token | Value |
|-------|-------|
| Primary color | Indigo (`indigo-600`, `indigo-700`) |
| Accent color | Emerald (`emerald-500`, `emerald-600`) |
| Background | Slate (`slate-50`, `slate-100`) |
| Text primary | Slate (`slate-900`) |
| Text secondary | Slate (`slate-500`) |
| Border | Slate (`slate-200`) |
| Error | Red (`red-500`, `red-600`) |
| Success | Green (`green-500`, `green-600`) |

---

## 2. Reusable Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Navbar` | `components/Navbar.tsx` | Top navigation: logo, links, cart badge, user menu |
| `ProductCard` | `components/ProductCard.tsx` | Product grid card with image, name, price, CTA |
| `CartItemRow` | `components/CartItemRow.tsx` | Cart page row with quantity controls |
| `CheckoutStepIndicator` | `components/CheckoutStepIndicator.tsx` | Visual step progress for checkout |
| `ProtectedRoute` | `components/ProtectedRoute.tsx` | Route guard — redirects unauthenticated users |
| `LoadingSpinner` | `components/LoadingSpinner.tsx` | Centered spinner for async loading states |
| `ErrorMessage` | `components/ErrorMessage.tsx` | User-friendly error display |
| `OrderStatusBadge` | `components/OrderStatusBadge.tsx` | Colored badge for order status |
| `EmptyState` | `components/EmptyState.tsx` | Empty cart / no orders placeholder |

---

## 3. Navbar Specification

```
[ Logo / Brand Name ]  [ Home | Products ]  [ 🛒 (count) | User Email ▾ ]
                                                           └ Profile
                                                           └ Orders
                                                           └ Logout
```

- Cart icon shows a red badge with item count when count > 0
- User dropdown shows when authenticated; "Login" and "Sign Up" links when not
- On mobile, collapse to a hamburger menu (optional but preferred)

---

## 4. Premium Design Requirements

- Use `shadow-sm` or `shadow-md` on cards, not flat
- Use `rounded-xl` for cards, `rounded-lg` for buttons and inputs
- Use gradient backgrounds on the hero section
- Use subtle hover transitions (`transition-all duration-200`)
- Product images use `object-cover` to maintain consistent aspect ratios
- Use `aspect-square` or `aspect-[4/3]` for product image containers
