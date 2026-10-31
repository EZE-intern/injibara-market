# Injibara Market (እንጂባራ ገበያ)

[![CI Pipeline](https://github.com/eyosimak/injibara-market/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/eyosimak/injibara-market/actions)
![Node.js Version](https://img.shields.io/badge/Node.js-20+-green.svg)
![React Version](https://img.shields.io/badge/React-19-blue.svg)
![Backend Framework](https://img.shields.io/badge/Hono-v4-E36002.svg)
![Edge Runtime](https://img.shields.io/badge/Cloudflare-Workers-F38020.svg)
![Database](https://img.shields.io/badge/TiDB-Serverless-0052CC.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

A modern, high-performance digital commerce and brokered marketplace platform designed specifically for **Injibara city** and the surrounding **Awi Administrative Zone** in the Amhara Region of Ethiopia.

---

## 🌟 The Core Innovation: The Two-Tier Brokered System

In regional Ethiopian markets, high-value assets cannot safely transact via anonymous online peer-to-peer messaging due to title deed disputes and lack of physical verification. Conversely, everyday consumer goods require immediate, direct communication without administrative bottlenecks.

Injibara Market solves this through a programmatic **Two-Tier Model**:

1. **Tier 1: High-Capital Brokered Deals (Property, Vehicles, Heavy Machinery)**
   * Buyer inquiries are automatically intercepted by the routing engine and dispatched to the **Admin Broker Desk** (`/admin/broker-hub`).
   * The platform administrator mediates price negotiation, schedules on-site inspections, verifies legal documentation (Kebele title deeds, vehicle logbooks), and coordinates offline deal closing.
2. **Tier 2: Direct Consumer Goods (Teff, Livestock, Electronics, Fashion, Groceries)**
   * Buyers connect directly with local sellers through in-app chat (`/messages/chat/:productId`) for local store pickup or physical meetup at Injibara Central Market.

---

## 🛠️ Modern Architecture & Tech Stack

| Layer | Technologies | Hosting / Infrastructure |
| :--- | :--- | :--- |
| **Frontend SPA** | React 19, TypeScript, Vite, React Router v7, Tailwind CSS v4, Lucide Icons | Vercel Global Edge CDN |
| **Backend Edge API**| Hono v4, TypeScript, WebCrypto PBKDF2, Jose (JWT), Zod | Cloudflare Workers Edge Network |
| **Data Layer** | TiDB Cloud Serverless (Distributed MySQL 8.0), Prisma ORM | AWS Frankfurt (`eu-central-1`) |
| **Media Pipeline** | Signed REST Uploads, Format Auto-Optimization | Cloudinary Edge CDN |
| **Identity / SSO** | WorkOS AuthKit, OAuth 2.0, WebCrypto PBKDF2 Password Hashing | WorkOS Cloud |
| **Local Dev / CI** | Docker Compose (MySQL 8.0), GitHub Actions CI/CD, Vitest | Local / GitHub Runners |

---

## 📂 Monorepo Structure

```
injibara-market/
├── client/                     # Frontend Single Page Application (React 19 + Vite)
│   ├── src/
│   │   ├── api/                # Centralized Axios client & API resource modules
│   │   ├── components/         # Modular UI (customer, seller, admin, common)
│   │   ├── context/            # ThemeContext (Dark/Light Mode)
│   │   ├── pages/              # Lazy-loaded page components (code-split)
│   │   ├── routes/             # AppRoutes, ProtectedRoute, ProtectedAdminRoute
│   │   └── utils/              # Auth storage, saved storage, category patterns
│   └── package.json
│
├── server/                     # Backend Edge API Microservice (Hono + Prisma)
│   ├── prisma/
│   │   └── schema.prisma       # Relational database schema
│   ├── src/
│   │   ├── controllers/        # Business logic handlers (auth, products, admin, etc.)
│   │   ├── lib/                # PrismaTiDBCloud adapter, Cloudinary, WorkOS
│   │   ├── middleware/         # Edge JWT verification, RBAC, sliding-window rate limit
│   │   ├── routes/             # Modular Hono route definitions
│   │   ├── utils/              # WebCrypto PBKDF2, in-memory TTL cache, category regex
│   │   └── worker.ts           # Global Hono entry point & request pipeline
│   ├── wrangler.jsonc          # Cloudflare Workers configuration
│   └── package.json
│
├── docker/                     # Container definitions & Docker Compose guides
│   ├── README.md
│   └── api.Dockerfile
│
├── docs/                       # Comprehensive Architecture & Technical Specifications
│   ├── ARCHITECTURE.md         # Master technical architecture & request lifecycle
│   ├── BUSINESS_MODEL.md       # Two-Tier domain logic, monetization & regional dynamics
│   ├── API_REFERENCE.md        # Complete OpenAPI-style API specification
│   └── DEPLOYMENT_GUIDE.md     # Production deployment, Cloudflare, Vercel & TiDB setup
│
├── docker-compose.yml          # Local MySQL development service
├── package.json                # Monorepo workspaces & build orchestration
└── wrangler.jsonc              # Root Cloudflare Wrangler configuration
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Node.js:** `v20.x` or higher
* **npm:** `v10.x` or higher
* **Docker & Docker Compose:** Installed and running (for local database)
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/eyosimak/injibara-market.git
cd injibara-market
```

### 2. Install Monorepo Dependencies
```bash
npm install
```

### 3. Start Local MySQL Database
```bash
# Starts local MySQL 8.0 container on port 3307
docker compose up -d mysql

# Verify database health
docker compose ps
```

### 4. Setup Environment Variables
Create `.env` in the project root (or within `server/.env` and `client/.env`):

```env
# Database Credentials
DATABASE_URL="mysql://injibara_user:injibara_password@localhost:3307/injibara_db"
DATABASE_URL_MYSQL="mysql://injibara_user:injibara_password@localhost:3307/injibara_db"

# Security
JWT_SECRET="your_development_jwt_secret_key"
INITIAL_ADMIN_EMAILS="admin@injibaramarket.com,seberbel@gmail.com"

# Cloudinary (Media Hosting)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Frontend Configuration (client/.env)
VITE_API_BASE_URL="http://localhost:5000/api"
```

### 5. Generate Prisma Client & Run Database Migrations
```bash
cd server
npx prisma generate
npx prisma db push

# (Optional) Seed initial Injibara marketplace categories
npx tsx src/utils/seedCategories.ts
cd ..
```

### 6. Start Development Servers
Run frontend and backend concurrently from the root directory:
```bash
npm run dev
```
Or start each service individually:
```bash
# Terminal 1: Backend API (Cloudflare Wrangler Worker)
npm run dev:server

# Terminal 2: Frontend Client (Vite Dev Server)
npm run dev:client
```

* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:8787` (Wrangler) or `http://localhost:5000` (Docker proxy)
* **Local Database:** `localhost:3307`

---

## 📜 Monorepo Scripts Reference

| Command | Workspace | Description |
| :--- | :--- | :--- |
| `npm run dev` | Monorepo Root | Starts both client and server development servers concurrently. |
| `npm run dev:server` | `server` | Launches backend in local Cloudflare Worker emulation via Wrangler. |
| `npm run dev:client` | `client` | Starts Vite hot-reloading dev server for the React 19 client. |
| `npm run build` | Monorepo Root | Compiles TypeScript and runs production builds for all workspaces. |
| `npm run test` | Monorepo Root | Runs automated unit and integration tests across workspaces with Vitest. |
| `npm run lint` | Monorepo Root | Executes ESLint across all TypeScript and React files. |
| `npm run deploy:server`| `server` | Deploys backend API directly to Cloudflare Workers production. |

---

## 📖 In-Depth Documentation

* 🏛️ **[Technical Architecture Guide](file:///home/eyosi/injibara-market/docs/ARCHITECTURE.md):** Detailed breakdown of Cloudflare Worker runtime, edge cryptography, TiDB Serverless connection pooling, and in-memory TTL caching.
* 💼 **[Business Model & Domain Logic](file:///home/eyosi/injibara-market/docs/BUSINESS_MODEL.md):** Deep dive into the Two-Tier Broker operational model, regional commerce trust dynamics, monetization phases, and physical offline escrow.
* 📡 **[API Reference & Specification](file:///home/eyosi/injibara-market/docs/API_REFERENCE.md):** Complete OpenAPI-style reference covering every endpoint, request parameter, status code, and Zod validation schema.
* 🚢 **[Deployment & DevOps Guide](file:///home/eyosi/injibara-market/docs/DEPLOYMENT_GUIDE.md):** Step-by-step instructions for deploying to Cloudflare Workers, Vercel Edge, TiDB Cloud, and GitHub Actions CI pipelines.

---

## 📄 License
ISC License &copy; 2026 Injibara Market Development Team.
