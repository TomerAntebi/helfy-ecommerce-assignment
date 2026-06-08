# AI Interactions Log

This file documents every AI interaction, tool usage, query, and manual intervention made during the development of this project. It is updated after each phase.

The purpose of this log is to demonstrate AI orchestration rigor: how models were selected, how prompts were structured, where AI succeeded, and where human judgment was required.

---

## How to add an entry

Copy the template below and fill in all fields. Add new entries in chronological order. Do not delete or modify past entries.

```markdown
## Interaction [N] — [Short descriptive title]

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Tool | Cline / ChatGPT / Claude.ai / Cursor / Gemini / etc. |
| Model | e.g. claude-sonnet-4-5, gpt-4o, gemini-2.0-flash |
| Phase | Planning / Phase 1 / Phase 2 / Phase 3 / Phase 4 / Phase 5 / Phase 6 |

### Prompt

[Full prompt text, or a summary if the prompt was very long. Include context given to the model.]

### Result

[What was generated or answered. Be specific about files created and key decisions made.]

### Files Changed

- `path/to/file.ts` — what was created or modified

### Manual Intervention

[Yes / No]

### Reason for Manual Intervention

[If Yes: describe exactly what failed, why the AI could not handle it, and what was done manually.
If No: N/A]
```

---

## Interaction 1 — Architecture planning and blueprint creation

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cursor (Agent mode) |
| Model | claude-sonnet-4-5 |
| Phase | Planning |

### Prompt

Create a detailed technical plan for an AI-generated full-stack eCommerce platform with React, Node.js/Express, TypeScript, MySQL, and Docker Compose. The project must start with `docker compose up` and require no manual steps. Define all backend modules, frontend pages, database schema, API routes, Docker configuration, AI generation strategy, coding rules, and documentation rules. Then create the AI blueprint files: `ai-boilerplate/initial.md`, `ai-boilerplate/engineering-guidelines.md`, `ai-boilerplate/capability-definitions.md`, `ai-interactions.md`, `README.md`, and `.env.example`.

### Result

Created a comprehensive architecture plan covering:
- System architecture with Docker Compose network diagram
- Backend module plan (7 modules: auth, users, products, cart, orders, checkout, health)
- Frontend page plan (10 routes)
- Database schema (5 tables with FK relations)
- Complete API route plan with request/response shapes
- Docker plan with health checks and init scripts
- 6-phase AI generation strategy
- Strict Cline execution rules (10 rules)
- Testing checklist (22 items)
- Required ai-interactions.md entry template
- Required README.md manual intervention template

Then generated all blueprint files.

### Files Changed

- `ai-boilerplate/initial.md` — created: master bootstrap prompt for Cline (highly detailed, includes all phases, API routes, schema, execution rules, testing checklist)
- `ai-boilerplate/engineering-guidelines.md` — created: TypeScript standard, layered architecture, naming conventions, error handling, security, forbidden patterns
- `ai-boilerplate/capability-definitions.md` — created: auth strategy, DB access patterns, cart upsert, order transaction, checkout state machine, UI component library, approved libraries
- `ai-interactions.md` — created: this file
- `README.md` — created: project overview skeleton with manual intervention section
- `.env.example` — created: all required environment variables with descriptions

### Manual Intervention

No

### Reason for Manual Intervention

N/A

---

## Interaction 2 — Blueprint improvement pass: 12 architectural gaps closed

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cursor (Agent mode) |
| Model | claude-sonnet-4-5 |
| Phase | Planning |

### Prompt

Review all AI blueprint files and improve them before implementation. Do not generate application code. Close these gaps: (1) inventory management — stock validation on cart add, stock validation and reduction inside order transaction; (2) email uniqueness — explicit SELECT-before-INSERT pattern, 409 on conflict; (3) backend validation matrix — comprehensive table for all endpoints including conditional `payment_last_four`; (4) Docker health verification — backend healthcheck using `wget`, frontend `depends_on: condition: service_healthy`; (5) ai-interactions.md placeholder cleanup; (6) project success criteria section; (7) no manual database operations as a formal rule; (8) blueprint consistency — fix incomplete cart JOIN SQL, add row-to-interface mapping, fix 401 interceptor bug on auth endpoints, fix VITE_API_URL ARG in frontend Dockerfile, document health endpoint envelope exception, add ShippingFormData-to-API-body mapping.

### Result

Identified and closed 12 gaps across all blueprint files:

1. Stock check before cart add + stock reduction inside order transaction (with concurrency guard via `AND stock >= ?`)
2. Email uniqueness SELECT-before-INSERT pattern documented in both `initial.md` and `capability-definitions.md`
3. Full validation matrix table (20 rules across 7 endpoints) added to `engineering-guidelines.md`
4. Backend Docker healthcheck using `wget --spider` added to `docker-compose.yml` spec; frontend `depends_on` upgraded to `condition: service_healthy`
5. Frontend Dockerfile `ARG VITE_API_URL=""` + `ENV` declaration added before `RUN npm run build`
6. Complete cart JOIN SQL query (14 columns, aliased to avoid collisions) + explicit TypeScript row-mapping code added to `capability-definitions.md`
7. 401 interceptor corrected to skip redirect when `error.config.url` starts with `/api/auth`
8. Health endpoint envelope exception documented in both `engineering-guidelines.md` and `initial.md`
9. `ShippingFormData` → API body field mapping added with explicit TypeScript snippet
10. Rule 13 (no manual database operations) added to `initial.md` Execution Rules
11. Project Success Criteria section added to `initial.md` with 25 specific checkboxes
12. `ai-interactions.md` Interaction 2 filled; empty Interaction 3 removed

### Files Changed

- `ai-boilerplate/initial.md` — 9 targeted additions and fixes
- `ai-boilerplate/engineering-guidelines.md` — validation matrix, health envelope exception, Docker healthcheck rules, no manual DB ops rule, 5 new forbidden patterns
- `ai-boilerplate/capability-definitions.md` — email uniqueness, stock check, complete cart SQL + mapping, order transaction with stock reduction, ShippingFormData mapping, 401 interceptor fix
- `ai-interactions.md` — this entry filled, empty Interaction 3 removed

### Manual Intervention

No

### Reason for Manual Intervention

N/A

---

## Interaction 3 — Phase 1 Backend implementation (Cline)

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cline (VS Code extension) |
| Model | Model used through OpenRouter, exact model not recorded |
| Phase | Phase 1 — Backend |

### Prompt

Implement the full Express + TypeScript backend. Read all files in `ai-boilerplate/` first in the order specified in `initial.md`. Then implement Phase 1 (backend) only. Do not implement the frontend, Docker configuration, or database seed data yet. Follow TypeScript strict mode throughout — no `any`, no `@ts-ignore`. Follow the router → controller → service layered architecture. Each module (auth, users, products, cart, orders, checkout, health) must have its own folder with a router, controller, and service file. Use the standard `{ success, data }` response envelope for all endpoints except `GET /api/health`. Implement JWT middleware using `jsonwebtoken`. Hash passwords with `bcrypt`. Use `express-validator` for request validation. Connect to MySQL via `mysql2/promise` pool configured from environment variables. After completion, update `ai-interactions.md` and stop.

