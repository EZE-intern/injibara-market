# Injibara Market — API Reference & Specification

## 1. Global Overview & Protocol

* **Base Production URL:** `https://injibara-market-api.inji-mark.workers.dev`
* **Local Development Base URL:** `http://localhost:5000` (or `http://localhost:8787` under Wrangler)
* **API Prefix:** All API endpoints are mounted under `/api` (except health endpoints `/` and `/healthz`).
* **Content Type:** `application/json` (or `multipart/form-data` for image upload endpoints).
* **Authentication Scheme:** Standard HTTP Bearer Token:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## 2. Global Status Codes & Error Responses

| Status Code | Meaning | Typical Trigger |
| :--- | :--- | :--- |
| `200 OK` | Success | Request succeeded; returned payload in response body. |
| `201 Created` | Resource Created | Entity successfully created (User, Product, Message). |
| `400 Bad Request` | Validation Error | Missing required fields, invalid email format, negative price. |
| `401 Unauthorized` | Authentication Missing | Missing, expired, or cryptographically invalid Bearer JWT. |
| `403 Forbidden` | Access Denied | Insufficient role permissions (e.g. non-admin accessing `/api/admin`). |
| `404 Not Found` | Entity Missing | Requested product, user, or category does not exist. |
| `429 Too Many Requests`| Rate Limited | Exceeded sliding window request threshold for client IP. |
| `500 Server Error` | Unhandled Error | Database connection timeout or runtime exception. |

### Standard Error Payload
```json
{
  "success": false,
  "message": "Human-readable explanation of error.",
  "error": "Optional diagnostic or validation details"
}
```

---

## 3. Health & System Diagnostic Endpoints

