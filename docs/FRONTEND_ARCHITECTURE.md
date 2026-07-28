# MarketVerse — Production React Architecture

**Companion to:** [PRD.md](./PRD.md) · [API_REFERENCE.md](./API_REFERENCE.md) · [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) · [../client](../client)
**Status:** Draft v1.0
**Stack:** React 19 · TypeScript · Vite · React Router 7 · TanStack Query · Zustand · Tailwind CSS · PixiJS (game canvas)

---

## 1. A Non-Obvious Constraint That Shapes Everything Below

MarketVerse's client is not a CRUD dashboard with a few charts — it's a **game UI shell wrapping a real-time canvas simulation** (PRD §18.1: PixiJS/Phaser rendering surface, up to ~30 concurrent animated customer agents at 60 FPS). That single fact drives several architectural decisions that would look like over-engineering in a typical admin-panel React app:

- **The game loop must never be driven by React's render cycle.** A customer agent moving across a shelf updates 60 times a second; if that state lived in React (`useState`, Zustand with default subscription, Context), React would re-render the entire component tree 60 times a second. The canvas is imperative and self-contained — React and the game engine talk through a narrow, deliberately un-reactive event bus (§14 Game Engine Bridge).
- **Accessibility can't rely on the canvas at all.** Screen readers see a `<canvas>` as a single opaque bitmap. Every piece of state a player *needs* to know (store level, cash balance, low-stock alerts, mission progress) must have a real, accessible DOM representation in the HUD — not "also" for compliance, but as the *only* way that information reaches assistive tech (§16).
- **Performance budgets are split two ways**: React's reconciliation performance (the usual concerns — memoization, code splitting, list virtualization) and the canvas's frame budget, which are independent problems solved with independent tools.

Every section below assumes this split. If MarketVerse were a pure dashboard, some of this (§14 especially) wouldn't exist.

---

## 2. Folder Structure

**Feature-sliced**, mirroring the backend's `modules/` boundary (per [BACKEND_ARCHITECTURE.md §1](./BACKEND_ARCHITECTURE.md#1-architectural-style)) so a developer working across the stack finds the same domain names in both places — `features/stores` on the client talks to `modules/stores` on the server, `features/inventory` to `modules/inventory`, and so on.