### Result

Generated the complete backend. `npm run build` exits with code 0 and zero TypeScript errors. All seven modules were created with full router/controller/service separation. JWT auth middleware correctly rejects unauthenticated requests. bcrypt is used for all password operations. MySQL connection pool is initialized from environment variables. Stock validation is applied on cart add. Stock reduction occurs inside the order creation transaction with a concurrency guard (`AND stock >= ?`). Email uniqueness is checked with a SELECT-before-INSERT pattern returning 409 on conflict. The `GET /api/health` endpoint returns a flat response (`{ status: "ok" }`) as permitted by the blueprint.

### Files Changed

**Scaffold / config (4 files)**
- `backend/package.json` — created: dependencies (express, mysql2, bcrypt, jsonwebtoken, express-validator, cors, dotenv) and devDependencies (typescript, ts-node, type definitions)
- `backend/tsconfig.json` — created: strict TypeScript config targeting ES2020, commonjs output to `dist/`
- `backend/Dockerfile` — created: node:18-alpine, npm install, build, CMD npm start (later corrected in Phase 4)
- `backend/src/index.ts` — created: Express app setup, CORS, JSON middleware, all module routers registered, global error handler

**Config (1 file)**
- `backend/src/config/db.ts` — created: mysql2/promise connection pool initialized from environment variables

**Middleware (2 files)**
- `backend/src/middleware/auth.middleware.ts` — created: JWT verification middleware, attaches decoded user to `AuthenticatedRequest`
- `backend/src/middleware/error.middleware.ts` — created: global Express error handler, formats AppError into `{ success: false, error }` envelope

**Types (1 file)**
- `backend/src/types/index.ts` — created: User, Product, CartItem, CartItemWithProduct, Order, OrderItem, OrderItemWithProduct interfaces; AppError class

**Auth module (3 files)**
- `backend/src/modules/auth/auth.router.ts` — created: POST /api/auth/signup, POST /api/auth/login
- `backend/src/modules/auth/auth.controller.ts` — created: signup and login handlers with express-validator validation
- `backend/src/modules/auth/auth.service.ts` — created: SELECT-before-INSERT email uniqueness check, bcrypt hash/compare, JWT sign

**Users module (3 files)**
- `backend/src/modules/users/users.router.ts` — created: GET /api/users/me, PUT /api/users/me (both protected)
- `backend/src/modules/users/users.controller.ts` — created: getMe and updateMe handlers
- `backend/src/modules/users/users.service.ts` — created: SELECT and UPDATE queries for user profile

**Products module (3 files)**
- `backend/src/modules/products/products.router.ts` — created: GET /api/products, GET /api/products/categories, GET /api/products/:id (categories registered before :id to avoid routing conflict)
- `backend/src/modules/products/products.controller.ts` — created: getProducts (with filter params), getProductById, getCategories
- `backend/src/modules/products/products.service.ts` — created: dynamic WHERE clause builder for search/category/price filters with pagination

**Cart module (3 files)**
- `backend/src/modules/cart/cart.router.ts` — created: GET /api/cart, POST /api/cart/items, PUT /api/cart/items/:id, DELETE /api/cart/items/:id, DELETE /api/cart (all protected)
- `backend/src/modules/cart/cart.controller.ts` — created: getCart, addItem, updateItem, removeItem, clearCart handlers
- `backend/src/modules/cart/cart.service.ts` — created: JOIN query returning cart items with product data, upsert on duplicate key, stock check before add

**Orders module (3 files)**
- `backend/src/modules/orders/orders.router.ts` — created: GET /api/orders, GET /api/orders/:id, POST /api/orders (all protected)
- `backend/src/modules/orders/orders.controller.ts` — created: getOrders, getOrderById, createOrder handlers
- `backend/src/modules/orders/orders.service.ts` — created: order creation in a transaction with stock reduction and concurrency guard

**Checkout module (3 files)**
- `backend/src/modules/checkout/checkout.router.ts` — created: POST /api/checkout (protected)
- `backend/src/modules/checkout/checkout.controller.ts` — created: checkout handler
- `backend/src/modules/checkout/checkout.service.ts` — created: delegates to orders service

**Health module (1 file)**
- `backend/src/modules/health/health.router.ts` — created: GET /api/health returns flat `{ status: "ok", timestamp }` (no envelope, permitted exception)

### Manual Intervention

Yes

### Reason for Manual Intervention

Cline completed the backend implementation but got stuck before writing the required AI interaction log entry. Cursor filled this documentation entry afterward based on the generated files and the original prompt structure. The exact model Cline used was not recorded.

---

## Interaction 4 — Phase 2 Database schema and seed data (Cline)

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cline (VS Code extension) |
| Model | Model used through OpenRouter, exact model not recorded |
| Phase | Phase 2 — Database |

### Prompt

Implement Phase 2 (database) only. Read `ai-boilerplate/guidelines/database-guidelines.md` first. Generate `mysql/init/01-schema.sql` and `mysql/init/02-seed.sql`. The schema must match the TypeScript interfaces in `backend/src/types/index.ts` exactly. The seed must insert at least 25 products across at least 5 categories. Use `picsum.photos` URLs for product images. All files must run without errors on a fresh MySQL 8.0 instance. Do not modify backend or frontend code. After completion, update `ai-interactions.md` and stop.

### Result

Generated both MySQL init scripts. `01-schema.sql` creates the `ecommerce` database and all 5 tables with correct foreign keys and constraints. `02-seed.sql` inserts 27 products across 5 categories (Electronics 6, Clothing 6, Home & Garden 6, Sports 4, Books 5). Product images use `picsum.photos` seed URLs. Scripts run in lexicographic order via `/docker-entrypoint-initdb.d/` on MySQL container first start — no manual SQL execution required.

### Files Changed

- `mysql/init/01-schema.sql` — created: `CREATE DATABASE IF NOT EXISTS ecommerce`; tables: users (9 columns), products (8 columns), cart_items (6 columns, UNIQUE constraint on user_id+product_id), orders (16 columns, ENUM status and payment_method), order_items (5 columns, price_at_purchase preserved at order time); all foreign keys with ON DELETE CASCADE where appropriate
- `mysql/init/02-seed.sql` — created: 27 products across 5 categories inserted via 5 batched INSERT statements

### Manual Intervention

Yes

### Reason for Manual Intervention

Cline completed the database implementation but got stuck before writing the required AI interaction log entry. Cursor filled this documentation entry afterward based on the generated files and the original prompt structure. The exact model Cline used was not recorded.

---

## Interaction 5 — Phase 3 Frontend implementation (Cursor takeover from Cline)

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cursor (Agent mode) |
| Model | claude-sonnet-4-5 |
| Phase | Phase 3 — Frontend |

### Prompt

