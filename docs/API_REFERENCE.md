# MarketVerse — REST API Reference

**Companion to:** [PRD.md](./PRD.md) · [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) · [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) · [../server](../server)
**Status:** Draft v1.0
**Base URL:** `https://api.marketverse.example/api/v1` (local dev: `http://localhost:4000/api/v1`)

This document specifies the full target REST surface. Endpoints already implemented in [`server/src/modules`](../server/src/modules) (`auth`, `stores`, `uploads`) match this spec exactly — the ones described here beyond that (`users`, `inventory`, `products`, `customers`, `orders`, `employees`, `payments`, `analytics`, `achievements`, `events`, `leaderboards`, `admin`) follow the identical Controller → Service → Repository pattern from [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) and are the next modules to scaffold.

---

## 0. Conventions

### 0.1 Resource IDs

Every ID in a URL or response body is the resource's **`publicId`** (a UUID) — never the internal database `bigint` (see [DATABASE_DESIGN.md §2](./DATABASE_DESIGN.md#2-naming-conventions)). `{storeId}` in a path means "a store's public UUID," not a sequential integer.

### 0.2 Authentication

Two credential delivery methods, chosen automatically by client type:
- **Browser (first-party web client):** `httpOnly`, `Secure`, `SameSite=Strict` cookies (`accessToken`, `refreshToken`, `sessionId`), set automatically by `/auth/*` endpoints. No client-side token handling needed.
- **Non-browser (mobile WebView, server-to-server):** `Authorization: Bearer <accessToken>` header.

