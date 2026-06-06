# Initial Bootstrap Prompt — AI-Generated eCommerce Platform

## Before you begin

Read all files in this order before writing a single line of code:

**Guidelines (rules and standards):**
1. `ai-boilerplate/guidelines/coding-standards.md` — TypeScript rules, naming conventions, code quality, forbidden patterns, approved libraries
2. `ai-boilerplate/guidelines/backend-guidelines.md` — layered module pattern, validation matrix, error handling, response envelope, auth middleware, security
3. `ai-boilerplate/guidelines/frontend-guidelines.md` — frontend architecture, all page specifications, UI design requirements, form validation
4. `ai-boilerplate/guidelines/database-guidelines.md` — MySQL schema, seed data, database access query patterns
5. `ai-boilerplate/guidelines/docker-guidelines.md` — Dockerfiles, docker-compose.yml, environment variables, Docker rules
6. `ai-boilerplate/guidelines/documentation-guidelines.md` — ai-interactions.md template, manual intervention template, Phase 6 instructions

**Capabilities (feature implementation patterns):**
7. `ai-boilerplate/capabilities/authentication.md` — JWT strategy, email uniqueness, bcrypt, AuthContext, Axios 401 interceptor
8. `ai-boilerplate/capabilities/products.md` — search/filter patterns, categories endpoint, ProductCard spec
9. `ai-boilerplate/capabilities/cart.md` — persistence model, stock validation, upsert, JOIN query, CartContext
10. `ai-boilerplate/capabilities/checkout.md` — step definitions, state shape, progression rules, field mapping
11. `ai-boilerplate/capabilities/orders.md` — order creation sequence, stock concurrency guard, order status flow
12. `ai-boilerplate/capabilities/ui-components.md` — design system tokens, reusable components, Navbar spec, premium design rules
13. `ai-boilerplate/capabilities/api-documentation.md` — all API endpoint contracts, request/response shapes, auth requirements

Do not skip this step. Every decision you make must be consistent with those documents.

---

## Project Goal

Build a fully functional, production-grade eCommerce platform. The application must start with one command from the repository root:

```
docker compose up
```

No manual steps are permitted between cloning the repository and accessing the working application in a browser. This includes:

- No `npm install` by hand
- No manual migration commands
- No manual seed commands
- No environment variable setup beyond copying `.env.example` to `.env`

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript (strict), Vite, Tailwind CSS, React Router v6, Axios |
| Backend | Node.js 18, Express, TypeScript (strict), mysql2, bcrypt, jsonwebtoken, express-validator |
| Database | MySQL 8.0 |
| Runtime | Docker Compose |

TypeScript is mandatory on both frontend and backend. Never use `any`. Never bypass the TypeScript compiler. See `guidelines/coding-standards.md` for the full TypeScript standard.

---

## Repository Structure

Generate the project exactly in this structure. Do not create additional top-level directories.

```
/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── types/
│       ├── services/
│       ├── hooks/
│       ├── components/
│       └── pages/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── products/
│       │   ├── cart/
│       │   ├── orders/
│       │   ├── checkout/
│       │   └── health/
│       └── types/
├── mysql/
│   └── init/
│       ├── 01-schema.sql
│       └── 02-seed.sql
├── ai-boilerplate/
│   ├── initial.md
│   ├── guidelines/
│   │   ├── coding-standards.md
│   │   ├── backend-guidelines.md
│   │   ├── frontend-guidelines.md
│   │   ├── database-guidelines.md
│   │   ├── docker-guidelines.md
│   │   └── documentation-guidelines.md
│   └── capabilities/
│       ├── authentication.md
│       ├── products.md
│       ├── cart.md
│       ├── checkout.md
│       ├── orders.md
│       ├── ui-components.md
│       └── api-documentation.md
├── docker-compose.yml
├── .env.example
├── README.md
└── ai-interactions.md
```

---

## Execution Rules

You must follow these rules for every phase without exception:

