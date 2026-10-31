# Injibara Market — Docker & Containerization Guide

## 1. Overview & Topology

The Docker configuration guarantees that developers and automated CI pipelines run against an identical MySQL 8.0 database and Node.js 20 environment regardless of their host operating system.

```mermaid
graph TD
    Compose["docker-compose.yml"] --> MySQL["injibara-mysql (MySQL 8.0)<br/>Port: 3307:3306<br/>Volume: mysql_data"]
    Compose --> API["injibara-api (Hono Backend)<br/>Port: 3000:3000<br/>Depends on: mysql (healthy)"]
    Compose --> Client["injibara-client (Vite Frontend)<br/>Port: 5173:5173<br/>Depends on: api"]
```

---

## 2. Port Mappings & Services

| Service | Container Name | Host Port | Container Port | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`mysql`** | `injibara-mysql` | `3307` | `3306` | MySQL 8.0 database engine (avoids conflict with local port 3306). |
| **`api`** | `injibara-api` | `3000` | `3000` | Backend API container. |
| **`client`** | `injibara-client` | `5173` | `5173` | Frontend Vite development server. |

---

## 3. Recommended Usage

### Option A: Local Database Only (Recommended for Fast Hot-Reloading)
Running MySQL in Docker while running the frontend and backend directly with Node/Wrangler provides the fastest development feedback loop:

```bash
# 1. Start the MySQL container in the background
docker compose up -d mysql

# 2. Check health status
docker compose ps

# 3. Run migrations
cd server && npx prisma db push && cd ..

# 4. Start frontend and backend natively
npm run dev
```

### Option B: Full Containerized Stack
To spin up the entire application stack inside Docker:

```bash
# Start all services with automated builds
docker compose up --build

# Stop all services
docker compose down

# Stop and wipe database volume (clean reset)
docker compose down -v
```

---

## 4. Environment Variables for Docker

The following defaults are defined in `docker-compose.yml` and can be overridden via `.env`:

```env
DB_ROOT_PASSWORD=rootpassword
DB_NAME=injibara_db
DB_USER=injibara_user
DB_PASSWORD=injibara_password
```

Local connection string:
```
DATABASE_URL="mysql://injibara_user:injibara_password@localhost:3307/injibara_db"
```
