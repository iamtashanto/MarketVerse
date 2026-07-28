# MarketVerse — Complete Feature List

**Companion to:** [PRD.md](./PRD.md)
**Status:** Draft v1.0 — Master Feature Backlog
**Purpose:** Exhaustive, categorized inventory of every feature MarketVerse should support across MVP and full commercial-grade live-service maturity. Not all items are MVP scope (see PRD §19) — this is the full target feature surface, to be scheduled across the roadmap (PRD §20).

**Legend:** `[MVP]` = required at launch · `[P1–P5]` = roadmap phase per PRD §20 · unmarked = backlog/exploratory

---

## 1. Gameplay

**Core Loop & Interaction**
- Order → Receive → Stock → Price → Sell → Earn core loop `[MVP]`
- Point-and-click / tap interaction model `[MVP]`
- Drag-and-drop stocking (box → shelf) `[MVP]`
- Optional first-person "walk mode" toggle
- Manual checkout scan-and-bag mini-interaction `[MVP]`
- Contextual interaction prompts (hover/tap highlights) `[MVP]`
- Quick-action toolbar (common actions pinned) `[P1]`
- Undo/redo for placement & pricing actions

**Camera & Controls**
- Top-down/isometric primary camera `[MVP]`
- Pan, zoom, rotate camera controls `[MVP]`
- Camera sensitivity & inversion settings
- Free camera / photo mode
- WASD + drag-pan desktop controls `[MVP]`
- Full touch-gesture support (pinch-zoom, tap-drag) `[MVP]`

**Time & Simulation**
- Day/night cycle `[MVP]`
- Store open/close hours configuration `[P1]`
- Time speed controls (pause, 1x/2x/3x) `[MVP]`
- Calendar system (day/week/season tracking) `[P1]`
- Weather system affecting foot traffic `[P2]`
- Random daily events (spills, breakage, inspections) `[P2]`

**Modes & Onboarding**
- Guided interactive tutorial `[MVP]`
- Contextual tooltips & help overlays `[MVP]`
- Replayable tutorial/help center `[P1]`
- Sandbox/creative mode (unlimited funds, layout testing) `[P2]`
- Difficulty presets (economy modifiers: Relaxed/Standard/Tycoon) `[P1]`
- Keyboard shortcut system (desktop) `[P1]`

---

## 2. Store

**Building & Layout**
- Grid-based floor plan editor `[MVP]`
- Wall, flooring, and ceiling customization `[P1]`
- Aisle & shelf placement with rotation/snapping `[MVP]`
- Checkout counter/register placement `[MVP]`
- Department zoning tools `[P1]`
- Multi-floor store support `[P3]`
- Store exterior customization (signage, entrance, parking lot) `[P1]`
- Store blueprint templates (starter presets) `[MVP]`
- Custom blueprint save/load & sharing `[P2]`
- Lighting system (placeable/ambient lighting, day-part variation) `[P2]`

**Store Identity**
- Store creation wizard (name, logo, branding) `[MVP]`
- Custom storefront branding (premium) `[P1]`
- Seasonal/thematic decoration sets `[P1]`

**Store Operations**
- Store expansion (purchase adjacent plots) `[MVP]`
- Cleanliness system (spills, trash, cleaning stations) `[P1]`
- Security system (cameras, anti-theft gates, security guard role) `[P2]`
- Store rating & public review display `[P1]`
- Layout Efficiency Heatmap overlay `[P3]`
- Multiple store locations / franchise management `[P3]`
- Store transfer/relocation tools `[P4]`

---

## 3. Inventory

- SKU-level stock tracking `[MVP]`
- Visual shelf-fill states (full/low/empty) `[MVP]`
- Manual restock ordering `[MVP]`
- Auto-reorder threshold configuration `[P1]`
- Bulk ordering with volume discounts `[MVP]`
- Category/department filtering & search `[MVP]`
- Per-SKU and bulk price-setting tools `[MVP]`
- Promotion tags (sale stickers, clearance markers, BOGO) `[P1]`
- Expiry/spoilage tracking with visual decay states `[MVP]`
- Shelf & store capacity limits `[MVP]`
- Stock transfer: warehouse ↔ shelf `[MVP]`
- Inventory valuation report `[P1]`
- Planogram/shelf-assignment tool (optimize placement) `[P2]`
- Out-of-stock & overstock alerts `[MVP]`
- Damaged/returned goods handling `[P2]`
- Barcode scan simulation at checkout `[MVP]`

---

## 4. Warehouse

