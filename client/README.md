# Injibara Market — Frontend Client Application

## 1. Overview & Architecture

The Injibara Market frontend is a modern, responsive Single Page Application (SPA) built with **React 19**, **TypeScript**, **React Router v7**, and **Tailwind CSS v4** bundled via **Vite**.

It delivers a clean, app-like mobile and desktop experience tailored for local commerce in Injibara, featuring dark/light themes, offline-capable bookmarks, and sub-second page loads.

### Key Architectural Features

1. **Route-Level Code Splitting:**
   * All secondary pages (admin desk, seller portal, customer dashboard) are wrapped in `React.lazy()` dynamic imports.
   * Only `HomePage.tsx` is eagerly loaded, slashing the initial bundle from ~600 KB to ~130 KB for instant first paint on 3G/4G connections.
2. **Cold-Start Resilient API Layer (`src/api/axiosClient.ts`):**
   * Automatically detects transient 502/503/504 gateway responses or network timeouts on idempotent `GET` requests and retries up to 2 times with exponential backoff.
   * Centralizes JWT authorization header injection (`Authorization: Bearer <token>`).
   * Throttles identical error toast messages within a 5-second window.
3. **Client-Side Saved Items (`src/utils/savedStorage.ts`):**
   * Bookmarked/saved products are persisted directly in `localStorage` under `injibara_market_saved_products`.
   * Triggers a custom window event (`saved_products_updated`) to synchronize bookmark badges across navigation bars and product cards with zero network latency.
4. **Adaptive Dark / Light Theming (`src/context/ThemeContext.tsx`):**
   * Full Tailwind CSS dark mode support persisted in `localStorage` (`injibara_market_theme`).
   * Syncs with the user's OS color scheme preferences by default.

---

## 2. Directory Structure

```
client/
├── public/                     # Static icons, logos, and images
├── src/
│   ├── api/                    # Centralized Axios client & API resource functions
│   │   ├── axiosClient.ts      # Axios instance, interceptors, & retry logic
│   │   ├── adminApi.ts         # Broker Hub & admin dashboard requests
│   │   ├── authApi.ts          # Login, register, & role mutations
│   │   ├── categoryApi.ts      # Public category queries
│   │   ├── messageApi.ts       # In-app chat & message sending
│   │   ├── productApi.ts       # Catalog search, filtering, & creation
│   │   └── storesApi.ts        # Merchant store profiles
│   ├── components/             # Reusable UI components
│   │   ├── admin/              # Admin dashboard layout, header, & sidebar
│   │   ├── auth/               # WorkOS AuthKit button
│   │   ├── common/             # ThemeToggle, InjibaraLogo, ErrorBoundary, VerifiedBadge
│   │   ├── customer/           # CustomerNavbar, Footer, CategoryGrid, BottomNav
│   │   └── product/            # ProductImageGallery, ProductCard
│   ├── context/                # ThemeContext (Dark/Light mode provider)
│   ├── pages/                  # Page-level route views
│   │   ├── admin/              # Admin pages (BrokerHub, Products, Stores, Users, etc.)
│   │   ├── customer/           # Customer pages (Saved, Messages, Profile, BecomeSeller)
│   │   ├── seller/             # Seller pages (AddProduct, EditProduct, Orders, Products)
│   │   ├── HomePage.tsx        # Marketplace homepage
│   │   ├── ProductsPage.tsx    # Filterable catalog search
│   │   └── ProductDetailPage.tsx # Detailed listing & Two-Tier inquiry buttons
│   ├── routes/                 # Route guards (ProtectedRoute, ProtectedAdminRoute) & AppRoutes
│   ├── types/                  # TypeScript interface declarations
│   ├── utils/                  # Auth storage, saved storage, broker category regex
│   ├── App.tsx                 # Root component with ThemeProvider
│   ├── index.css               # Tailwind CSS v4 directives
│   └── main.tsx                # React DOM entry point
├── package.json
├── tsconfig.json
└── vite.config.ts              # Vite configuration
```

---

## 3. Environment Variables Reference

Create `.env` in `client/` (or root `.env`):

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | No | Overrides backend API base URL | `http://localhost:5000/api` |

*Note: In production builds, the app automatically routes API requests to `https://injibara-market-api.inji-mark.workers.dev/api`.*

---

## 4. Development & Build Commands

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
# Starts local development server at http://localhost:5173

# 3. Run unit tests with Vitest
npm test

# 4. Check for linting errors
npm run lint

# 5. Build optimized production bundle
npm run build
# Compiles output to client/dist/
```

---

## 5. Language & Cultural Experience

* **Default Mixed Language (Hybrid Lingua Franca):** Modern Ethiopian digital commerce naturally blends English navigation with Amharic terminology (e.g. *Teff*, *Bajaj*, *Kebele*). The interface adopts this natural bilingual standard by default.
* **Full Amharic (አማርኛ) Roadmap:** The architecture includes placeholder support for complete Amharic translations across all form labels, notifications, and navigation items.