```
client/
├── public/
├── src/
│   ├── app/                        # composition root — providers, router, root error boundary
│   │   ├── App.tsx
│   │   ├── router.tsx               # route tree, lazy imports (§12, §13)
│   │   └── providers/
│   │       ├── AppProviders.tsx     # composes every provider below, single entry point
│   │       ├── QueryProvider.tsx    # TanStack Query client
│   │       ├── ThemeProvider.tsx    # design tokens + light/dark/colorblind modes
│   │       └── ToastProvider.tsx
│   │
│   ├── pages/                       # route-level components — thin, one per route (§4)
│   │   ├── auth/ (LoginPage.tsx, RegisterPage.tsx)
│   │   ├── store/ (StoreDashboardPage.tsx, StoreEditorPage.tsx)
│   │   ├── leaderboards/, achievements/, events/, payments/
│   │   ├── admin/ (AdminUsersPage.tsx, AdminEconomyPage.tsx, …)
│   │   └── errors/ (NotFoundPage.tsx, ErrorPage.tsx)
│   │
│   ├── layouts/                     # shared chrome, one level above pages (§5)
│   │   ├── RootLayout.tsx
│   │   ├── GameLayout.tsx           # HUD chrome around the canvas
│   │   ├── AuthLayout.tsx
│   │   └── AdminLayout.tsx
│   │
│   ├── features/                    # business modules — mirrors server/src/modules (§3)
│   │   ├── auth/
│   │   │   ├── api/auth.api.ts
│   │   │   ├── hooks/ (useLogin.ts, useRegister.ts, useSession.ts)
│   │   │   ├── state/auth.store.ts  # feature-local Zustand store
│   │   │   ├── components/ (LoginForm.tsx, RegisterForm.tsx)
│   │   │   └── types.ts
│   │   ├── stores/                  # the "Store" game-domain feature (see §8 naming note)
│   │   ├── inventory/
│   │   ├── products/
│   │   ├── employees/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── analytics/
│   │   ├── achievements/
│   │   ├── events/
│   │   ├── leaderboards/
│   │   └── admin/
│   │       (each following the same api/ hooks/ state/ components/ types.ts shape)
│   │
│   ├── game/                        # PixiJS engine integration — isolated from React's tree (§14)
│   │   ├── GameCanvas.tsx           # the ONLY component that touches the Pixi Application
│   │   ├── engine/ (createGameEngine.ts, scenes/)
│   │   ├── bridge/ (gameEventBus.ts, useGameEvent.ts, useGameCommand.ts)
│   │   └── assets/
│   │
│   ├── components/                  # reusable, business-agnostic UI (design system) (§17)
│   │   ├── ui/ (Button.tsx, Modal.tsx, Input.tsx, Card.tsx, Badge.tsx, Toast.tsx, Skeleton.tsx, …)
│   │   ├── feedback/ (ErrorBoundary.tsx, EmptyState.tsx, Spinner.tsx)
│   │   └── layout/ (Stack.tsx, Grid.tsx, VisuallyHidden.tsx)
│   │
│   ├── hooks/                       # cross-cutting reusable hooks, NOT feature-specific (§7)
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useReducedMotion.ts
│   │   ├── useIntersectionObserver.ts
│   │   ├── usePagination.ts
│   │   └── useFocusTrap.ts
│   │
│   ├── contexts/                    # React Context — reserved for low-frequency global state (§9)
│   │   └── LocaleContext.tsx
│   │
│   ├── state/                       # global Zustand stores not owned by one feature (§10)
│   │   ├── ui.store.ts              # modals, toasts, sidebar, command palette
│   │   └── connection.store.ts      # socket connection status, offline banner
│   │
│   ├── services/                    # framework-agnostic infrastructure — no React imports (§11)
│   │   ├── apiClient.ts             # typed fetch wrapper, matches backend's response envelope
│   │   ├── queryClient.ts
│   │   ├── socket.ts                # Socket.IO client wrapper
│   │   └── storage.ts               # localStorage/sessionStorage wrapper with schema versioning
│   │
│   ├── routes/                      # route guards (§13)
│   │   ├── ProtectedRoute.tsx
│   │   └── AdminRoute.tsx
│   │
│   ├── theme/                       # design tokens (§6)
│   │   ├── tokens.css
│   │   └── theme.ts
│   │
│   ├── utils/ (formatters.ts, constants.ts)
│   ├── types/ (api.ts — shared DTO/envelope types)
│   ├── main.tsx
│   └── index.css
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Import direction, enforced by lint rule (ESLint `import/no-restricted-paths`), mirrors the backend's layering discipline:**

```
pages/layouts  →  features  →  components/hooks/state/services  →  utils/types
```

A `component` in `components/ui/` must never import from `features/`; a `feature` must never import another feature's internals (only its public `index.ts` surface, if it needs another feature's data at all — most cross-feature composition happens at the `pages/` level instead).

---

## 3. Components, Pages & Layouts — The Three Tiers

These three folders look similar but answer different questions, and mixing their responsibilities is the single most common way a mid-size React app turns into a mess:

| Tier | Answers | Knows about routing? | Knows about the API? | Reusable across routes? |
|---|---|---|---|---|
| **`components/ui/`** | "What does a button/modal/card look like?" | No | No | Yes — by design, this is the whole point |
| **`features/*/components/`** | "What does the inventory table look like, with real inventory data?" | No | Yes (via feature hooks) | Within the feature, sometimes across |
| **`pages/`** | "What does the `/stores/:storeId/inventory` route look like?" | Yes (reads route params) | No directly — composes feature components | No — one page per route by definition |
| **`layouts/`** | "What chrome wraps every page under `/admin/*`?" | Yes (renders `<Outlet />`) | No | Yes — shared across a route subtree |

**A page is intentionally boring:**

```tsx
// pages/store/StoreDashboardPage.tsx
export default function StoreDashboardPage() {
  const { storeId } = useParams<{ storeId: string }>();
  return (
    <PageHeading title="Store Dashboard" />
    <StoreInventoryPanel storeId={storeId!} />   {/* features/inventory */}
    <StoreEmployeeRoster storeId={storeId!} />   {/* features/employees */}
    <StoreAnalyticsSummary storeId={storeId!} /> {/* features/analytics */}
  );
}
```

All the actual logic (data fetching, mutations, local UI state) lives in the feature components it composes — a page is a layout of features, never a place business logic accumulates.

---

## 4. Layouts

Layouts nest via React Router's `<Outlet />`, matching the route tree in §13:

```tsx
// layouts/RootLayout.tsx — wraps EVERY route
export function RootLayout() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <SkipToContentLink />              {/* accessibility, §16 */}
      <ConnectionStatusBanner />         {/* reads state/connection.store.ts */}
      <Outlet />
      <ToastRegion />                    {/* aria-live region, §16 */}
    </ErrorBoundary>
  );
}
```

- **`GameLayout`** — the HUD chrome (top bar: cash/level/notifications, bottom bar: mission tracker) around `<GameCanvas />` (§14). This is the layout for the actual gameplay routes.
- **`AuthLayout`** — centered card, no HUD, no canvas.
- **`AdminLayout`** — sidebar navigation + admin-only chrome, nested under `<AdminRoute>` (§13).

Each layout owns exactly its chrome — none of them fetch domain data themselves (that stays in the features rendered inside their `<Outlet />`).

---

## 5. Hooks

Two categories, and the folder they live in signals which:

- **`hooks/`** (top-level) — generic, would make sense in *any* React app, never import from `features/`. Examples: `useDebounce`, `useMediaQuery`, `useReducedMotion`, `useFocusTrap`, `usePagination` (wraps the cursor-pagination contract from [API_REFERENCE.md §0.7](./API_REFERENCE.md#07-pagination) into a reusable `{ items, loadMore, hasMore }` shape).
- **`features/*/hooks/`** — domain-aware, wrap TanStack Query around a feature's `api/` functions. Examples: `useStore(storeId)`, `useUpdateInventoryPrice()`, `useSession()`.

**A feature hook is the seam between "React component" and "server state"** — components never call `services/apiClient.ts` or `features/*/api/*.ts` directly; they call a hook:

```ts
// features/inventory/hooks/useUpdateInventoryPrice.ts
export function useUpdateInventoryPrice(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: string; price: number }) =>
      updateInventoryItem(storeId, input.productId, { price: input.price }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(storeId, variables.productId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list(storeId) });
    },
  });
}
```

---

## 6. Theme

Design tokens as **CSS custom properties**, not a runtime CSS-in-JS theme object — chosen deliberately for a game UI where React's own render performance is already a constrained budget (§1); a build-time atomic CSS approach (Tailwind, consuming these tokens) adds zero runtime style-computation cost per render, unlike styled-components/Emotion's per-render `style` interpolation.

```css
/* theme/tokens.css */
:root {
  --color-bg-canvas: #0f1115;
  --color-surface: #1a1d24;
  --color-text-primary: #f5f6f8;
  --color-accent: #ffb020;
  --color-success: #3ec97a;
  --color-danger: #ef5b5b;
  --radius-md: 8px;
  --space-4: 1rem;
}

