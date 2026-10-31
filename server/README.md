# Injibara Market — Backend Edge API Service

## 1. Overview & Architecture

The Injibara Market backend is a high-performance, edge-native REST API built with **[Hono v4](https://hono.dev)** and designed to run on **Cloudflare Workers**. 

It serves as the core orchestration layer for product listings, in-app messaging, dynamic inquiry routing, and administrator broker management.

### Key Architectural Choices

1. **Hono over Express:** Hono provides exceptional sub-millisecond cold-start times and ultra-low memory overhead on serverless edge isolates compared to traditional Express servers.
2. **WebCrypto PBKDF2 over Bcrypt:** Standard `bcrypt` relies on native C-bindings and heavy CPU cycles that exceed Cloudflare Worker CPU limits (Error 1102). The backend uses native WebCrypto PBKDF2 (`crypto.subtle`) with SHA-256 and 100,000 iterations (< 2ms CPU execution time).
3. **Jose over JsonWebToken:** Standard `jsonwebtoken` depends on legacy Node.js streams and crypto modules. `jose` is built for modern Web Standards and edge runtimes.
4. **TiDB Cloud Serverless via Fetch Adapter:** Database connections use `@tidbcloud/prisma-adapter` (`PrismaTiDBCloud`), running database queries over serverless HTTPS fetch calls rather than maintaining long-lived TCP socket pools.
5. **In-Memory TTL Caching:** `server/src/utils/cache.ts` provides an ultra-fast in-memory Map cache to serve frequently requested categories and catalog pages in < 5ms without redundant database round-trips to Frankfurt.

---

## 2. Directory Structure

```
server/
├── prisma/
│   ├── migrations/             # Database migration history
│   └── schema.prisma           # Prisma schema definition
├── src/
│   ├── controllers/            # Route business logic handlers
│   │   ├── adminController.ts  # Admin dashboard & Broker Hub operations
│   │   ├── authController.ts   # Registration, login, & user roles
│   │   ├── categoryController.ts # Category management
│   │   ├── messageController.ts # Two-tier inquiry & chat routing
│   │   ├── productController.ts # Product CRUD & image uploads
│   │   ├── storeController.ts  # Merchant store profiles
│   │   └── workosAuthController.ts # WorkOS AuthKit integration
│   ├── lib/                    # External service adapters (Prisma, Cloudinary, WorkOS)
│   ├── middleware/             # Auth token guard, RBAC, sliding rate limiter
│   ├── models/                 # Database helper models
│   ├── routes/                 # Modular Hono route declarations
│   ├── schemas/                # Zod request validation schemas
│   ├── types/                  # TypeScript context and environment interfaces
│   ├── utils/                  # Edge crypto, token generation, caching, broker patterns
│   └── worker.ts               # Global Hono entry point & request pipeline
├── tests/                      # Automated Vitest integration & unit tests
├── package.json
├── tsconfig.json
└── wrangler.jsonc              # Cloudflare Workers configuration
```

---

## 3. Environment Variables Reference

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | Serverless HTTPS URL for TiDB Cloud | `https://gateway01...tidbcloud.com/v1/sql` |
| `DATABASE_URL_MYSQL` | Yes (CLI) | MySQL connection string for Prisma CLI | `mysql://user:pass@host:4000/db?sslaccept=strict` |
| `JWT_SECRET` | Yes | Secret key for signing HS256 JWT tokens | `your-secure-256-bit-secret` |
| `INITIAL_ADMIN_EMAILS`| No | Comma-separated admin auto-assignment emails | `admin@injibaramarket.com,seberbel@gmail.com` |
| `CLOUDINARY_CLOUD_NAME`| Yes | Cloudinary cloud account identifier | `injibara-market` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary REST API access key | `123456789012345` |
| `CLOUDINARY_API_SECRET`| Yes | Cloudinary REST API secret | `abcdef123456789` |
| `WORKOS_API_KEY` | No | WorkOS API Secret Key | `sk_...` |
| `WORKOS_CLIENT_ID` | No | WorkOS Client ID | `client_...` |

---

## 4. Development & Testing Commands

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Start local development server with Wrangler
npm run dev
# Starts local Cloudflare Worker emulation at http://localhost:8787

# 5. Run automated test suite with Vitest
npm test

# 6. Build and typecheck
npm run build

# 7. Deploy to Cloudflare Workers Production
npm run deploy
```

---

## 5. Security & Rate Limiting

The backend implements IP-based rate limiting via `server/src/middleware/rateLimiter.ts`:
* **Global API Limit:** 300 requests per 15 minutes.
* **Auth Limit:** 10 attempts per 15 minutes (protects `/api/auth/login` and `/api/auth/register`).
* **Creation Limit:** 25 requests per 15 minutes (protects `/api/products` and `/api/messages/send`).