Admin endpoints (`/admin/*`) require a **separate admin access token** (distinct signing audience — see [BACKEND_ARCHITECTURE.md §9](./BACKEND_ARCHITECTURE.md#9-authentication)) obtained via a separate, non-public admin login flow. A player token is structurally rejected on every `/admin/*` route.

Endpoints below are marked:
- 🔓 **Public** — no auth required
- 🔒 **Player** — valid player access token required
- 🛡️ **Admin(`role`)** — valid admin access token with the listed role(s) required

### 0.3 Response Format

All successful responses share one envelope:

```json
{
  "success": true,
  "data": { },
  "meta": { }
}
```

`meta` is present only on endpoints that return pagination info or similar out-of-band metadata; omitted otherwise. `data` is `null` only for `204 No Content` responses (which have no body at all).

### 0.4 Error Format

All error responses — regardless of status code — share one envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": { "fieldErrors": { "name": ["String must contain at least 3 character(s)"] } },
    "requestId": "3f2c1a90-4b7e-4e2a-9c1d-8a6f0b2e5d11"
  }
}
```

- `code` is a **stable, machine-readable** string — safe to branch on in client code. See §0.6 for the catalog.
- `message` is human-readable and safe to display, but not guaranteed to be stable across API versions — don't match on it.
- `details` is included **only in non-production environments**; production responses omit it to avoid leaking internal shape (see [BACKEND_ARCHITECTURE.md §17](./BACKEND_ARCHITECTURE.md#17-error-handling)). Support requests should include `requestId`, which is always present and correlates to server-side logs.

### 0.5 HTTP Status Codes

| Status | Meaning | Used when |
|---|---|---|
| `200 OK` | Success | Successful `GET`, `PATCH`, or action `POST` that isn't creating a new resource |
| `201 Created` | Resource created | Successful `POST` that creates a resource (`Location` header points to it) |
| `204 No Content` | Success, no body | Successful `DELETE`, `POST /auth/logout` |
| `400 Bad Request` | Malformed request | Structurally invalid request (unparseable JSON) — rare; most input problems are `422` |
| `401 Unauthorized` | Not authenticated | Missing, invalid, expired, or revoked credentials |
| `403 Forbidden` | Not allowed | Authenticated, but lacks the role or ownership required (e.g., editing a store you don't own) |
| `404 Not Found` | Resource doesn't exist | Including soft-deleted resources — a `deletedAt`-set row 404s exactly like a nonexistent one |
| `409 Conflict` | State conflict | Unique constraint violation (duplicate email/slug), duplicate claim of a one-time reward, stale refresh token reuse |
| `422 Unprocessable Entity` | Validation failed | Request is well-formed JSON but fails schema validation (see §0.6) |
| `429 Too Many Requests` | Rate limited | See §0.9; `Retry-After` header included |
| `500 Internal Server Error` | Unexpected failure | Bug or unhandled dependency failure — always logged with a `requestId`, never a client-input problem |
| `503 Service Unavailable` | Dependency down | `/health` reports the API can't reach Postgres/Redis; also returned during graceful shutdown drain |

### 0.6 Validation

Every request body/query/params is validated against a Zod schema before it reaches a controller (see [BACKEND_ARCHITECTURE.md §8](./BACKEND_ARCHITECTURE.md#8-validation)). A validation failure always returns `422` with `code: "VALIDATION_ERROR"` and, outside production, a `details.fieldErrors` map of `{ field: [messages] }`. Unknown fields in a request body are **silently stripped**, not rejected — only recognized fields ever reach business logic.

**Common error codes:**

| Code | Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Request failed schema validation |
| `UNAUTHORIZED` | 401 | Missing/invalid/expired/revoked credentials |
| `FORBIDDEN` | 403 | Authenticated but not permitted |
| `NOT_FOUND` | 404 | Resource doesn't exist (or is soft-deleted) |
| `CONFLICT` | 409 | Uniqueness or state conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

Endpoint-specific codes (e.g., `INSUFFICIENT_STOCK`, `INSUFFICIENT_FUNDS`) are documented per-endpoint below.

### 0.7 Pagination

**Cursor-based only** — no `OFFSET`/page-number pagination is exposed, matching the DB-level convention in [DATABASE_DESIGN.md §12](./DATABASE_DESIGN.md#12-performance-optimizations-at-scale) (`OFFSET` degrades on large tables; cursors don't).

**Request query params** (any list endpoint):

| Param | Type | Default | Notes |
|---|---|---|---|
| `cursor` | string | — (first page) | Opaque — pass the `nextCursor` value from the previous response verbatim. Never construct one by hand. |
| `limit` | integer | `20` | `1`–`100` |

**Response shape:**

```json
{
  "success": true,
  "data": [ { }, { } ],
  "meta": { "nextCursor": "918273645" }
}
```

`meta.nextCursor` is `null` when there are no more results — that's the only correct way to detect the last page (don't infer it from `data.length < limit`, which isn't guaranteed to hold in every listing).

### 0.8 Filtering, Sorting & Search

Applied consistently across list endpoints; each endpoint below states which fields it actually supports for each.

- **Filtering:** exact-match filters use the field name directly as a query param — `?status=ACTIVE`. Multi-value filters accept a comma-separated list — `?status=ACTIVE,ARCHIVED` (interpreted as OR). Range filters use `min`/`max` prefixes — `?minPrice=1.00&maxPrice=5.00`.
- **Sorting:** `?sort=field:direction`, direction is `asc` or `desc`. Multiple sort keys are comma-separated and applied in order — `?sort=level:desc,createdAt:asc`. An unsupported sort field returns `422 VALIDATION_ERROR`.
- **Search:** `?q=<term>` — full-text/fuzzy search where supported (backed by the `pg_trgm` indexes from [DATABASE_DESIGN.md §6](./DATABASE_DESIGN.md#6-indexes)), never a plain `LIKE '%term%'` scan. Search and filters combine (AND).

### 0.9 Rate Limiting

Every response includes standard rate-limit headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`). Exceeding a limit returns `429` with a `Retry-After` header (seconds). Tiers (detailed in [BACKEND_ARCHITECTURE.md §18](./BACKEND_ARCHITECTURE.md#18-rate-limiting)):

| Tier | Limit | Applies to |
|---|---|---|
| Auth-sensitive | 5 / 15 min / IP | `/auth/login`, `/auth/register` |
| Write-heavy gameplay | 60 / min / user | Most mutating endpoints below |
| Standard read | 300 / min / user | Most `GET` endpoints |
| Admin | 120 / min / admin user | All `/admin/*` |

### 0.10 Idempotency

Money-moving `POST` endpoints (`/stores/{storeId}/orders`, `/payments/iap/verify`) accept an optional **`Idempotency-Key`** request header (client-generated UUID). Retrying the same request with the same key returns the original result without double-processing — backed by the same unique-constraint-based idempotency pattern used for IAP receipts (see [BACKEND_ARCHITECTURE.md §14](./BACKEND_ARCHITECTURE.md#14-queues)). Strongly recommended for any client that may retry on network failure.

### 0.11 Versioning

The `/api/v1` prefix is the version. Breaking changes ship as `/api/v2` running alongside `v1` for a deprecation window (announced via the `Deprecation`/`Sunset` response headers on the old version) — never a breaking change made in place under `v1`.

---

## 1. Authentication

Base path: `/auth`. See [BACKEND_ARCHITECTURE.md §9](./BACKEND_ARCHITECTURE.md#9-authentication) for the full token-rotation design.

### `POST /auth/register` 🔓

Creates a player account and starts a session.

**Body**

| Field | Type | Rules |
|---|---|---|
| `email` | string | valid email, lowercased |
| `username` | string | 3–24 chars, alphanumeric + underscore |
| `password` | string | 10–128 chars, ≥1 uppercase, ≥1 digit |

**201 Created**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c4e3a1f0-1234-4a5b-8c9d-1a2b3c4d5e6f",
      "email": "player@example.com",
      "username": "shopkeeper_mo",
      "displayName": null,
      "createdAt": "2026-07-28T09:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "s3cr3t-opaque-token",
      "sessionId": "918273645",
      "expiresIn": 900
    }
  }
}
```

| Status | Code | When |
|---|---|---|
| 409 | `CONFLICT` | Email or username already registered |
| 422 | `VALIDATION_ERROR` | Password/username/email fails rules |

### `POST /auth/login` 🔓

**Body:** `{ "email": string, "password": string }`
**200 OK** — same shape as register's `data`.
**401 `UNAUTHORIZED`** on wrong credentials — deliberately identical whether the email doesn't exist or the password is wrong (prevents user enumeration; see [BACKEND_ARCHITECTURE.md §9](./BACKEND_ARCHITECTURE.md#9-authentication)).

### `POST /auth/refresh` 🔓 (requires a valid refresh token + session cookie/body)

Rotates the refresh token. **Body:** `{ "refreshToken"?: string }` (omit if sent via cookie).
**200 OK** — new token triple, same shape as login.
**401 `UNAUTHORIZED`** — expired, invalid, or **reused-after-rotation** token (reuse triggers full session revocation for the account, see §9 of the backend doc).

### `POST /auth/logout` 🔒

Revokes the current session. **204 No Content.**

---

## 2. Users

Base path: `/users`.

| Method & Path | Auth | Description |
|---|---|---|
| `GET /users/me` | 🔒 | Full profile of the authenticated user (includes `email`) |
| `PATCH /users/me` | 🔒 | Update `displayName`, `locale`, `countryCode` |
| `GET /users/{userId}` | 🔓 | Public profile (no `email`) — for guild rosters, store-visiting, leaderboards |
| `GET /users/me/settings` | 🔒 | Preferences, accessibility, notification settings ([FEATURE_LIST.md §13–14](./FEATURE_LIST.md)) |
| `PATCH /users/me/settings` | 🔒 | Update settings (partial merge into the `jsonb` columns) |
| `POST /users/me/avatar` | 🔒 | Not a direct upload — returns instructions to use `POST /uploads/presign` with `purpose: "AVATAR"`, then `PATCH /users/me` with the resulting `cdnUrl` |

**`GET /users/me` — 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "c4e3a1f0-1234-4a5b-8c9d-1a2b3c4d5e6f",
    "email": "player@example.com",
    "username": "shopkeeper_mo",
    "displayName": "Mo",
    "avatarUrl": "https://cdn.marketverse.example/public/avatar/...-medium.webp",
    "locale": "en",
    "countryCode": "US",
    "createdAt": "2026-07-28T09:00:00.000Z"
  }
}
```

**`GET /users/{userId}` — 200 OK** — same shape minus `email`, `locale`, `countryCode`.

`PATCH` bodies accept any subset of the mutable fields; unknown/immutable fields (`email`, `username` — changed via a separate verification flow, not covered here) are stripped per §0.6.

---

## 3. Store

Base path: `/stores`. See [DATABASE_DESIGN.md §3.2](./DATABASE_DESIGN.md#32-store-inventory-warehouse-products) for the underlying model and [BACKEND_ARCHITECTURE.md §5–6](./BACKEND_ARCHITECTURE.md#5-services) for the reference implementation (already built in `server/src/modules/stores`).

### `POST /stores` 🔒

**Body:** `{ "name": string (3–40), "slug": string (3–40, lowercase kebab) }`
**201 Created**
```json
{
  "success": true,
  "data": {
    "id": "8a1b2c3d-4e5f-6789-a0b1-c2d3e4f56789",
    "name": "Mo's Corner Mart",
    "slug": "mos-corner-mart",
    "level": 1,
    "reputationStars": 0,
    "status": "ACTIVE",
    "createdAt": "2026-07-28T09:05:00.000Z"
  }
}
```
`409 CONFLICT` (`code: "CONFLICT"`) if `slug` is taken.

### `GET /stores/mine` 🔒
Cursor-paginated (§0.7). Sort: `level`, `createdAt` (default `id:asc`).

### `GET /stores/{storeId}` 🔓
Public store detail — `404` if nonexistent or soft-deleted.

### `PATCH /stores/{storeId}` 🔒 (owner only)
**Body:** `{ "name"?: string }`. `403 FORBIDDEN` if the caller isn't `ownerId`.

### `GET /stores/{storeId}/layout` 🔓 · `PUT /stores/{storeId}/layout` 🔒 (owner)
Gets/replaces the store's grid layout blob (`layoutData`, free-form `jsonb` — see [DATABASE_DESIGN.md §5](./DATABASE_DESIGN.md#5-normalization) for why this is a blob, not normalized rows). `PUT` is full-replace, versioned via optimistic concurrency: include the last-seen `version` in the body; a stale `version` returns `409 CONFLICT`.

### `GET /stores/{storeId}/departments` 🔓 · `POST /stores/{storeId}/departments` 🔒 (owner)
`POST` body: `{ "departmentType": "BAKERY" | "DELI" | "PHARMACY" | "ELECTRONICS" | "FLORAL" | "CAFE" }`. `409 CONFLICT` if already unlocked; `422` if the store's level doesn't meet the department's unlock requirement (`code: "LEVEL_REQUIREMENT_NOT_MET"`).

### `GET /stores/{storeId}/upgrades` 🔓 · `POST /stores/{storeId}/upgrades` 🔒 (owner)
`POST` body: `{ "upgradeKey": string }`. `402`-equivalent handled as `422` with `code: "INSUFFICIENT_FUNDS"` if the store owner's `CASH` balance can't cover the cost (checked against `wallet_balances` inside the same transaction as the debit — see [BACKEND_ARCHITECTURE.md §5](./BACKEND_ARCHITECTURE.md#5-services)).

### `GET /stores/{storeId}/warehouse` 🔓 · `PATCH /stores/{storeId}/warehouse` 🔒 (owner)
`PATCH` body: `{ "capacityUpgrade"?: boolean, "coldStorageUpgrade"?: boolean }` — same funds-check pattern as store upgrades.

---

## 4. Inventory

Base path: `/stores/{storeId}/inventory`. Backing model: [DATABASE_DESIGN.md §9](./DATABASE_DESIGN.md#9-audit-tables-vs-history-tables) `store_inventory` + `inventory_batches`.

### `GET /stores/{storeId}/inventory` 🔓
Cursor-paginated. **Filters:** `location` (`SHELF`/`WAREHOUSE`, filters on aggregate presence), `belowReorderThreshold=true`. **Sort:** `price`, `shelfQuantity`, `updatedAt`. **Search:** `q` (matches product name via join).

**200 OK (excerpt of one item)**
```json
{
  "success": true,
  "data": [
    {
      "productId": "d1e2f3a4-...",
      "productName": "Whole Milk 1L",
      "shelfQuantity": 12,
      "warehouseQuantity": 40,
      "price": 3.49,
      "reorderThreshold": 5,
      "updatedAt": "2026-07-28T09:10:00.000Z"
    }
  ],
  "meta": { "nextCursor": "5581" }
}
```
This response is served through the cache-aside layer described in [BACKEND_ARCHITECTURE.md §13](./BACKEND_ARCHITECTURE.md#13-caching) (10s TTL) — expect up to ~10 seconds of staleness on `shelfQuantity`/`warehouseQuantity` immediately after a concurrent write.

### `GET /stores/{storeId}/inventory/{productId}` 🔓
Single item detail, same shape as above.

### `PATCH /stores/{storeId}/inventory/{productId}` 🔒 (owner)
**Body:** `{ "price"?: number, "reorderThreshold"?: number }`. Writing `price` inserts a row into `store_inventory_price_history` via trigger (see [DATABASE_DESIGN.md §9.2](./DATABASE_DESIGN.md#92-history-tables--trigger-pattern-database-level)) and invalidates this item's cache entry.
`422 VALIDATION_ERROR` if `price <= 0`.

### `POST /stores/{storeId}/inventory/{productId}/restock` 🔒 (owner)
Moves stock from warehouse to shelf. **Body:** `{ "quantity": integer > 0 }`. `409 CONFLICT` (`code: "INSUFFICIENT_WAREHOUSE_STOCK"`) if `warehouseQuantity < quantity`.

### `GET /stores/{storeId}/inventory/{productId}/batches` 🔒 (owner)
Lists `inventory_batches` (FIFO order, oldest `expiresAt` first) — powers the spoilage/expiry UI. **Filter:** `status` (`FRESH`/`EXPIRING`/`EXPIRED`/`DISCARDED`).

---

## 5. Products

Base path: `/products`. Read-only for players; mutated only via `/admin/products` (§14).

| Method & Path | Auth | Description |
|---|---|---|
| `GET /products` | 🔓 | Catalog. Filters: `department`, `categoryId`, `minPrice`/`maxPrice` (on `basePrice`), `unlockLevel` (≤). Sort: `name`, `basePrice`, `unlockLevel`. Search: `q` (trigram, product name). |
| `GET /products/{productId}` | 🔓 | Product detail, including `category` and `suppliers[]` |
| `GET /products/categories` | 🔓 | Full category tree (parent/child) |
| `GET /products/{productId}/suppliers` | 🔓 | Tiered supplier options (`BUDGET`/`STANDARD`/`PREMIUM`) with cost/lead time |

**`GET /products/{productId}` — 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "d1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a",
    "sku": "GRO-DAIRY-MILK-1L",
    "name": "Whole Milk 1L",
    "description": "Fresh whole milk, 1 liter carton.",
    "category": { "id": "9f8e7d6c-...", "name": "Dairy", "department": "GROCERY" },
    "basePrice": 3.49,
    "baseCost": 2.10,
    "shelfLifeHours": 168,
    "unlockLevel": 1,
    "isActive": true,
    "suppliers": [
      { "supplierId": "1a2b...", "name": "ValueDairy Co.", "tier": "BUDGET", "cost": 1.95, "leadTimeMinutes": 45 },
      { "supplierId": "3c4d...", "name": "FreshFarms Direct", "tier": "PREMIUM", "cost": 2.40, "leadTimeMinutes": 15 }
    ]
  }
}
```

---

## 6. Customers

Base path: `/stores/{storeId}/customers`. NPC shopper simulation runs **client-side** for performance (PRD §10, [BACKEND_ARCHITECTURE.md §11](./BACKEND_ARCHITECTURE.md#11-socket-architecture) — sockets are push-only, never a source of gameplay-critical state). These endpoints are how the client reports **outcomes** back to the server for reputation/analytics — the server never simulates individual customer AI itself.

> **Implementation note:** persisted as lightweight, high-volume visit-summary rows (not yet in [`schema.prisma`](../server/prisma/schema.prisma) — a `customer_visits` table following the same partitioning treatment as `wallet_transactions` is the planned addition, since this is append-only and time-ordered at similar volume). `stores.reputationStars` is recomputed from a rolling window of recent visits.

### `POST /stores/{storeId}/customers/visits` 🔒 (owner or the store's own client session)
Reports one completed NPC shopping visit. **Body:**
```json
{
  "archetype": "BARGAIN_HUNTER",
  "satisfactionScore": 0.82,
  "itemsConsidered": 5,
  "itemsPurchased": 3,
  "abandonedDueToStockout": false,
  "queueWaitSeconds": 42
}
```
**201 Created** — echoes the recorded visit with a server-assigned `id` and `visitedAt`. Feeds directly into `PATCH`-style reputation recalculation (async, via the same job-queue pattern as leaderboard recompute, [BACKEND_ARCHITECTURE.md §15](./BACKEND_ARCHITECTURE.md#15-cron-jobs)) rather than synchronously on the request path.

### `GET /stores/{storeId}/customers/visits` 🔒 (owner)
Cursor-paginated raw visit log. Filters: `archetype`, `abandonedDueToStockout=true`. Sort: `visitedAt` (default desc).

### `GET /stores/{storeId}/customers/summary` 🔓
Aggregated, cached (60s) snapshot for dashboards:
```json
{
  "success": true,
  "data": {
    "windowHours": 24,
    "totalVisits": 812,
    "averageSatisfaction": 0.77,
    "archetypeBreakdown": { "REGULAR": 480, "BARGAIN_HUNTER": 210, "IMPULSE_BUYER": 90, "VIP": 32 },
    "abandonmentRate": 0.06
  }
}
```

---

## 7. Orders

Base path: `/stores/{storeId}/orders` (create/list scoped to a store) and `/orders/{orderId}` (direct lookup). Represents a **completed checkout/receipt** — one or more products sold in a single transaction.

> **Implementation note:** persisted as a `wallet_transactions` row (`reason: "PRODUCT_SALE"`) per the economic-ledger pattern in [BACKEND_ARCHITECTURE.md §5](./BACKEND_ARCHITECTURE.md#5-services), grouped under an order-level `referenceId`. A dedicated `orders`/`order_line_items` pair (mirroring the `Store`/`StoreInventory` shape) is the natural next schema addition once multi-line checkouts need querying independent of the ledger — documented here as the target API contract either way.

### `POST /stores/{storeId}/orders` 🔒 (owner or automated register client)

Checks out a completed sale — decrements shelf stock and credits the store owner's `CASH` wallet **atomically** (single DB transaction, per [BACKEND_ARCHITECTURE.md §5](./BACKEND_ARCHITECTURE.md#5-services)). Supports `Idempotency-Key` (§0.10).

**Body**
```json
{
  "lines": [
    { "productId": "d1e2f3a4-...", "quantity": 2 },
    { "productId": "a9b8c7d6-...", "quantity": 1 }
  ],
  "tip": 0.50,
  "customerArchetype": "REGULAR"
}
```

**201 Created**
```json
{
  "success": true,
  "data": {
    "id": "f0e1d2c3-...",
    "storeId": "8a1b2c3d-...",
    "lines": [
      { "productId": "d1e2f3a4-...", "productName": "Whole Milk 1L", "quantity": 2, "unitPrice": 3.49, "lineTotal": 6.98 },
      { "productId": "a9b8c7d6-...", "productName": "Sourdough Loaf", "quantity": 1, "unitPrice": 4.25, "lineTotal": 4.25 }
    ],
    "subtotal": 11.23,
    "tip": 0.50,
    "total": 11.73,
    "customerArchetype": "REGULAR",
    "createdAt": "2026-07-28T09:20:00.000Z"
  }
}
```

| Status | Code | When |
|---|---|---|
| 409 | `INSUFFICIENT_STOCK` | Any line's `quantity` exceeds current `shelfQuantity` — the **entire** order is rejected, no partial checkout |
| 422 | `VALIDATION_ERROR` | Empty `lines`, non-positive `quantity`, unknown `productId` |

### `GET /stores/{storeId}/orders` 🔒 (owner)
Cursor-paginated receipt history. Filters: `minTotal`/`maxTotal`, `customerArchetype`. Sort: `createdAt` (default desc), `total`.

### `GET /orders/{orderId}` 🔒 (owner of the order's store)
Single receipt detail — same shape as the `POST` response.

---

## 8. Employees

Base path: `/stores/{storeId}/employees` and `/employees/{employeeId}`.

### `GET /stores/{storeId}/employees` 🔓
Filters: `role`, `status`. Sort: `level`, `hiredAt`, `wage`.

### `POST /stores/{storeId}/employees` 🔒 (owner)
**Body:** `{ "name": string, "role": "CASHIER"|"STOCKER"|"MANAGER"|"CLEANER"|"SPECIALIST", "wage": number }`
**201 Created**
```json
{
  "success": true,
  "data": {
    "id": "77e6f5d4-...",
    "storeId": "8a1b2c3d-...",
    "name": "Alex Rivera",
    "role": "CASHIER",
    "level": 1,
    "xp": 0,
    "morale": 100,
    "wage": 12.50,
    "status": "ACTIVE",
    "hiredAt": "2026-07-28T09:25:00.000Z"
  }
}
```

### `GET /employees/{employeeId}` 🔓 · `PATCH /employees/{employeeId}` 🔒 (owner)
`PATCH` body: `{ "role"?, "wage"? }`. Role changes above the store's unlocked department tier return `422 LEVEL_REQUIREMENT_NOT_MET`.

### `DELETE /employees/{employeeId}` 🔒 (owner)
Terminates (soft-deletes) the employee — sets `status: "TERMINATED"` and `terminatedAt`, never a hard `DELETE` (§7 of the DB doc). **204 No Content.**

### `GET /employees/{employeeId}/shifts` 🔒 (owner) · `POST /employees/{employeeId}/shifts` 🔒 (owner)
**Body:** `{ "startsAt": ISO8601, "endsAt"?: ISO8601, "zone"?: string }`.

---

## 9. Payments

Base path: `/payments`. Covers IAP, VIP subscription, and Season Pass — see [PRD.md §17](./PRD.md#17-monetization) for the monetization model and [BACKEND_ARCHITECTURE.md §14](./BACKEND_ARCHITECTURE.md#14-queues) for the async verification flow.

### `GET /payments/products` 🔓
Active `iap_products` catalog. **200 OK**
```json
{
  "success": true,
  "data": [
    { "id": "gem-pack-small", "platform": "WEB", "priceUsd": 4.99, "gemsGranted": 500 },
    { "id": "gem-pack-large", "platform": "WEB", "priceUsd": 49.99, "gemsGranted": 6000 }
  ]
}
```

### `POST /payments/iap/verify` 🔒
Submits a completed purchase receipt for server-side verification against the platform (Apple/Google/Stripe). Supports `Idempotency-Key`; also naturally idempotent on `platformTransactionId` (§0.10, [BACKEND_ARCHITECTURE.md §14](./BACKEND_ARCHITECTURE.md#14-queues)).

**Body:** `{ "iapProductId": string, "platform": "WEB"|"IOS"|"ANDROID", "platformTransactionId": string, "receiptData": object }`

**202 Accepted** — verification is asynchronous (queued, per §14 of the backend doc), not completed inline:
```json
{ "success": true, "data": { "transactionId": "b3c4d5e6-...", "status": "PENDING" } }
```
Client polls `GET /payments/transactions/{transactionId}` or listens on the `/notifications` socket namespace for the `iap-verified` push once complete.

### `GET /payments/transactions` 🔒
Cursor-paginated purchase history. Filter: `status` (`PENDING`/`VERIFIED`/`FAILED`/`REFUNDED`).

### `GET /payments/subscription` 🔒 · `POST /payments/subscription` 🔒 · `DELETE /payments/subscription` 🔒
Get current VIP subscription state; start one (`{ "plan": "VIP_MONTHLY"|"VIP_ANNUAL" }`, `201`); cancel (`204`, takes effect at `currentPeriodEnd` — no partial refund, matching standard subscription semantics).

### `GET /payments/season-pass` 🔒
Current season pass tier/XP progress for the authenticated user.

---

## 10. Analytics

Base path: `/stores/{storeId}/analytics`. All 🔒 owner-only, all cached/materialized (never computed live against `wallet_transactions`/`store_inventory` — see [BACKEND_ARCHITECTURE.md §13](./BACKEND_ARCHITECTURE.md#13-caching) and [DATABASE_DESIGN.md §12](./DATABASE_DESIGN.md#12-performance-optimizations-at-scale)).

| Path | Query params | Returns |
|---|---|---|
| `GET /analytics/sales` | `from`, `to` (ISO date), `granularity=hour\|day\|week` | Revenue/profit time series |
| `GET /analytics/top-products` | `from`, `to`, `limit` | Best/worst sellers by revenue and by units |
| `GET /analytics/inventory-turnover` | `from`, `to` | Turnover ratio per product; waste/spoilage totals |
| `GET /analytics/satisfaction` | `from`, `to` | Satisfaction trend, derived from Customers data (§6) |
| `GET /analytics/employees` | — | Per-employee performance summary |

**`GET /stores/{storeId}/analytics/sales?granularity=day` — 200 OK**
```json
{
  "success": true,
  "data": {
    "granularity": "day",
    "points": [
      { "period": "2026-07-26", "revenue": 412.30, "profit": 118.05, "orderCount": 63 },
      { "period": "2026-07-27", "revenue": 389.10, "profit": 101.44, "orderCount": 58 }
    ]
  }
}
```

---

## 11. Achievements

Base path: `/achievements` and `/users/me/achievements`. See [PRD.md §12](./PRD.md#12-achievements).

| Method & Path | Auth | Description |
|---|---|---|
| `GET /achievements` | 🔓 | Full catalog (excludes `isSecret: true` entries the user hasn't unlocked) |
| `GET /users/me/achievements` | 🔒 | Per-user progress on every achievement |
| `POST /users/me/achievements/{achievementId}/claim` | 🔒 | Claim the reward for a completed-but-unclaimed achievement |

**`GET /users/me/achievements` — 200 OK (excerpt)**
```json
{
  "success": true,
  "data": [
    {
      "achievementId": "sell-1000-items",
      "tier": "SILVER",
      "title": "Steady Seller",
      "progress": 1000,
      "target": 1000,
      "unlockedAt": "2026-07-20T14:03:00.000Z",
      "claimedAt": null
    }
  ]
}
```

`POST .../claim` — `200 OK` with the granted reward; `409 CONFLICT` (`code: "ALREADY_CLAIMED"`) or `422` (`code: "NOT_YET_UNLOCKED"`) otherwise.

---

## 12. Events

Base path: `/events`. See [FEATURE_LIST.md §18 Events](./FEATURE_LIST.md#18-events).

| Method & Path | Auth | Description |
|---|---|---|
| `GET /events` | 🔓 | Active + upcoming events. Filter: `status=ACTIVE\|UPCOMING\|ENDED` |
| `GET /events/{eventId}` | 🔓 | Event detail, including `config` (theme, objectives) |
| `POST /events/{eventId}/join` | 🔒 | Opt in — creates an `event_participations` row. `409 CONFLICT` if already joined or the event hasn't started/has ended |
| `GET /events/{eventId}/progress` | 🔒 | Authenticated user's progress toward the event's objectives |

---

## 13. Leaderboards

Base path: `/leaderboards`. See [FEATURE_LIST.md §19 Leaderboard](./FEATURE_LIST.md#19-leaderboard) and [DATABASE_DESIGN.md §5](./DATABASE_DESIGN.md#5-normalization) (fully derived/cached table — reads never touch live `stores`/`wallet_balances` directly).

### `GET /leaderboards/seasons` 🔓
Lists current + recent `leaderboard_seasons` per category.

### `GET /leaderboards/{category}` 🔓
`{category}` ∈ `net-worth`, `reputation`, `weekly-revenue`, `guild-score`. Cursor-paginated by rank. **Cached** per [BACKEND_ARCHITECTURE.md §13](./BACKEND_ARCHITECTURE.md#13-caching) (60s TTL) — never real-time.

```json
{
  "success": true,
  "data": [
    { "rank": 1, "userId": "c4e3a1f0-...", "username": "shopkeeper_mo", "storeId": "8a1b2c3d-...", "storeName": "Mo's Corner Mart", "score": 184230 }
  ],
  "meta": { "nextCursor": "51" }
}
```

### `GET /leaderboards/{category}/me` 🔒
The authenticated user's own rank/score in the current season — a dedicated endpoint because "my rank" is nearly always needed alongside the top-N page but is a different, O(1)-ish query, not a page scan.

---

## 14. Admin

Base path: `/admin`. All endpoints 🛡️ — see [BACKEND_ARCHITECTURE.md §10](./BACKEND_ARCHITECTURE.md#10-authorization) for the role model (`SUPPORT`, `MODERATOR`, `ECONOMY_MANAGER`, `SUPERADMIN`) and [DATABASE_DESIGN.md §9.1](./DATABASE_DESIGN.md#91-audit-log--write-pattern-application-level) — **every** admin mutation below writes an `audit_logs` row in the same transaction, no exceptions.

| Method & Path | Role | Description |
|---|---|---|
| `GET /admin/users` | `SUPPORT`+ | Search/list players. Filters: `status`, `email`, `username`. Includes soft-deleted rows (`?includeDeleted=true`) |
| `GET /admin/users/{userId}` | `SUPPORT`+ | Full player detail, including session list and recent `audit_logs` entries about them |
| `PATCH /admin/users/{userId}/status` | `MODERATOR`+ | `{ "status": "ACTIVE"\|"SUSPENDED"\|"BANNED", "reason": string }` |
| `POST /admin/users/{userId}/wallet-adjustment` | `ECONOMY_MANAGER`+ | Manual currency correction — `{ "currency", "amount", "reason" }`, writes a `wallet_transactions` row with `reason: "ADMIN_ADJUSTMENT"` |
| `GET /admin/products` · `POST /admin/products` · `PATCH /admin/products/{id}` | `ECONOMY_MANAGER`+ | Catalog management (create/edit products, pricing, supplier tiers) |
| `GET /admin/economy/config` · `PATCH /admin/economy/config` | `ECONOMY_MANAGER`+ | Live-tunable economy parameters (spoilage rates, supplier cost curves — see [FEATURE_LIST.md §16 Admin Panel](./FEATURE_LIST.md#16-admin-panel)) |
| `POST /admin/refunds` | `ECONOMY_MANAGER`+, `SUPERADMIN` | Issue a refund for an `iap_transactions` row — `{ "iapTransactionId", "reason" }` |
| `GET /admin/audit-logs` | `SUPPORT`+ | Query the audit trail. Filters: `actorType`, `actorId`, `entityType`, `entityId`, `from`/`to`. Sort: `createdAt` (default desc) |
| `POST /admin/events` · `PATCH /admin/events/{id}` | `SUPERADMIN` | Create/edit live events |

**`PATCH /admin/users/{userId}/status` — 200 OK**
```json
{
  "success": true,
  "data": { "id": "c4e3a1f0-...", "status": "SUSPENDED", "reason": "Chargeback dispute pending" }
}
```
`403 FORBIDDEN` if the calling admin's role isn't in the endpoint's required set — checked by `authorize(...)` middleware ([BACKEND_ARCHITECTURE.md §10](./BACKEND_ARCHITECTURE.md#10-authorization)), independent of the generic `authenticateAdmin` check.

---

## Appendix A — Status Code Quick Reference by Method

| Method | Success | Common errors |
|---|---|---|
| `GET` | `200` | `401`, `403`, `404` |
| `POST` (create) | `201` | `401`, `403`, `409`, `422` |
| `POST` (action, e.g. `/join`, `/claim`, `/restock`) | `200` | `401`, `403`, `404`, `409`, `422` |
| `POST` (async, e.g. IAP verify) | `202` | `401`, `422` |
| `PATCH` | `200` | `401`, `403`, `404`, `409`, `422` |
| `PUT` (full replace) | `200` | `401`, `403`, `404`, `409`, `422` |
| `DELETE` | `204` | `401`, `403`, `404` |

## Appendix B — Full Endpoint Index

<details>
<summary>Expand for a flat list of every endpoint in this document</summary>

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /users/me
PATCH  /users/me
GET    /users/{userId}
GET    /users/me/settings
PATCH  /users/me/settings
POST   /users/me/avatar

POST   /stores
GET    /stores/mine
GET    /stores/{storeId}
PATCH  /stores/{storeId}
GET    /stores/{storeId}/layout
PUT    /stores/{storeId}/layout
GET    /stores/{storeId}/departments
POST   /stores/{storeId}/departments
GET    /stores/{storeId}/upgrades
POST   /stores/{storeId}/upgrades
GET    /stores/{storeId}/warehouse
PATCH  /stores/{storeId}/warehouse

GET    /stores/{storeId}/inventory
GET    /stores/{storeId}/inventory/{productId}
PATCH  /stores/{storeId}/inventory/{productId}
POST   /stores/{storeId}/inventory/{productId}/restock
GET    /stores/{storeId}/inventory/{productId}/batches

GET    /products
GET    /products/{productId}
GET    /products/categories
GET    /products/{productId}/suppliers

POST   /stores/{storeId}/customers/visits
GET    /stores/{storeId}/customers/visits
GET    /stores/{storeId}/customers/summary

POST   /stores/{storeId}/orders
GET    /stores/{storeId}/orders
GET    /orders/{orderId}

GET    /stores/{storeId}/employees
POST   /stores/{storeId}/employees
GET    /employees/{employeeId}
PATCH  /employees/{employeeId}
DELETE /employees/{employeeId}
GET    /employees/{employeeId}/shifts
POST   /employees/{employeeId}/shifts

GET    /payments/products
POST   /payments/iap/verify
GET    /payments/transactions
GET    /payments/subscription
POST   /payments/subscription
DELETE /payments/subscription
GET    /payments/season-pass

GET    /stores/{storeId}/analytics/sales
GET    /stores/{storeId}/analytics/top-products
GET    /stores/{storeId}/analytics/inventory-turnover
GET    /stores/{storeId}/analytics/satisfaction
GET    /stores/{storeId}/analytics/employees

GET    /achievements
GET    /users/me/achievements
POST   /users/me/achievements/{achievementId}/claim

GET    /events
GET    /events/{eventId}
POST   /events/{eventId}/join
GET    /events/{eventId}/progress

GET    /leaderboards/seasons
GET    /leaderboards/{category}
GET    /leaderboards/{category}/me

GET    /admin/users
GET    /admin/users/{userId}
PATCH  /admin/users/{userId}/status
POST   /admin/users/{userId}/wallet-adjustment
GET    /admin/products
POST   /admin/products
PATCH  /admin/products/{id}
GET    /admin/economy/config
PATCH  /admin/economy/config
POST   /admin/refunds
GET    /admin/audit-logs
POST   /admin/events
PATCH  /admin/events/{id}
```

</details>

*End of Document — v1.0*