[data-theme="light"] {
  --color-bg-canvas: #f4f5f7;
  --color-surface: #ffffff;
  --color-text-primary: #14161a;
  /* … */
}

/* Colorblind-safe palette variant (FEATURE_LIST.md §14 Accessibility) — swaps hue-only
   distinctions (success green / danger red) for a deuteranopia-safe pair. */
[data-theme-variant="colorblind-safe"] {
  --color-success: #2e86ab;
  --color-danger: #d1495b;
}
```

`ThemeProvider` (§2) resolves the active theme from, in priority order: an explicit user setting (persisted via `services/storage.ts`) → `prefers-color-scheme` → light default — and writes it to `<html data-theme>`/`data-theme-variant`, so plain CSS handles the actual repaint with no React re-render involved. Tailwind's config maps utility classes to these same variables (`bg-surface`, `text-primary`) rather than hardcoding hex values anywhere in component code — a color only ever gets defined once, in `tokens.css`.

---

## 7. State Management — Four Kinds, Deliberately Not One

The single most common React architecture mistake at scale is using one tool (usually Context, or one giant Redux store) for every kind of state. MarketVerse draws a hard line between four kinds, each with a different tool, matched to how that state actually behaves:

| Kind | Tool | Examples | Why this tool |
|---|---|---|---|
| **Server state** (owned by the API, can go stale, needs caching/refetching) | **TanStack Query** | Store data, inventory, leaderboard pages, achievements | Built for exactly this: cache invalidation, background refetch, request dedup — reimplementing this in Context/Redux is the classic scaling mistake |
| **Global client state** (UI-only, but shared across distant components) | **Zustand** | Active modal, toast queue, socket connection status, auth session snapshot | Selector-based subscriptions mean a component re-renders only when the *specific slice* it reads changes — critical given §1's re-render sensitivity |
| **Low-frequency cross-cutting state** | **React Context** | Theme, locale — values that change rarely (user toggles it, once) and are read broadly | Context re-renders every consumer on *any* change to the provided value; that's fine for "changes twice a session," wrong for "changes every frame" |
| **Local component state** | `useState`/`useReducer` | Form inputs, hover state, open/closed toggles | No reason to lift it — the classic over-engineering mistake is routing this through Zustand "just in case" |

**Why not Context for global client state (a common instinct):** Context has no built-in mechanism to subscribe to *part* of a value — every consumer of a `ThemeContext`-shaped `UIContext` re-renders on *any* change to *any* field, even ones it doesn't read. Zustand's `useUiStore((s) => s.activeModal)` re-renders only when `activeModal` itself changes. At MarketVerse's scale (dozens of HUD components potentially subscribed to shared UI state), that difference is not academic.

**Why not Redux:** TanStack Query already owns server state (the majority of what Redux would otherwise hold), and Zustand covers the remaining global client state with a fraction of the boilerplate — a separate Redux store would be a second, redundant source of truth for state Query already caches.

---

## 8. Stores (Zustand) — and the Naming Collision Worth Calling Out

"Store" means two different things in this codebase, and the folder structure exists partly to keep them from colliding in a developer's head:

1. **A player's supermarket** — the core game entity, `features/stores/` (mirroring `server/src/modules/stores`).
2. **A Zustand state container** — `state/ui.store.ts`, `features/auth/state/auth.store.ts`.

Convention to keep them apart: the game entity is always spelled out as "Store" (capitalized, a noun) in code and docs; a Zustand container file is always suffixed `*.store.ts` and lives in a `state/` folder, never a folder literally named `stores/` outside the one feature that means the game entity. This is a naming convention, not a technical constraint — but it's exactly the kind of ambiguity that causes a wrong import or a confusing PR title six months into a project, so it's written down here rather than left implicit.

**Example global store** (`state/ui.store.ts`):

```ts
interface UiState {
  activeModal: ModalId | null;
  toasts: Toast[];
  openModal: (id: ModalId) => void;
  closeModal: () => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeModal: null,
  toasts: [],
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  pushToast: (toast) => set((s) => ({ toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Components subscribe to a SLICE, not the whole store:
const activeModal = useUiStore((s) => s.activeModal); // re-renders only when activeModal changes
```

Feature-local stores (e.g., `features/auth/state/auth.store.ts` holding the decoded session snapshot for synchronous reads like `isAuthenticated`) follow the same pattern, scoped to their feature folder rather than the global `state/` directory.

---

## 9. Contexts

Deliberately small surface — per §7, Context is reserved for state that changes rarely and is read broadly:

- **`ThemeProvider`** (§6/§2) — theme mode + variant, plus the setter.
- **`LocaleContext`** — active locale + `t()` translation function (i18n).
- **`QueryProvider` / `AppProviders`** — technically Context under the hood (TanStack Query's `QueryClientProvider`), but these aren't application *state* Contexts — they're dependency injection for a client instance, a different and legitimate use of Context.

No feature-specific business data is ever passed through Context — that's what TanStack Query (§7) and prop-drilling through a shallow, well-composed component tree (§3) handle. A `StoreContext` holding live store data would fight the cache invalidation TanStack Query already provides and would re-render every consumer on every poll, which is exactly the failure mode §7 exists to avoid.

---

## 10. API Layer

`services/apiClient.ts` is the **only** place `fetch` is called directly. It mirrors the backend's response contract exactly (per [API_REFERENCE.md §0.3–0.4](./API_REFERENCE.md#03-response-format)):

```ts
// services/apiClient.ts
interface ApiSuccess<T> { success: true; data: T; meta?: Record<string, unknown> }
interface ApiErrorBody { success: false; error: { code: string; message: string; details?: unknown; requestId?: string } }

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string, public readonly details?: unknown) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include", // httpOnly auth cookies, per BACKEND_ARCHITECTURE.md §9
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = (await res.json()) as ApiSuccess<T> | ApiErrorBody;

  if (!body.success) {
    if (res.status === 401 && !path.startsWith("/auth/")) {
      return retryAfterRefresh<T>(path, init); // single-flight refresh, see below
    }
    throw new ApiError(res.status, body.error.code, body.error.message, body.error.details);
  }
  return body.data;
}
```

**401 handling is a single-flight refresh, not a per-request retry storm:** if five queries fire concurrently and all 401 at once, they must trigger exactly **one** `/auth/refresh` call, not five — the second-through-fifth callers await the first's in-flight refresh promise instead of issuing their own. Getting this wrong is one of the most common production auth bugs in token-refresh implementations.

**Feature API modules** (`features/*/api/*.ts`) are thin, typed wrappers over `request()` — no fetching logic of their own, just endpoint + types:

```ts
// features/inventory/api/inventory.api.ts
export const inventoryApi = {
  list: (storeId: string, params: InventoryListParams) =>
    request<InventoryItem[]>(`/stores/${storeId}/inventory?${toQueryString(params)}`),
  update: (storeId: string, productId: string, body: UpdateInventoryDto) =>
    request<InventoryItem>(`/stores/${storeId}/inventory/${productId}`, { method: "PATCH", body: JSON.stringify(body) }),
};
```

**`services/socket.ts`** wraps `socket.io-client` against the namespaces documented in [BACKEND_ARCHITECTURE.md §11](./BACKEND_ARCHITECTURE.md#11-socket-architecture) (`/notifications`, `/stores`), exposing a `useSocketEvent(namespace, event, handler)` hook so features subscribe to server push without polling — e.g., inventory invalidates its TanStack Query cache on a `stock-changed` event instead of refetching on an interval.

**Query key convention** — every feature exports a `<feature>Keys` factory (TanStack Query best practice) so invalidation is centralized and typo-proof:

```ts
export const inventoryKeys = {
  all: (storeId: string) => ["inventory", storeId] as const,
  list: (storeId: string, params?: InventoryListParams) => [...inventoryKeys.all(storeId), "list", params] as const,
  detail: (storeId: string, productId: string) => [...inventoryKeys.all(storeId), "detail", productId] as const,
};
```

---

## 11. Protected Routes

Two guard components, composed into the route tree (§13), reading the auth feature's Zustand snapshot (§8) rather than re-fetching session state on every navigation:

```tsx
// routes/ProtectedRoute.tsx
export function ProtectedRoute() {
  const { status } = useAuthStore((s) => ({ status: s.status })); // "loading" | "authenticated" | "anonymous"
  const location = useLocation();

  if (status === "loading") return <FullPageSpinner />;
  if (status === "anonymous") return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

// routes/AdminRoute.tsx — layered on top of ProtectedRoute, checks admin role separately
export function AdminRoute() {
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
```

`status` starts `"loading"` on a full page load and resolves once `useSession()` (a `features/auth` query hook, backed by `GET /users/me`) settles — this avoids a flash-of-login-page on refresh while a valid httpOnly cookie session is still being confirmed. `LoginPage` reads `location.state.from` to redirect back to the originally requested route after a successful login.

Mirrors the backend's two-tier authorization exactly (per [BACKEND_ARCHITECTURE.md §10](./BACKEND_ARCHITECTURE.md#10-authorization)): `ProtectedRoute` is the coarse "authenticated at all" check, admin-role and ownership checks are additional, separate layers — never conflated into one all-purpose guard.

---

## 12. Lazy Loading & Code Splitting

**Route-level, by default, for every route except the first one a user hits** — `pages/` modules are dynamically imported so the initial bundle contains only the landing/auth flow, not the admin panel, analytics charts, or every feature's components:

```tsx
// app/router.tsx
const StoreDashboardPage = lazy(() => import("@/pages/store/StoreDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/login", element: <LoginPage /> }, // NOT lazy — first paint, keep it in the main chunk
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <GameLayout />,
            children: [
              { path: "/stores/:storeId", element: <Suspense fallback={<FullPageSpinner />}><StoreDashboardPage /></Suspense> },
            ],
          },
          {
            element: <AdminRoute />,
            children: [
              { element: <AdminLayout />, children: [
                { path: "/admin/users", element: <Suspense fallback={<FullPageSpinner />}><AdminUsersPage /></Suspense> },
              ] },
            ],
          },
        ],
      },
    ],
  },
]);
```

**Beyond routes:**
- **Heavy, rarely-opened components** (analytics charts, the store-layout editor, any modal with a large dependency like a rich-text or chart library) are lazily imported at the component level, not just the route level — a player who never opens the analytics tab never downloads the charting library.
- **The game engine itself** (`game/engine`, PixiJS + its scene modules) is a separate dynamic import, loaded only once `GameLayout` actually mounts — the auth/login flow's bundle has zero PixiJS bytes in it.
- **Vite's build** (`vite.config.ts`) sets `build.rollupOptions.output.manualChunks` to group vendor code by volatility: a `vendor-react` chunk (changes rarely, cached long-term by the browser) separate from a `vendor-game` chunk (PixiJS, changes on its own schedule) separate from app code — so a deploy that only touches app code doesn't invalidate the browser cache for the large, stable vendor chunks.
- **Bundle size is a CI gate**, not a periodic manual check — `rollup-plugin-visualizer` output is compared against a budget per chunk in the build pipeline (mirrors [BACKEND_ARCHITECTURE.md §22](./BACKEND_ARCHITECTURE.md#22-deployment-strategy)'s "cheapest checks first" CI philosophy).

---

## 13. Performance Optimization

Beyond code splitting (§12), in priority order (most-impactful-first, since not everything below is worth doing everywhere):

1. **List virtualization** (`@tanstack/react-virtual`) for anything that can grow unbounded — the inventory grid, order history, leaderboard pages, admin user search results. Rendering 2,000 DOM rows for a 2,000-SKU catalog is the single most common real-world React performance bug; virtualizing renders only the ~20 rows actually in the viewport regardless of list size.
2. **Selective Zustand/Query subscriptions** (§7/§8) — the default failure mode without this discipline is a HUD component re-rendering on every socket event because it subscribed to the whole store instead of the one field it displays.
3. **`React.memo` — applied narrowly, to components that are both (a) expensive to render and (b) re-rendered by a parent more often than their own props change.** Not applied reflexively to every component; memoizing a cheap component adds a comparison cost for no benefit. The inventory table's `<InventoryRow>` (rendered up to ~100× per page) is a `memo` candidate; a page-level component rendered once per navigation is not.
4. **`useMemo`/`useCallback`** — used specifically to preserve referential stability for values passed to a `memo`ized child or into a `useEffect` dependency array, not sprinkled defensively. Overuse here has its own cost (allocation + comparison on every render) that can net *lose* performance versus just letting the value recompute.
5. **Debounced search/filter inputs** (`useDebounce`, §5) — the Products/Inventory search box (backed by [API_REFERENCE.md §0.8](./API_REFERENCE.md#08-filtering-sorting--search)'s `q` param) waits ~300ms after the last keystroke before firing a query, rather than one request per character.
6. **TanStack Query cache tuning per data volatility**, deliberately mirroring the backend's own cache TTLs ([BACKEND_ARCHITECTURE.md §13](./BACKEND_ARCHITECTURE.md#13-caching)) so the client doesn't refetch more eagerly than the server-side cache would even reflect a change: `staleTime: 10_000` for inventory snapshots, `60_000` for leaderboard pages, `10 * 60_000` for the near-static product catalog.
7. **Prefetching on intent** — hovering a store card prefetches that store's dashboard query (`queryClient.prefetchQuery`) so navigation feels instant; React Router's data-router `loader`s (§4) additionally kick off the primary query for a route before its component even mounts ("render-as-you-fetch" instead of "fetch-on-render," which avoids the request waterfall of "render → mount → useEffect → fetch").
8. **Images**: responsive `srcset` for store branding/avatars (the resized variants the upload pipeline already generates, per [BACKEND_ARCHITECTURE.md §19](./BACKEND_ARCHITECTURE.md#19-image-upload)), native `loading="lazy"` below the fold, and images always served from the CDN, never proxied through the API.

---

## 14. Game Engine Bridge

The concrete mechanism behind §1's central constraint. `GameCanvas` owns a PixiJS `Application` imperatively — React mounts it once and then gets out of the way; the 60 FPS render loop is entirely inside Pixi's own ticker, untouched by React's reconciler.

```
┌─────────────────────────┐        gameEventBus         ┌──────────────────────────┐
│   React component tree   │  <───── (mitt, pub/sub) ──── │   PixiJS Application      │
│   (HUD, modals, panels)  │  ─────  commands  ─────────> │   (owns the render loop)  │
└─────────────────────────┘                              └──────────────────────────┘
        ▲                                                            │
        │ useGameEvent("customer:checked-out", handler)              │ emits discrete,
        │ (subscribes to discrete events, NOT continuous state)      │ infrequent events only —
        │                                                             │ never per-frame position data
```

- **`game/bridge/gameEventBus.ts`** — a tiny typed pub/sub (not Zustand, not Context — deliberately the lightest possible mechanism, since this is the one integration point where using a "proper" state tool would reintroduce the exact re-render problem it exists to avoid).
- **Engine → React** direction: the engine emits **discrete, infrequent** events onto the bus — `customer:checked-out`, `shelf:emptied`, `store:levelUp` — never continuous per-frame data like agent positions. A HUD component uses `useGameEvent(bus, "shelf:emptied", handler)` to, say, invalidate the inventory query cache when it happens — an occasional React re-render triggered by a meaningful game event, not a render-loop-frequency one.
- **React → Engine** direction: commands, not state — `useGameCommand()` exposes functions like `focusCamera(storeCellId)` or `playCelebration()` that call directly into the Pixi scene's imperative API. React never hands the engine a state object to "sync"; it tells it to *do* something once.
- **Server state stays server state:** the canonical inventory/store data the game renders still comes from TanStack Query (§7/§10), fetched and cached the normal way — the engine reads a snapshot of it on load and via the discrete socket-driven invalidations from §10, it does not maintain its own parallel copy of server truth.

---

## 15. Reusable Components

`components/ui/` is a small, deliberately generic design-system layer — every component here must be nameable without reference to MarketVerse's domain (`Button`, `Modal`, `Card`, never `StorePriceEditorButton`).

- **Variant styling via `class-variance-authority` (cva)**, not prop-driven conditional class strings scattered per component — a `Button`'s `variant`/`size` props map to a single declarative config, keeping Tailwind class logic out of JSX:
  ```tsx
  const buttonStyles = cva("inline-flex items-center justify-center rounded-md font-medium transition-colors", {
    variants: {
      variant: { primary: "bg-accent text-bg-canvas hover:opacity-90", ghost: "bg-transparent hover:bg-surface" },
      size: { sm: "h-8 px-3 text-sm", md: "h-10 px-4" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  });
  ```
- **Compound components for anything with internal structure** — `Modal.Root` / `Modal.Header` / `Modal.Body` / `Modal.Footer` rather than one component with a dozen boolean props, so consumers compose only what they need and the accessibility wiring (focus trap, `aria-modal`, `Escape`-to-close — §16) lives once, inside `Modal.Root`, never re-implemented per usage.
- **Every `ui/` component ships with, at minimum:** a TypeScript prop interface with no `any`, a default export, and (per §16) the ARIA attributes appropriate to its role baked in — not left to the consumer to remember.
- **Storybook** (or an equivalent isolated dev harness) hosts every `ui/` component in isolation — this is also where visual regression and accessibility (`axe-core`) checks run in CI, independent of the full app.

---

## 16. Accessibility

Concrete mechanisms, building on §1's framing (the canvas is opaque to assistive tech, so the HUD is load-bearing, not decorative):

- **Every canvas-driven game event with player-relevant meaning gets a DOM/ARIA echo.** A customer completing checkout updates a visually-subtle HUD counter *and* is the kind of event a screen-reader player needs announced — handled via a single shared `aria-live="polite"` region (`<ToastRegion />` in `RootLayout`, §4) that the game event bridge (§14) can push into, so "structurally important" and "visually incidental" don't get conflated.
- **Keyboard navigation is complete, not best-effort:** every interactive HUD element is a real, focusable, semantic element (`<button>`, not a `<div onClick>`); modals trap focus (`useFocusTrap`, §5) and return focus to the triggering element on close; a skip-to-content link is the first focusable element on every page.
- **Route-change focus management** — React Router navigation doesn't reset focus by default, which silently breaks screen-reader users' sense of location; `RootLayout` moves focus to the new page's `<h1>` on every navigation.
- **Color is never the only signal.** The colorblind-safe theme variant (§6) exists precisely because success/danger states (in-stock vs. low-stock, profit vs. loss) must also be distinguishable by icon/shape/label, not hue alone — the theme variant is a safety net, correct component design is the actual requirement.
- **`prefers-reduced-motion` is respected in two layers**: CSS transitions/animations are disabled via a `@media (prefers-reduced-motion: reduce)` rule in `tokens.css`, and the `useReducedMotion` hook (§5) additionally tells the *game engine* (§14) to skip camera-shake/particle-heavy celebration effects — a CSS media query has no reach into a Pixi scene, so this is one of the few cases the bridge carries a "preference," not just discrete events.
- **Forms** (React Hook Form + Zod, matching the backend's Zod-first validation philosophy from [BACKEND_ARCHITECTURE.md §8](./BACKEND_ARCHITECTURE.md#8-validation) so error-shape expectations match end to end) associate every input with a `<label>`, surface validation errors via `aria-describedby` + `aria-invalid`, and announce a submit failure's error summary via `aria-live` rather than relying on visual-only red text.
- **CI enforcement:** `eslint-plugin-jsx-a11y` runs in the same lint pass as everything else (fails the build, not a warning), and `axe-core` assertions run against the Storybook-hosted `ui/` components (§15) and against key pages in end-to-end tests — accessibility regressions are caught the same way a broken test is, not discovered in a manual audit after the fact.

---

## 17. Summary — What Lives Where

| Concern | Mechanism | Section |
|---|---|---|
| A domain (e.g. inventory) has one home, not scattered files | Feature-sliced `features/<domain>/{api,hooks,state,components}` | §2, §3 |
| React never re-renders 60×/sec off game state | Discrete event bus between engine and React, no continuous state sync | §14 |
| Server data and UI state never fight over one tool | Four explicit state kinds, one tool each | §7 |
| "Store" (game entity) vs. Zustand "store" never collide | Naming + folder convention, written down once | §8 |
| A 401 doesn't cause a thundering herd of refresh calls | Single-flight refresh in `apiClient.ts` | §10 |
| Admin/ownership access is layered, not one giant guard | `ProtectedRoute` → `AdminRoute`, mirrors backend §10 | §11 |
| First paint doesn't ship the admin panel or the game engine | Route- and component-level lazy loading, vendor chunk splitting | §12 |
| A 2,000-row table doesn't tank scroll performance | List virtualization | §13 |
| A screen-reader player isn't locked out by the canvas | DOM/ARIA echo of every meaningful game event | §16 |

*End of Document — v1.0*