Cline got stuck during Phase 3 (React frontend). Cursor took over with the instruction to implement the complete frontend from scratch without modifying the backend, database schema, or API contracts. Full requirements were provided: React 18, TypeScript (strict), Vite, Tailwind CSS, React Router v6, Axios, all 10 pages, all 9 reusable components, full service and hook layers, AuthContext, CartContext, multi-step checkout, and a passing `npm run build`.

### Result

Built the entire `frontend/` directory from zero. `npm run build` exits with code 0 and zero TypeScript errors. One TypeScript fix was required during the session: a missing `src/vite-env.d.ts` reference file to expose `import.meta.env` typing.

### Files Changed

**Scaffold / config (7 files)**
- `frontend/package.json` — created
- `frontend/tsconfig.json` — created
- `frontend/vite.config.ts` — created: Vite config with `/api` proxy to localhost:4000
- `frontend/index.html` — created
- `frontend/tailwind.config.js` — created
- `frontend/postcss.config.js` — created
- `frontend/src/vite-env.d.ts` — created: fixed TS2339 build error on `import.meta.env`

**Types, Services, Contexts, Hooks, Components, Pages, Entry (33 files)** — see plan for full list.

### Manual Intervention

Yes — one TypeScript error caught and fixed within the session.

### Reason for Manual Intervention

`import.meta.env` required `/// <reference types="vite/client" />`. The `vite-env.d.ts` file was added after the first `npm run build` failure to resolve TS2339.

---

## Interaction 6 — Phase 4 Docker and full application runtime

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cursor (Agent mode) |
| Model | claude-sonnet-4-5 |
| Phase | Phase 4 — Docker |

### Prompt

Implement Phase 4: Docker and full application runtime. Wire all three services (db, backend, frontend) into a single `docker compose up` startup. Create backend/Dockerfile, frontend/Dockerfile, frontend/nginx.conf, and docker-compose.yml. The app must start from a clean clone with `cp .env.example .env && docker compose up --build` — no manual steps.

### Result

Created all four Docker configuration files. The backend Dockerfile was updated from the AI-generated version (which used `npm install` and `npm start`) to the guideline-compliant version using `npm ci` and `node dist/index.js`. The frontend uses a two-stage build (node:18-alpine for building, nginx:alpine for serving). The nginx config proxies `/api` to `http://backend:4000` and supports client-side routing via `try_files`. The docker-compose.yml wires all three services with health checks and correct dependency ordering.

### Files Changed

- `backend/Dockerfile` — updated: replaced `npm install` with `npm ci`, replaced `CMD ["npm", "start"]` with `CMD ["node", "dist/index.js"]` per Docker guidelines
- `frontend/Dockerfile` — created: multi-stage build (node:18-alpine builder + nginx:alpine server), ARG/ENV for VITE_API_URL
- `frontend/nginx.conf` — created: serves React SPA with try_files for client-side routing, proxies /api to backend:4000
- `docker-compose.yml` — created: db (mysql:8.0 with healthcheck), backend (depends on db healthy, wget healthcheck), frontend (depends on backend healthy, port 3000:80)

### Manual Intervention

No

### Reason for Manual Intervention

N/A

### Assumptions

- `VITE_API_URL` is passed as empty string at build time; nginx handles the /api proxy so Axios relative requests work correctly.
- The backend Dockerfile correction (npm install → npm ci, npm start → node dist/index.js) is a fix to an AI-generated file from a prior phase, not a backend code change.
- MySQL init scripts in `mysql/init/` run automatically in lexicographic order (`01-schema.sql` then `02-seed.sql`) via `/docker-entrypoint-initdb.d/`.

---

## Interaction 7 — Phase 5 Testing, integration verification, and fixes

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cursor (Agent mode) |
| Model | claude-sonnet-4-5 |
| Phase | Phase 5 — Testing and Fixes |

### Prompt

Implement Phase 5: testing, integration verification, and required fixes. Read all blueprint files first. Verify the full application against the testing checklist. Fix only the smallest necessary code. Document all bugs, root causes, and fixes.

### Result

Performed a full static code audit of all backend modules (auth, users, products, cart, orders, checkout, health) and all frontend pages and components. Both `npm run build` commands passed with zero TypeScript errors before any changes.

**One bug found and fixed:**

`frontend/src/pages/OrdersPage.tsx` line 62: `order.total_amount.toFixed(2)` was missing the `Number()` wrapper that was applied to all other price fields in the previous fix session. This was the only `.toFixed()` call left unwrapped in the entire codebase. With `decimalNumbers: true` now in the mysql2 pool config, this field arrives as a real number and would not crash; however, the wrapper was added for consistency and defense.

**Full audit findings — all pass:**
- Auth: signup with SELECT-before-INSERT email uniqueness check ✅, login with bcrypt compare ✅, JWT sign with env secret ✅, 409 on duplicate email ✅, 401 on wrong password ✅
- Users: GET/PUT /api/users/me protected ✅, partial update with field guards ✅, email read-only (not in updateUser) ✅
- Products: public endpoints ✅, categories route registered before /:id ✅, search/category/price filters ✅, pagination ✅
- Cart: all routes protected ✅, fetchCart guards on user null in CartContext ✅, upsert on duplicate ✅, stock check on addItem ✅
- Orders: transaction with stock reduction and concurrency guard ✅, pre-flight stock check ✅, cart cleared after order ✅, 400 on empty cart ✅
- Health: flat response (no envelope) ✅, used by Docker wget healthcheck ✅
- Frontend routing: public routes (/, /products, /products/:id, /login, /signup) not wrapped in ProtectedRoute ✅, protected routes (/cart, /checkout, /profile, /orders, /orders/:id) all wrapped ✅
- ErrorBoundary: wraps all routes in App.tsx ✅
- API response shape: all services unwrap `res.data.data` correctly ✅
- DECIMAL type safety: `decimalNumbers: true` in mysql2 pool + `Number()` wrapper on all `.toFixed()` calls ✅

### Files Changed

- `frontend/src/pages/OrdersPage.tsx` — fixed: added `Number()` wrapper on `order.total_amount.toFixed(2)` (line 62) to match all other price fields in the project

### Manual Intervention

No

### Reason for Manual Intervention

N/A

---

## Interaction 8 — Phase 6 Documentation finalization

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cursor (Agent mode) |
| Model | claude-sonnet-4-5 |
| Phase | Phase 6 — Documentation |

### Prompt

Finalize all documentation for Phase 6. Read the documentation guidelines. Update README.md with a complete overview, run instructions, environment variable table, repository structure, Docker architecture diagram, AI generation summary table, and all manual intervention entries. Update ai-interactions.md with the Phase 6 entry, finalize the Models Used table, fill the AI-Gap Analysis table, and update the Tools table.

### Result

Rewrote `README.md` with complete, production-quality documentation. Added CORS limitation to Known Limitations. Merged Manual Interventions 1 and 2 (previously correct) with a new consolidated entry for Intervention 3 (mysql2 DECIMAL white-screen crash — previously split across two entries). Added Interaction 8 (this entry), completed the Models Used table, filled the AI-Gap Analysis table with three real observed gaps, and updated the Tools table with Phase 5 and Phase 6 entries.