### 1. Root Sanity Ping
* **Method:** `GET`
* **Path:** `/`
* **Access:** Public
* **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "message": "Injibara Market API is running smoothly"
  }
  ```

### 2. Deep Database Ping
* **Method:** `GET`
* **Path:** `/healthz`
* **Access:** Public
* **Description:** Executes a raw SQL probe (`SELECT 1`) against TiDB Serverless to verify database pool health and prevent connection cold-starts.
* **Response `200 OK`:** `OK` (plain text)

---

## 4. Authentication & Identity (`/api/auth`)

### 1. Register User
* **Method:** `POST`
* **Path:** `/api/auth/register`
* **Access:** Public (Rate Limited: 10 req / 15 min)
* **Request Body:**
  ```json
  {
    "full_name": "Abebe Bikila",
    "email": "abebe@example.com",
    "password": "SecurePassword123",
    "phone": "0911223344",
    "role": "customer"
  }
  ```
* **Validation Rules:**
  * `email`: Required, valid email format, unique in database.
  * `password`: Minimum 6 characters. Hashed using WebCrypto PBKDF2 (100,000 iterations).
  * `phone`: Optional, validated for 10-digit Ethiopian format (`09...` or `07...`).
  * `role`: Optional (defaults to `customer`). If email matches `INITIAL_ADMIN_EMAILS`, assigned `admin`.
* **Response `201 Created`:**
  ```json
  {
    "message": "Account created successfully.",
    "user": {
      "id": 14,
      "full_name": "Abebe Bikila",
      "email": "abebe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2. Login User
* **Method:** `POST`
* **Path:** `/api/auth/login`
* **Access:** Public (Rate Limited: 10 req / 15 min)
* **Request Body:**
  ```json
  {
    "email": "abebe@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "message": "Login successful.",
    "user": {
      "id": 14,
      "full_name": "Abebe Bikila",
      "email": "abebe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 3. Get WorkOS OAuth URL
* **Method:** `GET`
* **Path:** `/api/auth/workos/url`
* **Access:** Public
* **Query Parameters:**
  * `redirect_uri` *(optional)*: Override redirection URL (defaults to `https://injibara-market.vercel.app/auth/callback`).
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "authorizationUrl": "https://api.workos.com/user_management/authorize?client_id=..."
  }
  ```

### 4. WorkOS OAuth Callback
* **Method:** `POST`
* **Path:** `/api/auth/workos/callback`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "code": "01JABCDEF123456789"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "WorkOS authentication successful.",
    "user": {
      "id": 18,
      "full_name": "WorkOS User",
      "email": "user@gmail.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

### 5. Update User Role
* **Method:** `PATCH`
* **Path:** `/api/auth/users/:id/role`
* **Access:** Admin only (`protect` &rarr; `authorizeRoles('admin')`)
* **Request Body:**
  ```json
  {
    "role": "seller"
  }
  ```
* **Allowed Values:** `"customer"`, `"seller"`, `"admin"`.
* **Response `200 OK`:** Updated user object.

---

## 5. Products & Catalog (`/api/products`)

### 1. Get Product Catalog
* **Method:** `GET`
* **Path:** `/api/products`
* **Access:** Public
* **Cache Header:** `Cache-Control: public, max-age=60, stale-while-revalidate=180`
* **Query Parameters:**
  * `category` *(string, optional)*: Filter by category name or slug (e.g. `vehicles`, `electronics`).
  * `categoryId` *(number, optional)*: Filter by exact numeric category ID.
  * `search` *(string, optional)*: Text search matching product name, description, or location.
  * `location` *(string, optional)*: Filter by city/kebele (e.g. `injibara`, `kossober`).
  * `page` *(number, optional)*: Page number (defaults to `1`).
  * `limit` *(number, optional)*: Number of items per page (max `100`).
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 12,
    "total": 45,
    "page": 1,
    "limit": 12,
    "totalPages": 4,
    "hasMore": true,
    "data": [
      {
        "id": 105,
        "name": "Bajaj RE 205 CC 2024",
        "slug": "bajaj-re-205-cc-2024-1718000000",
        "price": "385000.00",
        "discount_price": null,
        "stock": 1,
        "location": "Injibara",
        "image": "https://res.cloudinary.com/.../bajaj.webp",
        "product_images": [
          {
            "id": 201,
            "image_url": "https://res.cloudinary.com/.../bajaj.webp",
            "is_primary": true,
            "sort_order": 0
          }
        ],
        "categories": {
          "id": 7,
          "name": "Vehicles & Bajaj (መኪኖች እና ባጃጅ)",
          "slug": "vehicles"
        }
      }
    ]
  }
  ```

### 2. Get Seller's Own Listings
* **Method:** `GET`
* **Path:** `/api/products/my-products`
* **Access:** Authenticated Seller (`protect`)
* **Response `200 OK`:** Array of all non-deleted products listed by the authenticated user.

### 3. Get Single Product by ID
* **Method:** `GET`
* **Path:** `/api/products/:id`
* **Access:** Public
* **Cache Header:** `Cache-Control: public, max-age=120, stale-while-revalidate=300`
* **Response `200 OK`:** Complete product details with full `product_images` array and store relation.

### 4. Create Product Listing
* **Method:** `POST`
* **Path:** `/api/products`
* **Access:** Authenticated User (`protect`, Rate Limited: 25 req / 15 min)
* **Special Behavior:** Automatically upgrades user role from `customer` to `seller` upon successful listing creation.
* **Payload Types Supported:**
  * **Multipart Form-Data:**
    * `name` *(string, required)*
    * `price` *(number, required)*
    * `description` *(string, optional)*
    * `discount_price` *(number, optional)*
    * `stock` *(number, optional, defaults to 0)*
    * `category_id` *(number, optional)*
    * `store_id` *(number, optional)*
    * `location` *(string, optional)*
    * `images` *(binary file array, up to 6 images)*
  * **JSON Payload:**
    * Same fields with `image_urls` as an array of pre-hosted image URL strings.
* **Response `201 Created`:** Created product record with uploaded Cloudinary image URLs.

### 5. Update Product
* **Method:** `PUT`
* **Path:** `/api/products/:id`
* **Access:** Product Owner or Admin (`protect`)
* **Response `200 OK`:** Updated product record.

### 6. Delete Product
* **Method:** `DELETE`
* **Path:** `/api/products/:id`
* **Access:** Product Owner or Admin (`protect`)
* **Behavior:** Executes a non-destructive soft delete by setting `deleted_at = new Date()`.
* **Response `200 OK`:** `{ "success": true, "message": "ምርቱ በተሳካ ሁኔታ ተሰርዟል" }`

---

## 6. Categories (`/api/categories`)

### 1. List All Categories
* **Method:** `GET`
* **Path:** `/api/categories`
* **Access:** Public
* **Cache Header:** `Cache-Control: public, max-age=300, stale-while-revalidate=600`
* **Response `200 OK`:** Array of all active categories sorted by creation date.

### 2. Create Category
* **Method:** `POST`
* **Path:** `/api/categories`
* **Access:** Admin only (`protect` &rarr; `authorizeRoles('admin')`)
* **Request Body:** `{ "name": "...", "slug": "...", "description": "...", "image": "..." }`
* **Response `201 Created`:** Newly created category entity.

---

## 7. Stores & Merchant Profiles (`/api/stores`)

### 1. List Stores Directory
* **Method:** `GET`
* **Path:** `/api/stores`
* **Access:** Public
* **Response `200 OK`:** Array of all active store profiles with logos and contact information.

### 2. Create Store Profile
* **Method:** `POST`
* **Path:** `/api/stores`
* **Access:** Authenticated User (`protect`)
* **Payload:** Multipart (`store_name`, `description`, `phone`, `address`, and `logo` image file) or JSON.
* **Response `201 Created`:** Created store record with Cloudinary-hosted logo.

---

## 8. In-App Messaging & Inquiries (`/api/messages`)

### 1. Send Message / Inquire
* **Method:** `POST`
* **Path:** `/api/messages/send`
* **Access:** Authenticated User (`protect`, Rate Limited: 25 req / 15 min)
* **Request Body:**
  ```json
  {
    "product_id": 105,
    "message_text": "Hello, I am interested in this Bajaj. Can we inspect it?",
    "receiver_id": null
  }
  ```
* **Intelligent Receiver Routing Rules:**
  * If `receiver_id` is supplied, message routes directly to that user.
  * If `receiver_id` is omitted and `product_id` is supplied:
    * **Tier 1 Categories (Vehicles, Property, Machinery):** Automatically resolved to the platform Administrator (`seberbel@gmail.com` or first available admin).
    * **Tier 2 Categories (Consumer Goods):** Automatically resolved to the listing's seller (`product.seller_id`).
* **Response `201 Created`:**
  ```json
  {
    "success": true,
    "message": "Message sent successfully.",
    "data": {
      "message_id": 482,
      "receiver_id": 1,
      "product_id": 105
    }
  }
  ```

### 2. Get User Inbox
* **Method:** `GET`
* **Path:** `/api/messages/inbox`
* **Access:** Authenticated User (`protect`)
* **Response `200 OK`:** List of active conversation threads grouped by contact with last message snippet, timestamp, and unread count.

### 3. Get Unread Count Badge
* **Method:** `GET`
* **Path:** `/api/messages/unread-count`
* **Access:** Authenticated User (`protect`)
* **Response `200 OK`:** `{ "success": true, "unreadCount": 3 }`

### 4. Get Product Chat Thread
* **Method:** `GET`
* **Path:** `/api/messages/chat/:productId`
* **Access:** Authenticated User (`protect`)
* **Response `200 OK`:** Full chronological message history for the product between the user and resolved receiver.

---

## 9. Admin Desk & Broker Hub (`/api/admin`)

*All `/api/admin/*` endpoints strictly require Bearer authentication with role `admin` or `super_admin`.*

### 1. Platform Overview Metrics
* **Method:** `GET`
* **Path:** `/api/admin/overview`
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 240,
      "totalProducts": 512,
      "activeListings": 480,
      "totalStores": 34,
      "activeBrokerInquiries": 18,
      "closedBrokerDeals": 42
    }
  }
  ```

### 2. List Broker Inquiries
* **Method:** `GET`
* **Path:** `/api/admin/broker-inquiries`
* **Description:** Returns all Tier 1 broker leads deduplicated by `(product_id, buyer_id)` with persisted appointment dates, statuses, and buyer/seller dossier.
* **Response `200 OK`:** Array of broker inquiry dossiers.

### 3. Update Broker Inquiry Status
* **Method:** `PUT`
* **Path:** `/api/admin/broker-inquiries/:id/status`
* **Request Body:**
  ```json
  {
    "status": "APPOINTMENT_SCHEDULED"
  }
  ```
* **Allowed Statuses:** `NEW`, `ASSIGNED`, `CONTACTED`, `APPOINTMENT_SCHEDULED`, `IN_PROGRESS`, `DEAL_CLOSED`, `CANCELLED`, `REJECTED`.
* **Response `200 OK`:** Updated broker inquiry record.

### 4. Schedule Broker Inspection Appointment
* **Method:** `PUT`
* **Path:** `/api/admin/broker-inquiries/:id/appointment`
* **Request Body:**
  ```json
  {
    "appointment_date": "2026-10-25T10:00:00Z"
  }
  ```
* **Response `200 OK`:** Updated record with scheduled date and status automatically set to `APPOINTMENT_SCHEDULED`.

### 5. Product Moderation
* **`GET /api/admin/products`:** List all products across platform with seller info.
* **`PUT /api/admin/products/:id/status`:** Update listing status (`approved`, `rejected`, `pending`, `inactive`).
* **`PUT /api/admin/products/:id/reject`:** Reject product with reason.
* **`DELETE /api/admin/products/:id`:** Soft-delete product.

### 6. User Moderation & Suspensions
* **`GET /api/admin/users`:** List all platform users with role, listing count, and status.
* **`PUT /api/admin/users/:id/status`:** Toggle user suspension (`ACTIVE` / `SUSPENDED` by toggling `deleted_at`).

### 7. Staff Admin Management & Permissions
* **`GET /api/admin/management/admins`:** List all administrator accounts.
* **`POST /api/admin/management/admins`:** Create new staff administrator account.
* **`GET /api/admin/permissions/:userId`:** Fetch granted feature permissions.
* **`PUT /api/admin/permissions/:userId`:** Set granular feature permissions (`overview`, `broker_hub`, `products`, `stores`, `categories`, `users`, `admin_management`, `settings`).