- Dedicated warehouse/backroom storage space `[MVP]`
- Pallet/box stacking visual system `[MVP]`
- Storage capacity upgrades `[MVP]`
- Delivery truck arrival & unloading sequence `[MVP]`
- Delivery scheduling/time windows `[MVP]`
- Cart/dolly transport mechanic (manual stocking) `[MVP]`
- Warehouse worker role (auto-transport to shelves) `[P1]`
- Cold storage for perishables `[P1]`
- Warehouse zone organization (sorting by department) `[P2]`
- Overflow handling (reject/discount excess stock) `[P1]`
- Multi-warehouse support (multi-store, late game) `[P4]`
- Supply chain visualization dashboard `[P3]`

---

## 5. Products

- Master product catalog/database `[MVP]`
- Department → Category → Product → SKU hierarchy `[MVP]`
- Level-gated product unlock system `[MVP]`
- Product variants (brand, flavor, size, packaging) `[P1]`
- Tiered suppliers per product (Budget/Standard/Premium) `[MVP]`
- Product art, description, flavor text `[MVP]`
- Seasonal/limited-time products `[P2]`
- Product bundles & combo deals `[P1]`
- Product popularity/demand tracking `[MVP]`
- Custom store-brand products (unlockable, higher margin) `[P3]`
- Product collection/mastery system (cumulative sales badges) `[P2]`
- Product research/unlock tree `[P2]`
- Per-product spoilage rate & shelf-life tuning `[MVP]`
- New department unlocks (Bakery, Deli, Pharmacy, Electronics, Floral) `[P1–P3]`

---

## 6. Customers

**AI & Simulation**
- Utility-based shopping-list AI `[MVP]`
- Grid/navmesh pathfinding to target shelves `[MVP]`
- Patience meter (queue & search abandonment) `[MVP]`
- Satisfaction scoring (price, availability, speed, cleanliness) `[MVP]`
- Checkout queueing simulation `[MVP]`
- Peak-hour / rush-wave traffic simulation `[P1]`
- Agent pooling & LOD scaling for performance `[MVP]`

**Archetypes & Variety**
- Regular Shopper archetype `[MVP]`
- Bargain Hunter archetype `[MVP]`
- Impulse Buyer archetype `[P1]`
- VIP/Loyalty Customer archetype `[P1]`
- Difficult Customer (complaint/manager-intervention) archetype `[P4]`
- Rare/special/named customer visits (easter eggs) `[P2]`
- Visual appearance variety pool (avoid repetition) `[P1]`

**Engagement & Feedback**
- Customer emotion indicators (floating icons) `[MVP]`
- Customer reviews & ratings feed `[P1]`
- Customer loyalty/VIP program `[P2]`
- Theft/shoplifting mechanic (security counterplay) `[P2]`
- Post-visit feedback/survey system `[P2]`
- Customer segmentation analytics (see §9) `[P2]`

---

## 7. Employees

- Hiring system with candidate pool & resumes `[MVP]`
- Core roles: Stocker, Cashier `[MVP]`
- Extended roles: Manager, Cleaner, Specialist (Butcher/Baker/Barista) `[P1–P2]`
- Store Manager NPC (automates idle/offline operations) `[P3]`
- Shift scheduling & zone assignment `[P1]`
- Employee skill/XP leveling `[MVP]`
- Employee training programs (cash-for-speed investment) `[P1]`
- Employee morale/happiness system `[P1]`
- Wage negotiation & payroll management `[MVP]`
- Randomized employee traits/perks (light roguelite variance) `[P1]`
- Break room / staff facilities (morale-boosting decor) `[P2]`
- Performance review & promotion system `[P2]`
- Firing/turnover mechanic `[P1]`
- Employee uniforms/cosmetic customization `[P2]`
- Auto-assign / AI zone management (automation upgrade) `[P2]`
- Employee-of-the-month recognition `[P3]`

---

## 8. Economy

- Multi-currency system: Cash, Gems, Reputation Stars, Franchise Points `[MVP–P4]`
- Dynamic supplier cost fluctuation `[MVP]`
- Price-elasticity demand model (customer response to pricing) `[MVP]`
- Profit margin calculator/UI `[MVP]`
- Recurring expenses: rent, utilities, wages `[MVP]`
- Small business loans with auto-repayment `[P1]`
- Insurance system (theft/damage protection) `[P3]`
- Economic events (supplier shortages, cost spikes) `[P2]`
- Franchise fees/royalties (multi-store) `[P3]`
- Currency conversion caps & sinks `[MVP]`
- Financial statements (P&L, balance sheet view) `[P1]`
- Budgeting/forecasting tools `[P2]`
- No hard bankruptcy/game-over — soft-fail growth slowdown only `[MVP]`
- Server-authoritative economy validation (anti-tamper) `[MVP]`