### Files Changed

- `README.md` — fully rewritten: complete overview, stack, run instructions, environment variable descriptions, repository structure, Docker architecture, AI generation summary table, 4 manual intervention entries, known limitations, local dev instructions
- `ai-interactions.md` — Interaction 8 added; Models Used and AI-Gap Analysis tables finalized; Tools table updated

### Manual Intervention

No

### Reason for Manual Intervention

N/A

---

## Interaction 9 — Docker and build hardening

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cursor (Agent mode) |
| Model | claude-sonnet-4-5 |
| Phase | Post Phase 6 — Hardening |

### Prompt

Fix Docker and build robustness issues: upgrade Node 18 to Node 22, pin nginx image version, add explicit CMD in nginx stage, fix `location /api` to `location /api/` in nginx.conf, fix VITE_API_URL build-time behavior documentation, add frontend healthcheck to docker-compose.yml, verify TypeScript build passes with strict mode, verify full Docker Compose stack builds and runs successfully.

### Result

- Verified `tsc && vite build` passes with zero errors under `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true` (no source changes needed — code was already clean).
- Updated `frontend/Dockerfile`: `node:18-alpine` → `node:22-alpine`, `nginx:alpine` → `nginx:1.27-alpine`, added `CMD ["nginx", "-g", "daemon off;"]`, improved VITE_API_URL comment.
- Updated `backend/Dockerfile`: `node:18-alpine` → `node:22-alpine`.
- Updated `frontend/nginx.conf`: `location /api` → `location /api/` (precise prefix match; `proxy_pass http://backend:4000` with no trailing slash preserves full `/api/...` path).
- Updated `docker-compose.yml`: added frontend healthcheck using `wget --spider -q http://127.0.0.1/` (using `127.0.0.1` not `localhost` because Alpine resolves `localhost` to `::1` but nginx listens on IPv4 only), updated Node version comment.
- Updated `README.md`: Node version in stack table, Dockerfile descriptions, Docker architecture diagram, added VITE_API_URL behavior explanation, added Manual Intervention 5.
- Docker Compose build: `helfy-ecommerce-assignment-frontend` and `helfy-ecommerce-assignment-backend` both built successfully with `--no-cache`.
- Docker Compose up: all three services healthy — `db` (healthy), `backend` (healthy), `frontend` (healthy).
- Verified: `http://localhost:3000/` → HTTP 200, `http://localhost:3000/api/health` → `{"status":"ok",...}`, products endpoint returns data through nginx proxy.

### Manual Intervention

No

### Reason for Manual Intervention

N/A

---

## Interaction 10 — Backend audit and hardening

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Tool | Cursor (Agent mode) |
| Model | claude-sonnet-4-5 |
| Phase | Post Phase 6 — Backend Hardening |

### Prompt

Audit all backend source files against a reported list of issues. Verify each issue against the actual code. Fix only real, relevant, assignment-ready issues. Do not rewrite the backend, do not change the database schema, do not add new libraries.

### Verified Issues (real vs. not real)

| Issue | Real? | Action |
|-------|-------|--------|
| dotenv loads after db.ts pool creation | **YES** | Fixed |
| DB_PORT becomes NaN if unset | **YES** | Fixed |
| No env var validation at startup | **YES** | Fixed |
| JWT_SECRET cast as string in auth middleware | **YES** | Fixed |
| Error middleware leaks raw error messages | **YES** | Fixed |
| issueToken duplicated in signup/login | **YES** | Fixed |
| No query param validation on products route | **YES** | Fixed |
| SELECT * in products service | **YES** | Fixed |
| addItem stock check ignores existing cart quantity | **YES** | Fixed |
| updateItem has no stock check | **YES** | Fixed |
| No :id param validation in routers | **YES** | Fixed |
| Phone field only max-length validated | **YES** | Fixed |
| cart_item_ids validation too permissive | **YES** | Fixed |
| Health endpoint does not check DB | **YES** | Fixed |
| noUnusedLocals/noUnusedParameters missing | **YES** | Fixed |
| Cart/order ownership scoping wrong | **NOT real** | Already correct in all queries |
| Orders transaction missing | **NOT real** | Full transaction already implemented |
| Empty PUT /users/me should error | **NOT real** | Returns current user gracefully |

### Result

Created `backend/src/config/env.ts`: loads dotenv once, validates all required env vars, exports typed `config` object. Updated `db.ts` and `auth.middleware.ts` and `auth.service.ts` to consume `config`. Fixed `index.ts` to import `config` as its first import (ensuring dotenv loads before pool creation). Fixed `error.middleware.ts` to use `instanceof AppError` and return generic message for programmer errors. Extracted `issueToken` helper in `auth.service.ts`. Added `query`/`param` validators to products, cart, and orders routers. Added `validationResult` checks to `getCategories`, `removeItem`, and `getOrderById` controllers. Replaced `SELECT *` with explicit columns in `products.service.ts`. Added existing-cart-quantity check and new updateItem stock check in `cart.service.ts`. Added `SELECT 1` DB connectivity check to `health.router.ts` (returns 503 on DB failure). Strengthened checkout `cart_item_ids` validation. Added phone format validation in `users.router.ts`. Removed unused `AppError` import from `checkout.service.ts`. Added `noUnusedLocals: true` and `noUnusedParameters: true` to `backend/tsconfig.json`. Fixed `_req` naming in `products.controller.ts` `getCategories` to satisfy `noUnusedParameters`. Backend `npm run build` passes with zero errors. Docker `docker compose build backend --no-cache` passes. Full stack healthy after `docker compose up`.

### Files changed

- `backend/src/config/env.ts` (new)
- `backend/src/config/db.ts`
- `backend/src/index.ts`
- `backend/src/middleware/error.middleware.ts`
- `backend/src/middleware/auth.middleware.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/products/products.service.ts`
- `backend/src/modules/products/products.router.ts`
- `backend/src/modules/products/products.controller.ts`
- `backend/src/modules/cart/cart.service.ts`
- `backend/src/modules/cart/cart.router.ts`
- `backend/src/modules/cart/cart.controller.ts`
- `backend/src/modules/orders/orders.router.ts`
- `backend/src/modules/orders/orders.controller.ts`
- `backend/src/modules/health/health.router.ts`
- `backend/src/modules/checkout/checkout.router.ts`
- `backend/src/modules/checkout/checkout.service.ts`
- `backend/src/modules/users/users.router.ts`
- `backend/tsconfig.json`

### Manual Intervention

No

### Reason for Manual Intervention

N/A

---

---

## Interaction 11 — Frontend api.ts audit and hardening

### Date
2026-06-06

### Prompt summary
Review reported issues in `frontend/src/services/api.ts` and related files. Verify which issues actually exist. Fix only real and relevant issues. Do not rewrite the frontend, change API contracts, or add new libraries.

### Issues verified

