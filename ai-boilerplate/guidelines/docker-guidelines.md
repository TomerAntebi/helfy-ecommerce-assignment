# Docker Guidelines

These guidelines define Docker configuration, environment variables, Dockerfiles, and the docker-compose setup. Read `coding-standards.md` before reading this file.

---

## 1. Docker Rules

- No manual steps after `docker compose up`. Everything must be automated.
- MySQL init scripts in `mysql/init/` run automatically via `/docker-entrypoint-initdb.d/`. They execute in lexicographic order — `01-schema.sql` before `02-seed.sql`.
- Backend waits for the database health check (`condition: service_healthy`) before starting.
- **Backend must define its own Docker healthcheck** using `GET /api/health`. The health check command must use `wget` (not `curl` — `node:18-alpine` does not include curl by default):
  ```yaml
  healthcheck:
    test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4000/api/health"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 15s
  ```
- **Frontend must depend on backend with `condition: service_healthy`**, not just `condition: service_started`. This ensures the nginx proxy is not configured until the backend is confirmed ready.
- Frontend is served by nginx in production mode. No `vite dev` server in Docker.
- All environment variables are passed via `docker-compose.yml` from the `.env` file.
- Never hard-code database credentials or secrets in Dockerfiles.
- **Never require manual database operations.** Schema and seed data are fully automated through MySQL init scripts. No `mysql` shell commands, no `source` commands, no migration tools, no manual `CREATE DATABASE`. If a database operation cannot be automated via `/docker-entrypoint-initdb.d/`, it is a design error.
- Frontend Dockerfile must declare `ARG VITE_API_URL=""` and `ENV VITE_API_URL=$VITE_API_URL` before the `RUN npm run build` step. Without this, Vite cannot access the build arg and `import.meta.env.VITE_API_URL` will be `undefined` in the built bundle.

---

## 2. Environment Variables

All configuration that differs between environments lives in environment variables. No hard-coded hostnames, ports, passwords, or secrets in source code. Backend reads from `process.env`. Frontend reads from `import.meta.env` (Vite). All required variables must be documented in `.env.example` with example values.

| Variable | Description | Example |
|----------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `rootpassword` |
| `MYSQL_DATABASE` | Database name | `ecommerce` |
| `MYSQL_USER` | MySQL application user | `appuser` |
| `MYSQL_PASSWORD` | MySQL application password | `apppassword` |
| `JWT_SECRET` | Secret key for signing JWTs | `supersecretjwtkey` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `VITE_API_URL` | Frontend API base URL (empty for Docker, full URL for local dev) | `` |

---

## 3. frontend/Dockerfile

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# ARG must be declared before RUN so that Vite can read it at build time.
# ENV makes it available as import.meta.env.VITE_API_URL in the built bundle.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 4. frontend/nginx.conf

```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 5. backend/Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

---

## 6. docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      PORT: 4000
      DB_HOST: db
      DB_PORT: 3306
      DB_NAME: ${MYSQL_DATABASE}
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
    depends_on:
      db:
        condition: service_healthy
    # Use wget (available on alpine) not curl (not included in node:18-alpine)
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s
    ports:
      - "4000:4000"

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: ""
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "3000:80"

volumes:
  mysql_data:
```

Note: `VITE_API_URL` is empty string because nginx proxies `/api` to `http://backend:4000`. The Axios base URL must handle this correctly (empty string means relative requests, which nginx then proxies).

---

## 7. Phase 4 Acceptance Criteria

- `docker compose up --build` from a clean checkout completes without error
- All three services are running and healthy
- The `db` container health check passes (mysqladmin ping succeeds)
- The `backend` container health check passes (`GET /api/health` returns HTTP 200)
- The `frontend` container starts only after backend is healthy (verified by `docker compose logs` sequence)
- `http://localhost:3000` renders the frontend
- `http://localhost:3000/api/health` returns `{"status":"ok"}`
- The frontend can successfully authenticate and load products through the nginx proxy