---

## 9. Analytics

**Player-Facing**
- Sales dashboard (daily/weekly/monthly) `[MVP]`
- Revenue & profit trend graphs `[MVP]`
- Best-seller / worst-seller reports `[P1]`
- Customer traffic heatmap `[P2]`
- Conversion rate tracking (browsers vs. buyers) `[P2]`
- Inventory turnover reports `[P1]`
- Waste/spoilage reports `[P1]`
- Satisfaction trend graphs `[P1]`
- Employee performance analytics `[P2]`
- Predictive restock suggestions (AI-assisted) `[P3]`
- Customizable KPI dashboard widgets `[P3]`
- Store-vs-store / week-vs-week comparison views `[P2]`

**Business/Internal (see also §16 Admin Panel)**
- Funnel analytics (acquisition → activation → retention → monetization) `[MVP, backend]`
- Cohort retention analysis `[MVP, backend]`
- A/B test result tracking `[P1, backend]`
- Economy health monitoring (inflation, sink/source ratios) `[MVP, backend]`

---

## 10. Achievements

- Tiered achievements (Bronze/Silver/Gold/Platinum) `[MVP]`
- Achievement categories: Sales, Economy, Satisfaction, Store Building, Employees, Meta `[MVP]`
- Progress-tracked achievement panel `[MVP]`
- Hidden/secret achievements `[P1]`
- Rewards: cash, gems, cosmetics, profile titles `[MVP]`
- Completionist meta-reward `[P2]`
- Achievement showcase on player profile `[P2]`
- Seasonal/event-exclusive achievements `[P2]`
- Rarity indicators (% of players who earned it) `[P2]`

---

## 11. Save System

- Interval-based auto-save `[MVP]`
- Manual save trigger `[MVP]`
- Save-on-exit / tab-close safeguard (`beforeunload` handling) `[MVP]`
- Save file versioning & schema migration `[MVP]`
- Multiple save-profile support per account `[P2]`
- Save integrity checks & corruption recovery `[MVP]`
- Local storage fallback for offline/guest play `[MVP]`
- Import/export save data (support & debugging) `[P2]`
- Cloud sync integration (see §20 Cloud Save) `[MVP]`

---

## 12. Audio

- Dynamic layered music (intensity scales with store activity) `[P1]`
- Full SFX library (scanner, register, footsteps, ambient chatter, notifications) `[MVP]`
- Master / Music / SFX / Ambient volume mixer `[MVP]`
- Global mute toggle `[MVP]`
- Positional/spatial audio for in-store sounds `[P2]`
- Seasonal/event music variants `[P2]`
- Light customer "barks" (non-verbal vocal stingers) `[P2]`
- Audio settings persistence across sessions `[MVP]`
- Captions for key audio cues (accessibility tie-in) `[MVP]`

---

## 13. Settings

- Graphics quality presets (Low/Med/High) for device tiers `[MVP]`
- Frame rate cap options `[P1]`
- UI scale slider `[MVP]`
- Control remapping (desktop) `[P2]`
- Language/localization selector `[MVP]`
- Notification preferences panel `[MVP]`
- Auto-save frequency configuration `[P1]`
- Camera sensitivity settings `[MVP]`
- Account settings (email, password, linked platforms) `[MVP]`
- Data/privacy controls (analytics opt-out, GDPR data export/delete) `[MVP]`
- Reset tutorial / restore defaults option `[P1]`

---

## 14. Accessibility

- Multiple colorblind modes (protanopia/deuteranopia/tritanopia palettes) `[MVP]`
- Colorblind-safe iconography (shape + color redundancy) `[MVP]`
- Text scaling / adjustable font size `[MVP]`
- High-contrast UI mode `[P1]`
- Dyslexia-friendly font option `[P2]`
- Full keyboard navigation (no-mouse play path) `[P1]`
- Screen-reader support / ARIA labeling `[P1]`
- Subtitles/captions for all audio cues `[MVP]`
- Reduced-motion mode (disable screen shake/heavy particles) `[MVP]`
- Adjustable simulation speed (processing-time accommodation) `[MVP]`
- Toggle vs. hold input mode options `[P1]`
- Adjustable click/tap target sizes `[P2]`

---

## 15. Multiplayer

*(Phased per PRD §16 — single-player fully viable without any of these)*