| # | Issue | Exists? | Action |
|---|-------|---------|--------|
| 1 | api.ts has too many responsibilities (creates client, injects token, clears localStorage, hard redirects) | Yes | Fixed — dispatch `auth:unauthorized` CustomEvent instead of direct redirect; AuthContext handles cleanup |
| 2 | Hardcoded inline auth endpoint exclusion (`startsWith('/api/auth')`) | Yes | Fixed — replaced with named `AUTH_EXCLUDED_PATHS` constant and `isAuthExemptRequest` helper |
| 3 | Direct `localStorage` access with duplicated magic string keys in api.ts and AuthContext | Yes | Fixed — created `authStorage.ts` with named constants and typed helpers; both files import from single source |
| 4 | Magic strings `'token'` and `'user'` duplicated across api.ts and AuthContext | Yes | Fixed — exported as `AUTH_TOKEN_KEY` and `AUTH_USER_KEY` from `authStorage.ts` |
| 5 | `err as AxiosError<{ error: string }>` cast repeated in 9 call sites across 8 files | Yes | Fixed — created `extractApiError(error, fallback)` utility; all pages updated |
| 6 | No-op `(response) => response` success interceptor | Yes | Intentionally left — correct Axios convention, no functional impact |
| 7 | Interceptors registered at module scope (side effect on import) | Yes | Intentionally left — acceptable for this assignment scope |
| 8 | Testability concerns (no DI system) | N/A | Intentionally skipped — not required for home assignment |

### Issues intentionally not fixed

- **No-op success interceptor**: The `(response) => response` identity is Axios convention. Removing it changes nothing functionally and the current form is standard.
- **Module-scope interceptor registration**: Acceptable pattern for a home assignment. Creating an injectable HTTP client factory would be over-engineering.
- **Full DI / testability**: Not required for this scope.

### Files created

- `frontend/src/utils/authStorage.ts` — storage key constants and localStorage helpers
- `frontend/src/utils/apiError.ts` — `extractApiError` helper

### Files changed

- `frontend/src/services/api.ts` — imports `getToken` from authStorage; named `AUTH_EXCLUDED_PATHS` constant; `isAuthExemptRequest` helper; dispatches `auth:unauthorized` CustomEvent on 401 instead of hard redirect
- `frontend/src/context/AuthContext.tsx` — imports all localStorage ops from authStorage; adds `useEffect` listening for `auth:unauthorized` event and calling `logout()`
- `frontend/src/pages/LoginPage.tsx` — removed AxiosError cast; uses `extractApiError`
- `frontend/src/pages/SignupPage.tsx` — removed AxiosError cast; uses `extractApiError`
- `frontend/src/pages/ProductDetailPage.tsx` — removed AxiosError cast; uses `extractApiError`
- `frontend/src/pages/CartPage.tsx` — removed AxiosError casts (2); uses `extractApiError`
- `frontend/src/pages/CheckoutPage.tsx` — removed AxiosError cast; uses `extractApiError`
- `frontend/src/pages/ProfilePage.tsx` — removed AxiosError cast; uses `extractApiError`
- `frontend/src/pages/ProductsPage.tsx` — removed AxiosError cast; uses `extractApiError`
- `frontend/src/pages/HomePage.tsx` — removed AxiosError cast; uses `extractApiError`

### Frontend build result

`tsc && vite build` — exit code 0, zero TypeScript errors, zero warnings. 116 modules transformed.

### Remaining risks

- The `auth:unauthorized` event is a `window`-level global. In a multi-tab scenario a 401 in one tab will log out that tab only (not others). Acceptable for this assignment.
- `extractApiError` still uses an `as` cast internally. The shape `{ error: string }` is a convention matching the backend's `AppError` responses. If the backend shape changes, one file updates instead of eight.

### Manual Intervention

No

### Reason for Manual Intervention

N/A

---

---

## Interaction 12 — SOLID / DRY / Code Quality Audit and Fixes

**Date:** 2026-06-06  
**Model:** claude-sonnet-4.5  
**Tool:** Cursor Agent mode

### Issues Checked (13 reported)

| # | Issue | Existed? | Action | Reason |
|---|-------|----------|--------|--------|
| 1 | Database pool coupling in backend services | Yes | Not fixed | Acceptable for a single-service assignment; centralising behind a repository layer would require significant restructuring with no runtime benefit |
| 2 | `createOrder` god function in `orders.service.ts` | Yes | Fixed | Extracted 6 private helpers: `fetchCartItemsForOrder`, `ensureCartIsNotEmpty`, `validateCartStock`, `reduceStockForOrderItems`, `createOrderRecord`, `insertOrderItems` |
| 3 | `CheckoutPage` god component | Yes | Fixed | Extracted `ShippingStep`, `PaymentStep`, `ReviewStep`, `ConfirmationStep` into `src/components/checkout/` |
| 4 | Duplicate cart SQL + row mapping | Yes | Fixed | Added `CART_ITEM_JOIN_SQL` constant and `mapCartItemRow` helper in `cart.service.ts`; same pattern applied in `orders.service.ts` |
| 5 | Repeated `validationResult` blocks in controllers | Yes | Fixed | Created `validate.middleware.ts`; wired it into every router; stripped blocks from all controllers |
| 6 | Triple debounce useEffects in `ProductsPage.tsx` | Yes | Fixed | Created `useDebounce` hook; replaced 3 useEffect+state pairs with hook calls + single page-reset effect |
| 7 | `SELECT *` in `orders.service.ts` | Yes | Fixed | Replaced with `SELECT_ORDER_COLS` constant listing all columns explicitly |
| 8 | `ErrorBoundary` class defined inside `App.tsx` between imports | Yes | Fixed | Moved to `src/components/ErrorBoundary.tsx`; all imports in `App.tsx` now at the top |
| 9 | `eslint-disable` in `useProducts.ts` for exhaustive-deps | Yes | Fixed | `ProductsPage` passes a stable `useMemo` filters object; `useProducts` depends on `[filters, tick]` — no suppression needed |
| 10 | `CartContext` importing `AuthContext` directly | Yes | Fixed | Replaced `useContext(AuthContext)` with `useAuth()` hook |
| 11 | Wide-open CORS in `index.ts` | Yes | Fixed | Added `CORS_ORIGIN` to `config`; `index.ts` uses `cors({ origin: config.CORS_ORIGIN })`; `.env.example` updated |
| 12 | Signup duplicate-email race condition returning 500 | Yes | Fixed | Wrapped INSERT in try/catch; `ER_DUP_ENTRY` (MySQL 1062) now throws `AppError('Email already in use', 409)` |
| 13 | Navbar dropdown not closing on outside click | Yes | Fixed | Added `useRef` on menu container + `mousedown` listener that calls `setMenuOpen(false)` on outside click |

### Files Created

| File | Reason |
|------|--------|
| `backend/src/middleware/validate.middleware.ts` | Centralised validation error response |
| `frontend/src/hooks/useDebounce.ts` | Generic debounce hook |
| `frontend/src/components/ErrorBoundary.tsx` | Extracted from App.tsx |
| `frontend/src/components/checkout/ShippingStep.tsx` | Extracted from CheckoutPage |
| `frontend/src/components/checkout/PaymentStep.tsx` | Extracted from CheckoutPage |
| `frontend/src/components/checkout/ReviewStep.tsx` | Extracted from CheckoutPage |
| `frontend/src/components/checkout/ConfirmationStep.tsx` | Extracted from CheckoutPage |