1. **Work one phase at a time.** Do not begin Phase 2 until Phase 1 is complete and all files are summarized.
2. **Stop after each phase.** Output a list of every file created or modified with a one-line description before proceeding.
3. **Do not add features not defined in this document.** No extra endpoints, no additional pages, no additional libraries beyond the stack defined above.
4. **Always follow the guidelines files.** If a shortcut conflicts with a guideline, follow the guideline.
5. **Never use `any` in TypeScript.** Define an interface for every unknown shape. Use `unknown` and type guards for truly dynamic data.
6. **Never silence TypeScript errors** with `@ts-ignore` or `as any`.
7. **Always update `ai-interactions.md`** after completing each phase. Record the phase, files changed, and any manual interventions.
8. **Document every manual fix in `README.md`** under the Manual Interventions section with the required template.
9. **Do not install libraries outside the defined stack** without a comment explaining why they are necessary.
10. **Database schema is the source of truth.** TypeScript interfaces in `backend/src/types/` must exactly match the database columns.
11. **Do not modify files from a completed phase** unless fixing a bug found during testing. If you do, log it as a manual intervention.
12. **Every API response must follow the standard response envelope** defined in `guidelines/backend-guidelines.md`. The only exception is `GET /api/health` — see `capabilities/api-documentation.md`.
13. **Never require manual database operations.** No `mysql` shell commands, no manual `CREATE DATABASE`, no `source` commands, no migration tools. All schema creation and seeding happens automatically through `/docker-entrypoint-initdb.d/` scripts on first MySQL container startup. If a database operation cannot be automated this way, it is a design error that must be fixed, not documented as a manual step.

---

## Phase 1 — Backend

### Goal

Generate the complete Express + TypeScript backend with all modules.

See `guidelines/backend-guidelines.md` for the folder structure, module rules, and architectural patterns.
See `capabilities/api-documentation.md` for all endpoint contracts.

### Phase 1 acceptance criteria

- `npm run build` succeeds with zero TypeScript errors
- All routes are registered and return the correct HTTP status codes
- JWT middleware correctly rejects requests with missing or invalid tokens with 401
- bcrypt is used for all password operations
- Database connection pool is initialized from environment variables

---

## Phase 2 — Database

### Goal

Generate the MySQL schema and seed data.

See `guidelines/database-guidelines.md` for the full schema SQL and seed data instructions.

### Phase 2 acceptance criteria

- `01-schema.sql` runs without errors on a fresh MySQL 8.0 instance
- `02-seed.sql` inserts at least 25 products across at least 5 categories
- All foreign key constraints are correct
- All tables have `created_at` timestamps

---

## Phase 3 — Frontend

### Goal

Generate the complete React + TypeScript frontend connected to the real backend API.

See `guidelines/frontend-guidelines.md` for all page specifications, architecture rules, and UI design requirements.
See `capabilities/authentication.md` for the AuthContext and Axios instance.
See `capabilities/ui-components.md` for the design system and reusable components.
See `capabilities/checkout.md` for the checkout step definitions and state management.

### Phase 3 acceptance criteria

- `npm run build` succeeds with zero TypeScript errors
- All pages render without runtime errors
- All protected routes redirect unauthenticated users to `/login`
- All API calls go through the service layer, not directly from components
- Cart item count in the Navbar updates after adding/removing items

---

## Phase 4 — Docker

### Goal

Wire all three services into a single `docker compose up` startup.

See `guidelines/docker-guidelines.md` for all Dockerfiles, nginx.conf, docker-compose.yml, and Docker rules.

### Phase 4 acceptance criteria

- `docker compose up --build` from a clean checkout completes without error
- All three services are running and healthy
- The `db` container health check passes (mysqladmin ping succeeds)
- The `backend` container health check passes (`GET /api/health` returns HTTP 200)
- The `frontend` container starts only after backend is healthy (verified by `docker compose logs` sequence)
- `http://localhost:3000` renders the frontend
- `http://localhost:3000/api/health` returns `{"status":"ok"}`
- The frontend can successfully authenticate and load products through the nginx proxy

---

## Phase 5 — Testing and Fixes

### Goal

Verify every item in the testing checklist. Fix any failures before marking this phase complete.

### Testing checklist

Work through each item sequentially. If an item fails, fix it before continuing.