- Friend system: search, add, invite `[P1]`
- Store visiting / read-only tour mode `[P1]`
- Gifting system (daily small gifts to friends) `[P1]`
- Public player profiles `[P1]`
- Guild/co-op group creation & membership `[P2]`
- Guild chat (moderated) `[P2]`
- Guild shared missions & rewards pool `[P2]`
- Cosmetic trading between players `[P2]`
- Block/report/moderation tools `[P1]`
- Real-time co-op store management `[P4]`
- Competitive head-to-head sales events `[P4]`
- Player marketplace (broader trading economy) `[P5]`

---

## 16. Admin Panel

*(Internal/back-office tooling — not player-facing)*

- Live-ops web dashboard `[MVP, internal]`
- Economy config tool (live-tunable prices, costs, spoilage rates) `[MVP, internal]`
- Remote config & feature-flag system `[MVP, internal]`
- Player account lookup & support tools `[MVP, internal]`
- Ban/mute/moderation controls `[MVP, internal]`
- Refund & compensation issuance tools `[P1, internal]`
- Event scheduling & content management (no-redeploy content updates) `[P1, internal]`
- A/B testing framework `[P1, internal]`
- Push notification composer/scheduler `[P1, internal]`
- Server health & performance monitoring `[MVP, internal]`
- Fraud/exploit/anomaly detection alerts `[MVP, internal]`
- Business analytics aggregation dashboard `[MVP, internal]`
- Customer support ticket integration `[P1, internal]`
- Audit log of admin actions `[MVP, internal]`

---

## 17. Notifications

- In-game notification center/inbox `[MVP]`
- Restock & out-of-stock alerts `[MVP]`
- Mission & achievement completion alerts `[MVP]`
- Daily reward reminder `[MVP]`
- Employee issue alerts (low morale, absence, needs training) `[P1]`
- Event start/ending-soon reminders `[P1]`
- Friend activity notifications (gift received, visited store) `[P2]`
- Browser push notifications (opt-in) `[P1]`
- System/maintenance announcements `[MVP]`
- Notification history log `[P1]`
- Do-not-disturb / quiet-hours setting `[P1]`
- Notification batching (prevent spam/fatigue) `[MVP]`

---

## 18. Events

- Seasonal/holiday-themed events `[P1]`
- Time-limited event missions `[P1]`
- Event-exclusive currency `[P2]`
- Event shop/exchange for redeeming event currency `[P2]`
- Server-wide community goals `[P3]`
- Flash sales / surprise rush-hour events `[P2]`
- Random daily micro-events (spill, inspection, celebrity customer) `[P2]`
- Event-specific leaderboard with seasonal reset `[P2]`
- Event-exclusive cosmetics & products `[P1]`
- Live event calendar UI `[P1]`
- Event countdown & recap summary screens `[P2]`

---

## 19. Leaderboard

- Global leaderboard `[P1]`
- Friends-only leaderboard `[P1]`
- Regional/country leaderboard `[P2]`
- Category boards: Net Worth, Reputation, Weekly Revenue `[P1]`
- Guild leaderboard `[P2]`
- Seasonal/event leaderboard with periodic reset `[P2]`
- Top-rank rewards distribution `[P2]`
- Historical leaderboard archive (past seasons) `[P3]`
- Anti-cheat server-side leaderboard validation `[P1]`

---

## 20. Cloud Save

- Account-linked cloud sync `[MVP]`
- Cross-device continuity (desktop ↔ mobile browser) `[MVP]`
- Guest-to-account save migration `[P1]`
- Conflict resolution (most-recent-write / merge strategy) `[MVP]`
- Offline-to-online sync queue (handles disconnects) `[MVP]`
- Versioned save snapshots with rollback capability `[P1]`
- Cross-platform save compatibility (future native app parity) `[P4]`
- Save export for support/debugging purposes `[P2]`

---

## Summary Counts

| Category | MVP Features | Total Backlog Features |
|---|---|---|
| Gameplay | 12 | 24 |
| Store | 8 | 21 |
| Inventory | 12 | 16 |
| Warehouse | 6 | 12 |
| Products | 8 | 14 |
| Customers | 8 | 19 |
| Employees | 3 | 16 |
| Economy | 8 | 14 |
| Analytics | 4 | 16 |
| Achievements | 4 | 9 |
| Save System | 6 | 9 |
| Audio | 5 | 9 |
| Settings | 6 | 11 |
| Accessibility | 6 | 12 |
| Multiplayer | 0 | 12 |
| Admin Panel | 8 | 14 |
| Notifications | 6 | 12 |
| Events | 0 | 11 |
| Leaderboard | 0 | 9 |
| Cloud Save | 4 | 8 |
| **Total** | **~114** | **~268** |

*End of Document — v1.0*