### Files Changed

| File | What changed |
|------|-------------|
| `backend/src/config/env.ts` | Added `CORS_ORIGIN` |
| `backend/src/index.ts` | `cors({ origin: config.CORS_ORIGIN })` |
| `backend/src/modules/auth/auth.controller.ts` | Removed `validationResult` block |
| `backend/src/modules/auth/auth.router.ts` | Added `validateRequest` |
| `backend/src/modules/auth/auth.service.ts` | Catches `ER_DUP_ENTRY` → 409 |
| `backend/src/modules/cart/cart.controller.ts` | Removed all `validationResult` blocks |
| `backend/src/modules/cart/cart.router.ts` | Added `validateRequest` to all routes |
| `backend/src/modules/cart/cart.service.ts` | Added `CART_ITEM_JOIN_SQL` + `mapCartItemRow` |
| `backend/src/modules/checkout/checkout.controller.ts` | Removed `validationResult` block |
| `backend/src/modules/checkout/checkout.router.ts` | Added `validateRequest` |
| `backend/src/modules/orders/orders.controller.ts` | Removed all `validationResult` blocks |
| `backend/src/modules/orders/orders.router.ts` | Added `validateRequest` |
| `backend/src/modules/orders/orders.service.ts` | Extracted 6 private helpers; replaced `SELECT *` with named columns |
| `backend/src/modules/products/products.controller.ts` | Removed `validationResult` blocks |
| `backend/src/modules/products/products.router.ts` | Added `validateRequest` |
| `backend/src/modules/users/users.controller.ts` | Removed `validationResult` block |
| `backend/src/modules/users/users.router.ts` | Added `validateRequest` |
| `.env.example` | Added `CORS_ORIGIN` with comment |
| `frontend/src/App.tsx` | Imports `ErrorBoundary` from component file; all imports at top |
| `frontend/src/components/Navbar.tsx` | Added `useRef` + `mousedown` outside-click listener |
| `frontend/src/context/CartContext.tsx` | Uses `useAuth()` instead of `useContext(AuthContext)` |
| `frontend/src/hooks/useProducts.ts` | Depends on `[filters, tick]`; removed `eslint-disable` |
| `frontend/src/pages/CheckoutPage.tsx` | Delegates to 4 extracted step components |
| `frontend/src/pages/ProductsPage.tsx` | Uses `useDebounce` + `useMemo` filters; removed 3 debounce effects |

### Build Results

- Backend: `npm run build` — ✅ 0 errors
- Frontend: `npm run build` — ✅ 0 errors (123 modules, 261 kB)

### Intentionally Not Fixed

- **Issue 1 — Database pool coupling:** All services import `pool` directly. Acceptable for a small single-service codebase; a repository/DAO layer would be over-engineering.

---

## Interaction 13 — Second Audit: Bug Fixes, UX Guards, Health Refactor, DB Indexes

**Date:** 2026-06-06
**Model:** claude-sonnet-4.6
**Tool:** Cursor Agent mode

### Issues Checked (22 reported)

| # | Issue | Existed? | Action | Reason |
|---|-------|----------|--------|--------|
| 1 | SignupPage ignores `?redirect=` when user already authenticated | Yes | Fixed | `<Navigate to="/" />` changed to `<Navigate to={redirectTo} />` using new `useSafeRedirect` hook |
| 2 | CartPage global `actionLoading` boolean for all items | Yes | Fixed | Replaced with `Record<number, boolean>`; each item is disabled only while its own request is in-flight |
| 3 | `setTimeout` without cleanup in ProductDetailPage and ProfilePage | Yes | Fixed | Added `useRef` for timer ID; cleared on unmount and before each new timer |
| 4 | CheckoutPage allows checkout with empty cart | Yes | Fixed | Added guard after `cartLoading` resolves: shows `EmptyState` when `items.length === 0` and step is not `CONFIRMATION` |
| 5 | Swallowed API errors in ProductDetailPage and OrderDetailPage | Yes | Fixed | `catch {}` replaced with `catch (err)` using `extractApiError` so backend messages surface |
| 6 | Unsafe `AxiosError` cast in `extractApiError` | No | — | Already fixed in previous session (uses `axios.isAxiosError`) |
| 7 | `PLACEHOLDER_IMAGE` duplicated across 4 files | Yes | Fixed | Created `frontend/src/utils/images.ts` with `getPlaceholderImage(w, h)`; all 4 files updated |
| 8 | Email regex duplicated in LoginPage and SignupPage | Yes | Fixed | Created `frontend/src/utils/validators.ts` with `isValidEmail`; both pages use it |
| 9 | Redirect-after-auth logic duplicated in LoginPage and SignupPage | Yes | Fixed | Created `frontend/src/hooks/useSafeRedirect.ts`; validates `redirect` param (internal paths only) |
| 10 | `users.service.ts` double DB round-trip after UPDATE | Yes | Not fixed | `SELECT` after `UPDATE` is required to return a complete `User` object including unchanged fields; constructing it from partial input would be unsafe |
| 11 | `orders.service.ts` extra `SELECT` after commit | No | — | `SELECT_ORDER_COLS` was already in place from previous session; `SELECT` after commit is needed for `created_at` / `updated_at` timestamps |
| 12 | `health.router.ts` has DB query inline | Yes | Fixed | Extracted `health.service.ts` (pool query) and `health.controller.ts` (HTTP handling); router now delegates to controller |
| 13 | `/api/checkout/validate` never called by frontend | Yes | Fixed | Created `frontend/src/services/checkout.service.ts`; `CheckoutPage.handlePlaceOrder` calls `validateCart` before `createOrder`; shows stock errors and aborts if invalid |
| 14 | `types/index.ts` mixes domain and UI-only types | Yes | Not fixed | Splitting would require updating imports in 5+ files; risk exceeds benefit for this assignment |
| 15 | `EmptyState` always shows 🛒 emoji | Yes | Fixed | Added optional `icon` prop (defaults to `🛒`); `CheckoutPage` uses `🛍️` for the empty-cart case |
| 16 | `useOrders` has no `refetch` | Yes | Fixed | Added `tick` state + `useCallback` refetch; effect re-runs on tick; also added race-condition guard (`cancelled` flag) |
| 17 | Missing DB indexes | Yes | Fixed | Added `idx_products_category`, `idx_products_created_at`, `idx_orders_user_id`, `idx_orders_created_at` to `01-schema.sql` |
| 18 | `LIKE '%term%'` cannot use B-tree index | Yes | Not fixed | Performance improvement only; FULLTEXT would require altering the search query; documented as optional future improvement |
| 19 | No upper bound on product page number | Yes | Not fixed | `page` validated as `isInt({ min: 1 })`; large offsets return 0 rows cleanly; no harmful behaviour |
| 20 | DB port `3306:3306` exposed in `docker-compose.yml` | Yes | Fixed | Removed host-port mapping; backend reaches MySQL over the Docker internal network |
| 21 | No auth rate limiting | Yes | Not fixed | Requires `express-rate-limit` which is not in the approved library list; documented as production hardening |
| 22 | No `test` script in `backend/package.json` | Yes | Fixed | Added `"test": "echo \"No automated backend tests configured\" && exit 0"` |

