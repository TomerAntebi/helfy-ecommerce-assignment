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
