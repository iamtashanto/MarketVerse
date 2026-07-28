# MarketVerse — UI/UX Design System

**Companion to:** [PRD.md](./PRD.md) · [FEATURE_LIST.md](./FEATURE_LIST.md) · [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)
**Status:** Draft v1.0
**Author:** Design Lead
**Scope:** Complete visual and interaction system — foundations plus all 14 core screens

---

## 0. What "AAA Quality" Means Here, Concretely

"AAA" isn't a mood — it's a checklist a design has to survive contact with. For MarketVerse, it means:

1. **Every action has feedback.** Nothing the player does — set a price, hire a cashier, claim a reward — happens silently. There's a visible, audible, or haptic acknowledgment within 100ms, and a lasting state change within 300ms.
2. **The canvas is not the interface.** Per [FRONTEND_ARCHITECTURE.md §1](./FRONTEND_ARCHITECTURE.md#1-a-non-obvious-constraint-that-shapes-everything-below), the PixiJS store floor is opaque to assistive tech and to precise interaction. Every number the player needs to make a decision — stock level, cash balance, satisfaction — lives in real, styled DOM, not painted pixels.
3. **Nothing is punitive by default.** Per [PRD.md §2.2](./PRD.md#22-player-facing-goals) ("no hard fail states"), the UI never uses fear-based patterns — no red countdown timers on currency, no shame-based empty states, no dark-pattern urgency on purchases. Tension comes from *optimization*, not *loss aversion*.
4. **Consistency is load-bearing, not decorative.** One spacing scale, one type scale, one motion vocabulary, applied without exception — because a player who has internalized "gold means money, teal means prestige" for 40 hours should never have that association broken by a screen that didn't get the memo.
5. **Accessible by construction.** Contrast, focus states, and reduced-motion aren't a pass at the end — they're encoded in the tokens everything else is built from (§1, §9).

---

## 1. Design Language

### 1.1 Two Registers: Operate vs. Celebrate

MarketVerse asks the player to do two very different things, and the UI says so visually rather than pretending they're the same:

| | **Operate** | **Celebrate** |
|---|---|---|
| Screens | HUD, Inventory, Warehouse, Employees, Statistics, Settings | Landing, Main Menu, Achievements, Daily Rewards, Day Summary |
| Job | Fast, dense, correct — a player scanning a shelf list needs to find the one out-of-stock row in under a second | Warm, unhurried, a little theatrical — a player claiming a reward should feel like something happened |
| Shape | Square-cornered panels (`--radius-sm`), tight rows, hairline dividers | Soft rounded cards (`--radius-lg`), generous padding, layered depth |
| Motion | Instant or near-instant (100–150ms), no bounce | Springy, deliberate (300–500ms), the one place easing gets playful |
| Typography | Inter throughout, tabular figures, small caps for labels | Baloo 2 for headlines, larger scale steps |

Both registers draw from the **same token set** (§2–§6) — this isn't two design systems, it's one system applied with a different hand. A player should never be confused about which mode they're in, and should never see the "wrong" register bleed into a screen (a spinning confetti burst has no place in the Inventory table; a hairline data table has no place on the Daily Rewards calendar).

### 1.2 Voice

UI copy is written from the shopkeeper's point of view, not the system's: "Low stock" not "Inventory threshold breached"; "Alex clocked out" not "Employee status updated." Errors say what happened and what to do about it — "Milk's out of stock — reorder from Suppliers" not "Operation failed."

---

## 2. Color System

### 2.1 Palette

Six colors carry the entire brand. Everything else in §2.2–§2.4 is these six, systematically extended.

| Name | Hex (dark) | Hex (light) | Role |
|---|---|---|---|
| **Ink** | `#0F1115` | `#F5F6F8` | Canvas — the "stockroom at dusk" ground |
| **Surface** | `#1A1D24` | `#FFFFFF` | Panels, cards, chrome |
| **Gold** | `#FFB020` | `#B5720A` | Brand accent, Cash currency, primary actions |
| **Fresh** | `#3EC97A` | `#1F8F52` | Success, in-stock, profit |
| **Clearance** | `#EF5B5B` | `#C8382F` | Danger, expired, loss |
| **Amethyst** | `#A78BFA` | `#7C3AED` | Gems (premium currency) |

Gold-on-dark is the whole brand idea in one pairing: a warm cash-register glow against a cool, dim stockroom. It's used with intention, not everywhere — see §2.3.

### 2.2 Neutral Ramp

A single cool-dark axis (hue ≈ 225°), not a generic gray — it's the same hue family as Ink, so panels never look like they were pulled from a different kit.

| Token | Dark value | Light value |
|---|---|---|
| `neutral-950` | `#0B0D11` | `#0B0D11` |
| `neutral-900` (Ink / canvas) | `#0F1115` | `#F5F6F8` |
| `neutral-800` (Surface) | `#1A1D24` | `#FFFFFF` |
| `neutral-700` (Surface Raised) | `#22262F` | `#F0F1F4` |
| `neutral-600` (Border) | `#2A2E38` | `#DFE1E6` |
| `neutral-500` | `#454B58` | `#C7CAD1` |
| `neutral-400` (Text Muted, light-on-dark) | `#9CA0AB` | `#5B6070` |
| `neutral-300` | `#C7CAD1` | `#454B58` |
| `neutral-100` | `#E8E9ED` | `#22262F` |
| `neutral-50` (Text Primary) | `#F5F6F8` | `#14161A` |

These map 1:1 onto the `--mv-color-*` custom properties already shipped in [`client/src/theme/tokens.css`](../client/src/theme/tokens.css) — this section is the source-of-truth spec that file implements; if the two ever disagree, this document wins and the token file gets updated, not the other way around.

### 2.3 Extended Semantic Set

| Token | Dark | Light | Used for |
|---|---|---|---|
| `warning` | `#E8681C` | `#B8540E` | Low stock, expiring soon, wage above budget — deliberately a **burnt orange**, not a second yellow, so it never gets mistaken for the Gold accent at a glance |
| `info` | `#5B9DD9` | `#2C6CA6` | Tips, neutral system messages, "processing" states |
| `prestige` | `#2DD4BF` | `#0F8A7C` | Franchise Points and franchise-tier UI exclusively — this color means *one thing* everywhere it appears |
| `reputation` | Gold (`#FFB020`) | Gold (`#B5720A`) | Star rating — reuses the brand gold deliberately; stars are gold by convention, and it reinforces "reputation is currency too" |

**Rule:** semantic color is never the only signal. Every colored state (low-stock badge, expired tag, error field) pairs color with an icon or label — see [FRONTEND_ARCHITECTURE.md §16](./FRONTEND_ARCHITECTURE.md#16-accessibility) and §9 below. The colorblind-safe theme variant remaps `Fresh`→`#2E86AB` and `Clearance`→`#D1495B` (already in `tokens.css`); no other token changes, because everything else already differentiates by more than hue.

### 2.4 Currency Color Coding

A player should identify a currency by color alone, instantly, in a HUD that's showing four numbers at once:

| Currency | Color | Icon shape |
|---|---|---|
| Cash | Gold | Coin |
| Gems | Amethyst | Faceted gem |
| Reputation Stars | Gold (reputation token) | 5-point star |
| Franchise Points | Prestige teal | Laurel/chevron |

### 2.5 Contrast Requirements

Every `text-on-surface` pairing in the palette meets **WCAG AAA (7:1)** for body text and **AA (4.5:1)** minimum for large/bold text (18px+/14px+bold); every semantic-color-on-surface pairing used for icons or borders meets **AA non-text (3:1)**. This is checked in CI against the token file, not eyeballed once at design time — a new token doesn't ship until it passes the same automated contrast check as an existing one.

---

## 3. Typography

### 3.1 Typeface Pairing

| Role | Typeface | Why |
|---|---|---|
| **Display** | **Baloo 2** (600/700) | Rounded, geometric, storefront-signage character — the same warmth as a hand-painted shop awning. Used *sparingly*: screen titles, big celebratory numerals, the Daily Reward calendar. Never body text — it doesn't have the density for a 40-row inventory table. |
| **UI / Body** | **Inter** (400/500/600), variable | Built for dense interfaces at small sizes; excellent numeral legibility; huge language coverage for future localization. Carries 95% of the interface. |
| **Data / Ticker** | **JetBrains Mono** (500) | Reserved exclusively for the live HUD cash counter and countdown timers — fixed-width digits mean the number doesn't visually jitter as it ticks up, which is the one place a monospace face earns its keep. |

Both webfonts are self-hosted (`@font-face`, woff2, subset to Latin + currency glyphs) — never loaded from a third-party font CDN, consistent with [BACKEND_ARCHITECTURE.md §20](./BACKEND_ARCHITECTURE.md#20-security)'s no-third-party-runtime-dependency posture and better for the initial-load budget in [PRD.md §18.2](./PRD.md#182-performance-targets).

### 3.2 Type Scale

A 1.25 (major third) ratio from a 16px base, tuned to whole pixels:

| Token | Size / Line-height | Weight | Typeface | Example use |
|---|---|---|---|---|
| `display-lg` | 48px / 56px | 700 | Baloo 2 | Landing hero headline |
| `display` | 36px / 44px | 700 | Baloo 2 | Main Menu title, Day Summary headline |
| `heading-lg` | 28px / 36px | 600 | Baloo 2 | Screen titles (Inventory, Store, Statistics) |
| `heading` | 22px / 28px | 600 | Inter | Panel/section headers |
| `heading-sm` | 18px / 24px | 600 | Inter | Card titles, modal titles |
| `body-lg` | 16px / 24px | 400/500 | Inter | Primary reading text, form labels |
| `body` | 14px / 20px | 400/500 | Inter | Table cells, list items — the default UI size |
| `body-sm` | 13px / 18px | 400 | Inter | Secondary metadata, timestamps |
| `caption` | 12px / 16px | 500 | Inter | Uppercase eyebrow labels, badge text — `letter-spacing: 0.04em` |
| `numeral-hud` | 20px / 24px | 500 | JetBrains Mono, `font-variant-numeric: tabular-nums` | HUD cash/gem counters |

Headings use `text-wrap: balance`. Body copy in any single-column reading context (empty states, onboarding tips) is capped at ~65 characters (`max-width: 42ch`).

---

## 4. Spacing & Layout Grid

### 4.1 Spacing Scale

4px base unit — every margin, padding, and gap in the system is a multiple of it. No arbitrary values.

| Token | Value | Typical use |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap, tight badge padding |
| `space-2` | 8px | Compact row padding, form field gaps |
| `space-3` | 12px | Default internal card padding (Operate register) |
| `space-4` | 16px | Standard gap between related elements |
| `space-6` | 24px | Section gap, default card padding (Celebrate register) |
| `space-8` | 32px | Gap between major panels |
| `space-12` | 48px | Page-level top margin, hero spacing |
| `space-16` | 64px | Landing page section rhythm |

### 4.2 Grid

- **Operate screens** (Inventory, Warehouse, Employees, Statistics): 8px row height increments, dense table grid, hairline (1px `neutral-600`) row dividers, no card shadows — structure comes from alignment, not decoration.
- **Celebrate screens** (Main Menu, Achievements, Daily Rewards): a 12-column responsive grid, `space-6` gutters, cards with soft elevation (§5).
- **Game Scene / HUD**: the canvas fills the viewport; HUD chrome docks to top (56px) and bottom (64px) edges with `space-4` internal padding, leaving the full remaining rect to the canvas. HUD panels never cover more than 30% of viewport width at once on desktop, so the store floor stays the visual focus.

---

## 5. Elevation & Surfaces

Three levels, dark-mode-first (elevation reads as *lightness*, not shadow, on a dark ground — shadows only start doing real work once Light Mode's white surfaces need to separate from each other):

| Level | Token | Dark | Light | Use |
|---|---|---|---|---|
| 0 | `surface` | `#1A1D24` | `#FFFFFF` | Base panels, table rows |
| 1 | `surface-raised` | `#22262F` | `#F0F1F4` + `shadow-sm` | Cards sitting on a panel, dropdown menus |
| 2 | `surface-overlay` | `#2A2E38` + `shadow-lg` | `#FFFFFF` + `shadow-lg` | Modals, the HUD notification toast, tooltips |

`shadow-sm` = `0 1px 2px rgb(0 0 0 / 0.12)`; `shadow-lg` = `0 12px 32px rgb(0 0 0 / 0.32)`. Shadows are never used on dark-mode base/raised surfaces — the lightness step alone carries the separation; adding shadow on top of an already-dark ground just muddies the color.

**Z-index scale:** `canvas: 0` → `hud-chrome: 10` → `dropdown: 20` → `modal-backdrop: 40` / `modal: 41` → `toast: 50` — matching the layering already implied by [FRONTEND_ARCHITECTURE.md §14](./FRONTEND_ARCHITECTURE.md#14-game-engine-bridge)'s canvas/DOM split.

---

## 6. Shape Language

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 4px | Operate-register controls: table cells, small buttons, input fields |
| `radius-md` | 8px | Default button/card radius, badges |
| `radius-lg` | 16px | Celebrate-register cards: achievement tiles, reward calendar cells, modals |
| `radius-full` | 999px | Pills, avatar frames, the HUD currency chips |

No radius is used decoratively — a card's roundedness always signals which register it belongs to (§1.1). A `radius-lg` card appearing in the Inventory table would be a bug, not a style choice.

---

## 7. Iconography

- **System (Lucide, 1.75px stroke, outline style)** for all UI chrome — settings, navigation, close/back, sort/filter, edit/delete. Chosen for its consistency at small sizes and because an outline (not filled) style keeps icons from competing visually with the solid Gold accent used on primary actions.
- **Custom icon set (filled, single-color, geometric)** for game-domain concepts that don't exist in a generic icon library: the Cash coin, the Gems facet-cut gem, the Reputation star, the Franchise laurel, and each product department (Grocery cart, Bakery wheat, Deli knife, Pharmacy cross, Electronics bolt, Floral bloom, Café cup). These are drawn on the same 24px grid as Lucide so they sit flush in mixed contexts (a department icon next to a Lucide chevron in a breadcrumb).
- **Sizing scale:** 16 / 20 / 24 / 32 / 40px. 16px is the floor — nothing smaller ships, per the touch-target rules in §9.
- **Color:** icons inherit `currentColor` by default (they take the color of their text context) except the custom currency/department icons, which always render in their fixed semantic color (§2.4) regardless of surrounding text color — a Gems icon is never accidentally neutral-colored.

---

## 8. Motion & Animation System

### 8.1 Tokens

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-instant` | 100ms | `ease-out` | Hover states, focus rings, button press |
| `motion-fast` | 150ms | `ease-out` | Toggle switches, tab changes, Operate-register row updates |
| `motion-base` | 250ms | `cubic-bezier(0.2, 0, 0, 1)` | Modal/panel enter, page transitions |
| `motion-slow` | 400ms | `cubic-bezier(0.34, 1.2, 0.64, 1)` (spring overshoot) | Celebrate-register reveals: achievement unlock, reward claim |
| `motion-counter` | 600–900ms (value-dependent) | `ease-out` | HUD number ticking (cash increasing after a sale) |

### 8.2 Choreography Principles

- **Operate never bounces.** Inventory rows update, sort, and filter with `motion-fast` linear/ease-out transitions only — a spring on a data table reads as sluggish, not delightful, when you're scanning 40 rows.
- **Celebrate earns its spring.** The one place overshoot easing is used is a moment the game wants the player to *feel*: an achievement badge popping in, a daily reward card flipping open, a level-up burst. Used elsewhere, it cheapens the effect.
- **The HUD cash counter never jump-cuts.** A sale credits cash with a tabular-nums count-up (`motion-counter`), not an instant digit swap — it's the single most-seen animation in the game and is tuned to feel satisfying without ever blocking the next action (it's purely visual; the balance is already updated for any dependent logic the instant the transaction completes).
- **Transitions have a single job.** A screen transition either fades or slides — never both plus a scale, which reads as unfocused. Modals: fade backdrop (`motion-fast`) + rise-and-fade content (`motion-base`, 8px translate-Y). Toasts: slide-in from the edge they'll dismiss toward.

### 8.3 Reduced Motion

`prefers-reduced-motion` (or the in-Settings override) does three things, not one blanket "disable everything": transitions collapse to instant/near-instant per the CSS rule already in [`tokens.css`](../client/src/theme/tokens.css); the HUD counter switches from count-up to instant-set; and — the one cross-boundary case — the preference reaches into the PixiJS scene via `useReducedMotion()` (per [FRONTEND_ARCHITECTURE.md §16](./FRONTEND_ARCHITECTURE.md#16-accessibility)) to skip camera shake and particle-heavy celebration effects that live outside CSS's reach entirely.

---

## 9. Responsive Design

**Desktop-first**, per [PRD.md §18.1](./PRD.md#181-platform--delivery) — MarketVerse is played on a large canvas by design, and mobile-web is a secondary, simplified context rather than an equal target.

| Breakpoint | Width | Behavior |
|---|---|---|
| `desktop` | ≥1280px | Full layout: HUD panels can dock side-by-side (e.g., Inventory + a detail drawer open at once) |
| `laptop` | 1024–1279px | Side-by-side panels collapse to one-at-a-time; navigation moves from a persistent sidebar (Admin/Settings) to a top tab bar |
| `tablet` | 768–1023px | HUD top/bottom bars shrink (48px/56px); currency chips lose their labels and show icon+number only; touch targets grow to the 44px minimum (§9.1) |
| `mobile-web` | 480–767px | Secondary screens (Statistics, Employee Management) reflow from multi-column to single-column stacked cards; the store-floor canvas becomes pinch-zoom/pan instead of fixed-fit |
| `mobile-compact` | <480px | Read-only "check-in" mode is the explicit target (per [PRD.md §3.3](./PRD.md#33-personas) "Maya" persona) — claim rewards, check missions, glance at the store; the full layout/stocking interaction is desktop/tablet-primary |

### 9.1 Touch Targets & Input Parity

Every interactive element is ≥40×40px on desktop (mouse) and ≥44×44px on touch breakpoints — the token system enforces this by having `button`/`sm` never drop below those floors rather than trusting each screen to remember. Every canvas-driven interaction (placing a shelf, dragging a layout item) has a keyboard/tap-driven equivalent in the DOM layer — never a mouse-drag-only affordance, per [FRONTEND_ARCHITECTURE.md §16](./FRONTEND_ARCHITECTURE.md#16-accessibility).

---

## 10. Dark Mode

**Dark is the default and the primary-designed mode** — this is a game about a stockroom at dusk with a warm gold glow, and that idea is strongest against a dark ground (§2.1). Light mode is not an inversion; every token in §2.2–§2.3 has an independently tuned light value, checked against the same §2.5 contrast bar. The active mode resolves from an explicit user choice → `prefers-color-scheme` → dark default (implementation in [FRONTEND_ARCHITECTURE.md §6](./FRONTEND_ARCHITECTURE.md#6-theme)), stamped as `data-theme` on `<html>` so the swap is a pure CSS repaint with no React re-render.

---

## 11. Screens

Each screen below: **Purpose**, **Layout**, **Key content**, **States**, **Register**.

### 11.1 Landing

**Purpose:** Convert a cold visitor into a registered player in one scroll, before any account exists.
**Register:** Celebrate.
**Layout:** Full-bleed hero (store-floor illustration, gold-lit), `display-lg` headline ("Your store. Your rules. Your empire."), primary CTA (`Start Playing Free`) and secondary (`Log in`). Below the fold: 3-panel feature strip (Stock it / Sell it / Scale it — matching [PRD.md §1](./PRD.md#1-vision)'s tagline), a live-store social-proof strip (rotating real store names + levels from the leaderboard), footer.
**Key content:** No lorem — feature strip uses real mechanic names (Order & Stock, Price & Sell, Hire & Grow); CTA copy is the literal action, not "Get Started."
**States:** Logged-in visitors hitting `/` redirect straight to Main Menu — Landing is never shown to an authenticated session.
**Motion:** One orchestrated load sequence (headline fades up, hero art settles in with a subtle parallax on scroll) — the only screen in the whole system that gets a bespoke entrance; everywhere else motion is systemic (§8).

### 11.2 Main Menu

**Purpose:** The post-login hub — resume play, switch stores, reach every non-gameplay system.
**Register:** Celebrate.
**Layout:** Player identity strip (avatar, username, level ring) top-left; store card grid (12-col, §4.2) center — one card per owned store showing name, level, thumbnail; primary `Enter Store` CTA on the focused card; a right rail with Daily Reward status, active Missions summary, and Leaderboard rank teaser; bottom nav to Achievements / Statistics / Settings / Profile.
**Key content:** Store card shows real state — "Mo's Corner Mart · Level 4 · ⭐ 3.8" — never a placeholder.
**States:** First-time (zero stores) shows a single large `Create Your First Store` card instead of the grid, no empty-grid illustration-of-nothing.
**Motion:** Store cards stagger in on load (40ms cascade, `motion-base`); hover lifts a card 2px with `shadow-sm`.

### 11.3 Game Scene

**Purpose:** The core canvas view — the store floor itself.
**Register:** Operate (the HUD framing it) around a Celebrate-adjacent living world (the canvas itself is warm and lively; the *chrome* around it is disciplined).
**Layout:** Full-viewport PixiJS canvas (§4.2), HUD docked top/bottom (§11.4), context-sensitive side panels slide in from the right when an object is selected (a shelf, an employee, a register) — never a modal for in-scene interactions, so the player never loses sight of the floor.
**Key content:** N/A (rendered scene) — but every selectable object has a DOM-visible label on focus/hover, per accessibility (§0.2).
**States:** Loading (engine initializing) shows a lightweight branded loader, not a blank canvas; a disconnect/offline state (§ConnectionStatusBanner) overlays a non-blocking top banner, gameplay continues in an optimistic local state where possible.
**Motion:** None owned by React here — the scene's own motion lives entirely in the PixiJS layer (per [FRONTEND_ARCHITECTURE.md §14](./FRONTEND_ARCHITECTURE.md#14-game-engine-bridge)).

### 11.4 HUD

**Purpose:** The always-visible instrument panel — what the player needs to know without opening anything.
**Register:** Operate.
**Layout:** **Top bar** (56px): store name + level (left), currency chips — Cash, Gems, Reputation (center-right, `radius-full` pills, icon+`numeral-hud`), notification bell with unread badge (right). **Bottom bar** (64px): active mission tracker (progress bar + label), quick-access buttons to Inventory / Employees / Store (icon + label, always visible — these are the three systems a player touches every session).
**Key content:** Currency chips always show live values — "$1,284 · 💎 320 · ⭐ 4.1" — sourced from the Wallet feature, ticking via `motion-counter` (§8.2) on change.
**States:** A currency chip pulses once (`motion-fast` scale 1→1.08→1) on any change, colored by direction implicitly through the existing currency color, not an extra red/green wash — the number itself is the signal.
**Motion:** See §8.2 — this is the highest-frequency animated surface in the whole app, so its motion budget is the tightest.

### 11.5 Inventory

**Purpose:** See and manage every product a store stocks.
**Register:** Operate.
**Layout:** Sticky header row (search `q`, department filter chips, sort dropdown — per [API_REFERENCE.md §0.8](./API_REFERENCE.md#08-filtering-sorting--search)) above a dense virtualized table ([FRONTEND_ARCHITECTURE.md §13](./FRONTEND_ARCHITECTURE.md#13-performance-optimization)): columns Product / Shelf Qty / Warehouse Qty / Price (editable inline) / Status badge. Row-level status badge: `In Stock` (Fresh), `Low Stock` (Warning), `Out of Stock` (Clearance) — icon + label + color, never color alone.
**Key content:** Real SKUs — "Whole Milk 1L · 12 shelf · 40 warehouse · $3.49 · In Stock."
**States:** Empty (no products unlocked yet) shows a `Browse the Catalog` CTA, not a bare table; loading shows skeleton rows at the real row height (no layout shift on load).
**Motion:** Inline price edit: field expands in place (`motion-fast`), confirms with a small checkmark flash, no modal.

### 11.6 Store

**Purpose:** Manage the store as an entity — identity, layout, departments, upgrades.
**Register:** Mixed — the upgrade/department *shop* is Celebrate (tiles, price tags, "Unlock" CTAs); the layout editor is Operate (grid-snapped, precise).
**Layout:** Tabbed: **Overview** (name/slug, level/XP bar, reputation), **Layout** (drag-and-drop grid editor over a top-down floor plan, with the Efficiency Heatmap toggle from [PRD.md §8.3](./PRD.md#83-layout-editor)), **Departments**, **Upgrades** — the latter two as card grids, each card a price-tagged tile (`radius-lg`, Gold price badge) in locked/affordable/owned states.
**Key content:** Upgrade cards show real costs and effects — "Self-Checkout Kiosk · $2,400 · -15% checkout time."
**States:** Locked-by-level cards are visually present but desaturated with a `Level 6` requirement chip — never hidden, so progression always has visible next steps.
**Motion:** Purchasing an upgrade: card flashes Gold border → settles into "Owned" state (`motion-base`), no full-screen celebration (that register is reserved for Achievements/Rewards, §1.1) — an upgrade is a routine operational win, not a rare one.

### 11.7 Warehouse

**Purpose:** Manage backroom storage — capacity, batches, expiry.
**Register:** Operate.
**Layout:** Capacity meter (bar showing used/total, Warning color past 85%) at top; below, the same virtualized-table pattern as Inventory but scoped to `location: WAREHOUSE`, with an added **Expiry** column showing a countdown chip (`3d left`, Warning at <24h, Clearance at expired) and a batch-level FIFO ordering (oldest first, matching [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) `inventory_batches`).
**Key content:** "Whole Milk 1L · Batch #4 · 24 units · received Jul 26 · expires in 3d."
**States:** Over-capacity: capacity meter turns Clearance, a persistent (non-blocking) banner offers `Restock to Shelf` or `Upgrade Warehouse` as the two resolutions — always paired with an action, never just a warning.
**Motion:** Restocking (warehouse → shelf) animates the row's quantity split with a brief directional slide, echoing the physical action.

### 11.8 Employee Management

**Purpose:** Hire, assign, and develop staff.
**Register:** Operate, with Celebrate touches on hiring (meeting a new hire is a small moment).
**Layout:** Roster as cards (not a dense table — headcount is small enough that a card grid reads faster than rows), each showing avatar, name, role badge, level, morale bar (Fresh/Warning/Clearance by threshold), wage. A `Hire` CTA opens a candidate-pool drawer (3 candidates, refreshing periodically per [FEATURE_LIST.md §7](./FEATURE_LIST.md#7-employees)), each with a trait chip ("Fast Learner").
**Key content:** "Alex Rivera · Cashier · Lv. 3 · Morale 92% · $12.50/hr."
**States:** Terminating an employee opens a confirm modal (irreversible-feeling action, per [BACKEND_ARCHITECTURE.md §17](./BACKEND_ARCHITECTURE.md#17-error-handling) `ConflictError`-safe pattern) — the one Employee action that interrupts flow, deliberately, since it's the one action here with real consequence.
**Motion:** A new hire's card flips in from the candidate drawer (`motion-slow`, the Celebrate touch mentioned above) — small, but it's the one HR moment worth marking.

### 11.9 Settings

**Purpose:** Account, graphics, audio, accessibility, notification preferences.
**Register:** Operate.
**Layout:** Left-rail category nav (Account / Graphics / Audio / Accessibility / Notifications) + right content pane — standard settings-screen convention, deliberately unornamented so it gets out of the way.
**Key content:** Accessibility pane surfaces every control named in [FRONTEND_ARCHITECTURE.md §16](./FRONTEND_ARCHITECTURE.md#16-accessibility) directly — colorblind-safe theme toggle, reduced-motion override, text-scale slider — as first-class settings, not buried.
**States:** Changes apply live (theme swap, text scale) with an explicit `Saved` toast (§8.2 toast pattern) for anything that persists server-side (per [API_REFERENCE.md §2](./API_REFERENCE.md#2-users) `PATCH /users/me/settings`).
**Motion:** None beyond standard control feedback (§8.1 `motion-instant`/`motion-fast`) — Settings is the screen where predictability beats personality.

### 11.10 Profile

**Purpose:** Player identity — public-facing and self-facing.
**Register:** Celebrate.
**Layout:** Header band (avatar, display name, join date, level), stat summary row (Total Revenue, Stores Owned, Achievements, Guild), Achievement showcase (pinned highlights, per [FEATURE_LIST.md §10](./FEATURE_LIST.md#10-achievements)), activity feed (recent milestones).
**Key content:** "shopkeeper_mo · Joined Jul 2026 · Level 12 · 🏆 24 Achievements."
**States:** Viewing another player's public profile hides account-only fields (email, settings link) per the [API_REFERENCE.md §2](./API_REFERENCE.md#2-users) public-vs-private DTO split — same layout, fewer fields, not a different screen.
**Motion:** Avatar upload preview crossfades (`motion-base`) on selection before the confirm step.

### 11.11 Statistics

**Purpose:** Analytics — the "how am I actually doing" screen.
**Register:** Operate.
**Layout:** KPI stat-tile row (Revenue, Profit, Orders, Avg. Satisfaction — each a number + trend delta + sparkline) above a time-series chart (Revenue/Profit over selectable range, per [API_REFERENCE.md §10](./API_REFERENCE.md#10-analytics)) and a Top Products table. Charts follow the same design discipline as everything else: faint gridlines, an emphasized current-value endpoint, semantic color reserved for genuinely good/bad deltas (not decorative multi-color palettes).
**Key content:** Real trend data — "$412.30 · ▲ 6% vs. last week."
**States:** Insufficient data (new store, <7 days) shows a partial chart with a "Come back in N days for trends" note rather than a fabricated flat line.
**Motion:** Chart range switch crossfades the plotted line (`motion-base`); stat-tile deltas count up once on load, not on every poll.

### 11.12 Achievements

**Purpose:** Long-tail completionist goals.
**Register:** Celebrate.
**Layout:** Category tabs (Sales, Economy, Satisfaction, Store Building, Employees, Meta — per [FEATURE_LIST.md §10](./FEATURE_LIST.md#10-achievements)) above a responsive tile grid; each tile: icon (grayscale-and-dim if locked, full-color if unlocked), title, progress bar, tier ring (Bronze/Silver/Gold/Platinum as ring color, not badge shape — one consistent shape, four colors, per §2 discipline).
**Key content:** "Steady Seller · Sell 1,000 items · 1,000/1,000 · Silver — unlocked Jul 20."
**States:** Completed-but-unclaimed shows a pulsing Gold `Claim` button on the tile — the one place a UI element is allowed a continuous (not one-shot) animation, because it represents unclaimed value.
**Motion:** Claiming: tile flashes, icon un-desaturates, a small particle burst plays once (`motion-slow`, respects `useReducedMotion`) — the signature "you did it" moment, tuned to not overstay.

### 11.13 Daily Rewards

**Purpose:** The 7-day login streak calendar (modal, [PRD.md §13](./PRD.md#13-daily-rewards)).
**Register:** Celebrate, at its most concentrated.
**Layout:** Modal (`surface-overlay`), 7 cells in a single row (desktop) / 2 rows of 4 with a spacer (mobile), day 7 visually larger with a Gold border to signal the premium payout. Today's cell is highlighted and interactive; past cells show a checkmark; future cells are dimmed.
**Key content:** Real reward values per cell — "$50," "💎 5," "$120," etc., not generic gift-box icons alone.
**States:** Missed-day grace period (per [PRD.md §13.1](./PRD.md#131-structure)) shows the streak as paused, not reset, with a small "streak protected" note — reinforcing the no-punishment principle (§0.3).
**Motion:** Opening the modal: backdrop fades, calendar cards cascade in left-to-right (30ms stagger). Claiming today's cell: the cell flips (3D rotate, `motion-slow`) to reveal the reward, coins/gems arc toward the HUD currency chip they belong to (a *directional* cue reinforcing where the value landed) before the modal auto-dismisses.

### 11.14 Game Over → Day Summary

**Purpose:** MarketVerse has no hard fail state (§0.3, [PRD.md §7.4](./PRD.md#74-loans--risk-mid-game-system)) — so this screen is deliberately **not** a game-over. It's the end-of-day/end-of-session recap, reframed from a punitive checkpoint into a positive one. This reframing is a UX decision worth stating plainly: a screen named "Game Over" would contradict the product's entire "no punishing mechanics" pillar the moment a player saw it.
**Register:** Celebrate.
**Layout:** Full-screen (not modal) recap: headline stat (`display`, "Today's Take: $340"), a 4-stat grid (Customers Served, Items Sold, Satisfaction Avg, XP Gained), mission progress deltas, and a single primary CTA (`Continue to Tomorrow`) — always forward-facing language, never "restart" or "try again."
**Key content:** Even a *rough* day gets a constructive framing — if profit was negative, the headline stat still shows the real number (never hidden), but the supporting copy highlights what did go well ("Reputation held steady") rather than only the shortfall.
**States:** First session ever ends with an onboarding-flavored variant of this same screen (adds a "Here's what to try tomorrow" tip) instead of a separate screen.
**Motion:** Headline stat counts up (`motion-counter`, slower/more deliberate than the HUD's version — this is the one number in the whole app allowed to take a full second), stat grid cascades in after.

---

## 12. Summary — What Lives Where

| Concern | Mechanism | Section |
|---|---|---|
| Operational vs. celebratory screens never feel interchangeable | The Two Registers system — shared tokens, different application | §1.1 |
| A currency is identifiable by color alone across every screen | Fixed currency→color mapping, never reused for anything else | §2.4 |
| Text stays legible in both themes without exception | Contrast checked in CI against the token file itself | §2.5 |
| Dense tables don't jitter or shift on load/update | Skeleton rows at real height, tabular-nums, virtualization | §3.2, §11.5 |
| A player never mistakes a game-over for a genuine failure state | "Day Summary" reframing, forward-facing copy only | §11.14 |
| Reduced motion reaches the one place CSS can't (the canvas) | `useReducedMotion()` bridged into the Pixi scene | §8.3 |

*End of Document — v1.0*