- [ ] `docker compose up` from a clean clone (no pre-existing volumes) completes without error
- [ ] Application is reachable at `http://localhost:3000`
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] Signup flow creates a user and returns a JWT
- [ ] Login flow with correct credentials returns a JWT
- [ ] Login flow with wrong credentials returns 401
- [ ] Products page loads with at least 20 seeded products
- [ ] Search query filters products by name
- [ ] Category filter narrows product list
- [ ] Price range filter narrows product list
- [ ] Product detail page displays name, description, price, and image
- [ ] Unauthenticated "Add to Cart" click redirects to `/login`
- [ ] Authenticated "Add to Cart" adds item to cart and persists after page refresh
- [ ] Cart page shows correct items and quantities
- [ ] Cart quantity update changes quantity
- [ ] Cart item removal removes item
- [ ] Checkout Step 1 accepts and validates shipping fields
- [ ] Checkout Step 2 accepts payment method selection
- [ ] Checkout Step 3 shows correct order summary
- [ ] Checkout Step 3 "Place Order" creates order and clears cart
- [ ] Checkout Step 4 shows order ID
- [ ] Order history page lists the created order
- [ ] Order detail page shows items and shipping info
- [ ] Profile page updates first name and phone successfully

### Phase 5 rules

- Document every bug found and every fix applied in `ai-interactions.md`
- If a fix modifies a file from Phase 1, 2, 3, or 4, log it as a manual intervention in `README.md`
- Do not add new features while fixing bugs

---

## Phase 6 — Documentation

### Goal

Finalize all documentation files.

See `guidelines/documentation-guidelines.md` for required templates and instructions.

---

## Project Success Criteria

The project is considered complete only when every item below is true. This list takes precedence over any individual phase acceptance criteria. Do not mark the project as done until every item is verified.

### Build

- [ ] `cd backend && npm run build` exits with code 0 and zero TypeScript errors
- [ ] `cd frontend && npm run build` exits with code 0 and zero TypeScript errors

### Docker startup

- [ ] `docker compose up --build` from a clean clone (no pre-existing volumes, no `.env` modifications beyond the example) completes without error
- [ ] No container restarts after initial startup sequence completes
- [ ] `docker compose ps` shows all three services as running and healthy
- [ ] `GET http://localhost:3000/api/health` returns HTTP 200 with `{"status":"ok"}`

### Authentication

- [ ] Signup with a new email creates a user and returns a JWT
- [ ] Signup with a duplicate email returns HTTP 409
- [ ] Login with correct credentials returns a JWT
- [ ] Login with wrong credentials returns HTTP 401 — the login page shows an error, it does not redirect
- [ ] A protected API endpoint called without a token returns HTTP 401

### Product catalog

- [ ] `GET /api/products` returns at least 25 seeded products
- [ ] Search by name filters results
- [ ] Category filter narrows results
- [ ] Min and max price filters narrow results
- [ ] All filters work simultaneously
- [ ] `GET /api/products/categories` returns all 5+ seeded categories
- [ ] Product detail page renders name, description, price, image, and stock status

### Cart

- [ ] Unauthenticated "Add to Cart" click redirects to `/login?redirect=/products/{id}`
- [ ] Authenticated "Add to Cart" persists after page refresh (data comes from DB, not localStorage)
- [ ] Adding an item with quantity exceeding stock returns a 400 error
- [ ] Cart item quantity update works
- [ ] Cart item removal works
- [ ] Cart total in the UI matches the server-computed total

### Checkout

- [ ] Step 1 validates all shipping fields and blocks progression if any are empty
- [ ] Step 2 requires payment method; credit card requires last 4 digits
- [ ] Step 3 displays a read-only summary of cart items, shipping address, and payment method
- [ ] "Place Order" creates an order, reduces product stock, and clears the cart
- [ ] Step 4 displays the created order ID
- [ ] Attempting to checkout with a product that has insufficient stock returns a 400 error before the order is created

### Orders

- [ ] Order history page lists the created order with ID, date, status, and total
- [ ] Order detail page shows all structured shipping fields and line items with `price_at_purchase`

### Profile

- [ ] Profile page loads current user data
- [ ] Updating first name and phone saves and is reflected immediately
- [ ] Email field is read-only and cannot be changed