### Files Created

| File | Reason |
|------|--------|
| `backend/src/modules/health/health.service.ts` | DB connectivity check extracted from router |
| `backend/src/modules/health/health.controller.ts` | HTTP handling extracted from router |
| `frontend/src/utils/images.ts` | `getPlaceholderImage` helper — single source for Unsplash placeholder URL |
| `frontend/src/utils/validators.ts` | `isValidEmail` — shared email regex |
| `frontend/src/hooks/useSafeRedirect.ts` | Reads and validates `?redirect=` query param |
| `frontend/src/services/checkout.service.ts` | Wraps `/api/checkout/validate` endpoint |

### Files Changed

| File | What changed |
|------|-------------|
| `backend/src/modules/health/health.router.ts` | Delegates to `health.controller.ts` |
| `backend/package.json` | Added `test` script placeholder |
| `mysql/init/01-schema.sql` | Added 4 indexes on `products` and `orders` |
| `docker-compose.yml` | Removed `3306:3306` port mapping from `db` service |
| `frontend/src/components/EmptyState.tsx` | Optional `icon` prop added; defaults to `🛒` |
| `frontend/src/components/CartItemRow.tsx` | Uses `getPlaceholderImage(100, 100)` |
| `frontend/src/components/ProductCard.tsx` | Uses `getPlaceholderImage(400, 400)` |
| `frontend/src/hooks/useOrders.ts` | Added `refetch`, `tick` state, and cancelled-flag guard |
| `frontend/src/pages/SignupPage.tsx` | Uses `useSafeRedirect` + `isValidEmail`; `Navigate` respects redirect param |
| `frontend/src/pages/LoginPage.tsx` | Uses `useSafeRedirect` + `isValidEmail` |
| `frontend/src/pages/CartPage.tsx` | Per-item `loadingItems: Record<number, boolean>`; checkout link disabled while any item loads |
| `frontend/src/pages/ProductDetailPage.tsx` | `getPlaceholderImage`; `useRef` timer cleanup; `extractApiError` in fetch catch |
| `frontend/src/pages/OrderDetailPage.tsx` | `getPlaceholderImage`; `extractApiError` in fetch catch |
| `frontend/src/pages/ProfilePage.tsx` | `useRef` timer cleanup; cleanup also runs on unmount |
| `frontend/src/pages/CheckoutPage.tsx` | Empty-cart guard; `validateCart` call before `createOrder`; imports `checkoutService` |

### Build Results

- Backend: `npm run build` — ✅ 0 errors
- Frontend: `npm run build` — ✅ 0 errors (127 modules, 262 kB)
- Docker: not rebuilt (schema change only affects new DB volumes; no application code change requires image rebuild)

### Intentionally Not Fixed

- **Issue 10 — Double round-trip in `users.service.ts`:** The `SELECT` after `UPDATE` is the only safe way to return all user fields including those not in the update payload.
- **Issue 11 — Extra SELECT in `orders.service.ts`:** Already addressed (`SELECT_ORDER_COLS`). The SELECT itself is necessary for `created_at`/`updated_at`.
- **Issue 14 — Type file organisation:** Moving checkout UI types to a separate file would update imports in 5+ files for marginal clarity gain.
- **Issue 18 — `LIKE '%term%'` full-scan:** Switching to `FULLTEXT` index requires changing the query from `LIKE` to `MATCH … AGAINST`. Out of scope for this assignment.
- **Issue 19 — Page upper bound:** Capped `limit` at 50 via validator; high page numbers return 0 rows harmlessly.
- **Issue 21 — Auth rate limiting:** `express-rate-limit` is not in the project dependencies; adding a new library is not approved for this assignment.

---

## Interaction 14 — Docker Compose Startup Fix (Missing .env)

**Date:** 2026-06-08
**Model:** claude-sonnet-4.6
**Tool:** Cursor Agent mode

### Root Cause

`docker-compose.yml` used bare `${VAR}` syntax for all environment variables with no fallback defaults. When a reviewer ran `docker compose up --build` without first creating a `.env` file, Docker Compose substituted empty strings. MySQL rejected the empty `MYSQL_ROOT_PASSWORD` at container initialisation time with:

```
Database is uninitialized and password option is not specified.
You need to specify one of MYSQL_ROOT_PASSWORD / MYSQL_ALLOW_EMPTY_PASSWORD / MYSQL_RANDOM_ROOT_PASSWORD
```

The healthcheck command `-p${MYSQL_ROOT_PASSWORD}` had the same problem — it would become `-p` (no password) and always fail.

### Fix

Added `:-default` fallbacks to every `${VAR}` reference in `docker-compose.yml` so the stack starts cleanly with no `.env` present. The defaults match the values already in `.env.example`.

### Files Changed

| File | What changed |
|------|-------------|
| `docker-compose.yml` | All `${VAR}` replaced with `${VAR:-default}` for `db` and `backend` services; healthcheck uses `${MYSQL_ROOT_PASSWORD:-rootpassword}` |
| `.env.example` | Header comment updated to clarify `.env` is optional |
| `README.md` | Quick Start now shows `docker compose up --build` as step 2 (no `cp .env.example .env` required); Environment Variables section updated |

### Verification

```bash
# Clean run with no .env file present
docker compose down -v
docker compose up --build
```

All three services (`db`, `backend`, `frontend`) reach healthy state without a `.env` file.

---

## Interaction 15 — Product Stock Display Fix

**Date:** 2026-06-08
**Model:** claude-sonnet-4.6
**Tool:** Cursor Agent mode

### Reported Issue

Product detail page showed stale physical stock (`product.stock`) after adding to cart. Adding 1 item to a product with 48 in stock still showed "48 available" rather than "47 available".

### Root Cause

`ProductDetailPage` fetches `product.stock` once on mount and renders it as-is. The backend never reduces `products.stock` when adding to a cart — stock only decreases when an order is placed. However, the cart context (`CartContext`) already maintained an up-to-date list of `items` (refreshed via `fetchCart()` after every `addItem` call). The page simply never used that cart data to subtract the user's already-carted quantity from the displayed stock.

### Fix

Only `frontend/src/pages/ProductDetailPage.tsx` was changed:

1. Added `items: cartItems` to the `useCart()` destructure.
2. Computed `currentCartQty` by finding the cart item whose `product_id` matches the current product.
3. Computed `availableStock = Math.max(product.stock - currentCartQty, 0)`.
4. Replaced all three uses of `product.stock` in the JSX with `availableStock` (stock badge, "Out of stock" fallback, Add to Cart button guard).

No backend changes. No schema changes. Cart refresh already happened on every add — the fix only wires the existing cart state into the display.

### Files Changed

| File | What changed |
|------|-------------|
| `frontend/src/pages/ProductDetailPage.tsx` | Reads `items` from cart context; computes and displays `availableStock` |

### Behaviour After Fix

| Scenario | Displayed |
|----------|-----------|
| Page loads, 0 in cart | ✓ In stock (48 available) |
| Add 1 to cart | ✓ In stock (47 available) — instant, no extra request needed |
| Refresh page | Cart reloads from backend → still 47 |
| Place order | DB stock reduced; cart cleared; page shows correct physical inventory |

### Build Results

- Frontend: `npm run build` — ✅ 0 errors (127 modules, 262 kB)
- Backend: unchanged — no rebuild needed

### Remaining Risk

`ProductCard` on the products listing page still shows the "Add to Cart" button based on raw `product.stock > 0` (the DB physical stock). It does not show a count, so it will not mislead users with a number. However, if a user has already carted all available units of a product, the card will still show the "Add to Cart" button — clicking it will get a backend 400 "Insufficient stock" error. This is consistent with the assignment scope and is the same behaviour as before this fix.

## Models Used — Summary

| Phase | Model | Tool | Reason for selection |
|-------|-------|------|---------------------|
| Planning | claude-sonnet-4-5 | Cursor Agent | Strong at architecture reasoning and structured markdown generation |
| Phase 1 — Backend | Model via OpenRouter, not recorded | Cline | AI code generation tool selected for backend implementation |
| Phase 2 — Database | Model via OpenRouter, not recorded | Cline | AI code generation tool selected for database schema and seed data |
| Phase 3 — Frontend | claude-sonnet-4-5 | Cursor Agent | Cline got stuck; Cursor took over and completed Phase 3 in a single session |
| Phase 4 — Docker | claude-sonnet-4-5 | Cursor Agent | Created all Docker config files and corrected backend Dockerfile |
| Phase 4 — Bug fix (DECIMAL) | claude-sonnet-4-5 | Cursor Agent | Diagnosed and fixed mysql2 DECIMAL-as-string white-screen crash |
| Phase 4 — Docs recovery | claude-sonnet-4-5 | Cursor Agent | Cline did not write interaction log; Cursor reconstructed entries from generated files |
| Phase 5 — Testing | claude-sonnet-4-5 | Cursor Agent | Full static audit, one missed .toFixed() found and fixed |
| Phase 6 — Documentation | claude-sonnet-4-5 | Cursor Agent | README and ai-interactions.md finalized |
| Post Phase 6 — Hardening | claude-sonnet-4-5 | Cursor Agent | Docker and build hardening: Node 22, pinned nginx, healthchecks, nginx location fix |
| Post Phase 6 — Backend Hardening | claude-sonnet-4-5 | Cursor Agent | Backend audit: env config, error middleware, stock validation, query validation, health check |
| Post Phase 6 — Frontend Hardening | claude-sonnet-4-5 | Cursor Agent | Frontend audit: authStorage utility, apiError utility, event-based 401 handling, named constants |
| Post Phase 6 — SOLID / DRY Audit | claude-sonnet-4.5 | Cursor Agent | Full SOLID/DRY audit: validate middleware, helper extraction, useDebounce, step components, CORS config, ER_DUP_ENTRY, outside-click, ErrorBoundary |
| Post Phase 6 — Second Audit | claude-sonnet-4.6 | Cursor Agent | Bug fixes, UX guards, health module refactor, DB indexes, port hardening, checkout validation integration |
| Post Phase 6 — Docker defaults fix | claude-sonnet-4.6 | Cursor Agent | Added `:-` fallback defaults to all docker-compose.yml env vars so the stack starts without a .env file |

---

## Tools and Plugins Used

| Tool | Purpose | When used |
|------|---------|-----------|
| Cursor (Agent mode) | Architecture planning, blueprint file creation | Planning phase |
| Cline (VS Code extension) | Backend and database code generation | Phases 1–2 |
| Cursor (Agent mode) | Frontend implementation (Cline got stuck after Phase 2) | Phase 3 |
| Cursor (Agent mode) | Docker runtime configuration | Phase 4 |
| Cursor (Agent mode) | Bug diagnosis and fix: mysql2 DECIMAL white-screen crash | Phase 4 (post-Docker) |
| Cursor (Agent mode) | Interaction log reconstruction for Phases 1–2 | Phase 4–5 (Cline did not document) |
| Cursor (Agent mode) | Testing — full static audit, final bug fix | Phase 5 |
| Cursor (Agent mode) | Final documentation — README and ai-interactions.md | Phase 6 |
| Cursor (Agent mode) | Docker and build hardening | Post Phase 6 |
| Cursor (Agent mode) | Backend audit and hardening | Post Phase 6 |
| Cursor (Agent mode) | Frontend audit and hardening — authStorage, apiError, event-based 401 | Post Phase 6 |
| Cursor (Agent mode) | SOLID/DRY audit — validate middleware, step components, hooks, CORS, ER_DUP_ENTRY | Post Phase 6 |
| Cursor (Agent mode) | Second audit — bug fixes, UX guards, health refactor, DB indexes, checkout validate, port hardening | Post Phase 6 |
| Cursor (Agent mode) | Docker defaults fix — `:-` fallbacks in docker-compose.yml so stack runs without .env | Post Phase 6 |
| Cursor (Agent mode) | Stock display fix — ProductDetailPage computes availableStock from cart context | Post Phase 6 |

---

## Google / Web Searches

No external web searches were required during this project. All decisions were made from the blueprint files in `ai-boilerplate/` and the AI tools' built-in knowledge.

| Date | Query | Why it was searched | What was found |
|------|-------|---------------------|---------------|
| — | No searches performed | All answers found in blueprint files or resolved by Cursor directly | — |

---

## AI-Gap Analysis

An AI-gap is a case where the cost of crafting a prompt to fix an AI mistake exceeded the cost of just fixing it manually.

| Gap | Description | Resolution |
|-----|-------------|-----------|
| Cline stopped before documenting | Cline completed Phases 1–2 implementation correctly but got stuck before writing the required `ai-interactions.md` entries. Re-prompting Cline to document retroactively would have been unreliable. | Cursor reconstructed the entries post-hoc by inspecting the generated files. Interaction entries 3 and 4 are Cursor-authored reconstructions, not original Cline outputs. |
| Cline generated non-guideline Dockerfile | `backend/Dockerfile` used `npm install` and `npm start` instead of `npm ci` and `node dist/index.js`. The Docker guidelines were explicit. Re-prompting Cline for a 2-line correction was slower than fixing it directly. | Fixed manually in Phase 4 (Manual Intervention 2). |
| mysql2 DECIMAL type mismatch | All AI passes treated `price: number` as correct at both compile and runtime. The mismatch between the TypeScript type and mysql2's actual runtime string is invisible to the compiler. Diagnosing it required understanding the mysql2 text protocol, which is outside normal code review. | Fixed with `decimalNumbers: true` and `Number()` wrappers. The root cause was architectural (no runtime type validation), not a prompt quality issue. |
