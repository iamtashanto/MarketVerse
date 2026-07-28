# MarketVerse — Product Requirements Document

**Product:** MarketVerse — Browser-Based Supermarket Simulator
**Document Type:** Product Requirements Document (PRD)
**Status:** Draft v1.0
**Owner:** Product / Game Design
**Last Updated:** 2026-07-28
**Platform Target:** Web (desktop-first, responsive to tablet/mobile browser)

---

## 0. Document Control

| Field | Value |
|---|---|
| Author | Game Design & Architecture |
| Reviewers | Engineering Lead, Art Director, Economy Designer, Live Ops |
| Distribution | Internal — Founders, Engineering, Design, QA, Marketing |
| Related Docs | Technical Design Doc (TDD), Economy Balancing Sheet, Art Bible, Live Ops Calendar |

---

## 1. Vision

**MarketVerse** is a cozy-but-deep browser-based supermarket tycoon/simulation game where players build, manage, and grow their own supermarket empire — from a single struggling corner store to a multi-branch retail dynasty.

The vision is to combine three proven genres into one accessible, session-friendly package:

1. **Simulation depth** of tycoon games (stock management, pricing, logistics)
2. **Satisfying "job simulator" gameplay loops** (stocking shelves, scanning items, customer service) popularized by titles like *Supermarket Simulator*
3. **Idle/incremental progression** that respects a browser player's short session lengths and rewards return visits

MarketVerse should feel **immediately playable within 30 seconds** of loading (no install, no heavy onboarding), **satisfying in 5-minute sessions**, and **deep enough to retain players for months** through progression, customization, and social/competitive systems.

**North Star:** *"The supermarket that runs itself in your imagination, and comes alive in your browser."*

**Tagline candidates:**
- "Stock it. Sell it. Scale it."
- "Your store. Your rules. Your empire."

---

## 2. Goals

### 2.1 Business Goals

| Goal | Metric | Target (Year 1) |
|---|---|---|
| Acquire a broad casual audience | MAU (Monthly Active Users) | 500K+ |
| Establish retention comparable to top browser sims | D1 / D7 / D30 retention | 40% / 18% / 8% |
| Build sustainable monetization without pay-to-win | ARPDAU | $0.05–$0.12 |
| Prove viability for platform expansion (Steam/mobile) | Session length, D30 retention | Session ≥ 8 min avg |
| Establish MarketVerse as a live-service product | Content cadence | Bi-weekly live events |

### 2.2 Player-Facing Goals

- Deliver a **satisfying core loop** (receive → stock → sell → earn → upgrade) that feels good within the first 60 seconds.
- Give players a genuine sense of **ownership and creative expression** over their store's layout, branding, and growth path.
- Make **progression legible**: players should always know what they're working toward next.
- Support both **short bursts** (mobile-style checking in) and **long sessions** (deep management, optimization).
- Avoid punishing mechanics — no hard fail states, no permanent loss from short absences.

### 2.3 Design Pillars

1. **Instant Play, Infinite Depth** — zero-friction entry, near-limitless optimization ceiling.
2. **Your Store, Your Identity** — customization and layout as a core expression system, not a cosmetic afterthought.
3. **Respectful Monetization** — cosmetics, convenience, and time — never pay-to-win advantages that break economy balance.
4. **Systemic Satisfaction** — physical, tactile interactions (scanning, stacking, restocking) paired with numbers-go-up systemic progression.

---

## 3. Target Audience

### 3.1 Primary Audience

| Segment | Description | Motivation |
|---|---|---|
| **Casual Sim Fans** | Players of *Supermarket Simulator*, *Cliff House*, *Idle Miner Tycoon*, *Two Point Hospital*-adjacent titles | Relaxing management, satisfying loops, creative store design |
| **Browser Idle/Tycoon Players** | Fans of *Cookie Clicker*, *Adventure Capitalist*, *Melvor Idle* | Numbers-go-up progression, optimization, low-commitment sessions |
| **Cozy Game Audience** | Players of *Stardew Valley*, *Animal Crossing*-adjacent browser games | Low-stress, aesthetic, customization-driven play |

### 3.2 Secondary Audience

- Streamers/content creators seeking accessible, visually appealing management sims for browser-based content.
- Younger players (13+) drawn to job-simulation gameplay (stocking, scanning, checkout).
- Mobile-web players seeking "coffee break" idle-management games.

### 3.3 Personas

**"Maya, 24, Casual Commuter Gamer"**
Plays on her phone/tablet browser during commute and lunch breaks. Wants quick, satisfying sessions where she can restock, collect earnings, and set the next goal before closing the tab. Cares about store aesthetics and unlocking new decor.

**"Devon, 31, Idle-Game Optimizer"**
Spreadsheet-brain player who wants to min-max supply chains, pricing curves, and employee efficiency. Plays in long sessions on desktop, enjoys prestige/reset systems and leaderboard competition.

**"Priya, 16, Social Sim Player"**
Wants to show off her store to friends, visit their stores, and participate in seasonal events. Motivated by cosmetics, social features, and FOMO-driven limited content (handled ethically — see §14).

---

## 4. Core Gameplay

MarketVerse blends **direct manual action** (first-person or top-down interaction with the store) with **management/strategy layers** (menus, economy, staffing).

### 4.1 Core Verbs

| Verb | Description |
|---|---|
| **Order** | Purchase inventory from suppliers via a delivery/ordering interface |
| **Unload & Stock** | Physically move boxes from delivery area to shelves (drag-and-drop or click-to-place) |
| **Price** | Set/adjust prices per product or category |
| **Sell** | Serve customers at checkout (manual scan-and-bag or automated via employees) |
| **Expand** | Purchase new store space, aisles, or entire new store locations |
| **Decorate** | Customize shelving, flooring, signage, exterior for both aesthetics and functional bonuses |
| **Manage** | Hire/train/assign employees; monitor store health dashboards |
| **Optimize** | Reconfigure store layout for foot-traffic and efficiency gains |

### 4.2 Perspective & Interaction Model

- **Primary view:** Stylized top-down / isometric store view (performance-friendly for browser, broad compatibility, easy to read at a glance).
- **Secondary view:** Optional first-person "walk mode" for stocking shelves and interacting with customers directly (opt-in immersive mode, toggle-able for players who prefer pure top-down management).
- Controls: point-and-click / tap primary; WASD or drag-to-pan supported for desktop.

### 4.3 Feedback & Juice

- Satisfying stacking/snap-to-shelf animations, scanner beep SFX, cash register "cha-ching," particle bursts on sales milestones.
- Clear visual read on store state at a glance: empty shelves flagged red, overstock flagged, queue length visible, customer satisfaction icons floating above shoppers.

---

## 5. Gameplay Loop

### 5.1 Core Loop (Minute-to-Minute)

```
 ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
 │  Order Stock │ --> │ Receive &    │ --> │  Price &    │ --> │  Serve        │
 │  from Supplier│     │ Stock Shelves│     │  Display    │     │  Customers    │
 └─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
        ^                                                             │
        │                                                             v
 ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
 │  Reinvest /  │ <-- │  Collect     │ <-- │  Track      │ <-- │  Earn Revenue │
 │  Upgrade     │     │  Profit      │     │  Analytics  │     │  & Tips       │
 └─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

### 5.2 Session Loop (Per Play Session, ~5–20 min)

1. **Login / Return** → collect offline earnings & idle production
2. **Check store health** → restock alerts, expired goods, employee status
3. **Fulfill active missions/daily tasks**
4. **Serve customers manually (optional) or let employees auto-run**
5. **Spend earned cash** → upgrades, inventory, decor
6. **Check progression** → level up, unlock new aisle/category/store
7. **Exit** → idle/offline systems continue at reduced efficiency

### 5.3 Meta Loop (Day-to-Day / Week-to-Week)

1. Daily login reward claimed
2. Daily & weekly missions cycle
3. Store level milestones unlock new mechanics (employees, new departments, second location)
4. Seasonal events introduce limited-time products, decor, and challenges
5. Prestige/franchise reset available at end-game for veteran players (see §7.4)

---

## 6. Player Progression

### 6.1 Progression Axes

| Axis | Description | Unlocks |
|---|---|---|
| **Store Level (XP)** | Earned via sales, missions, customer satisfaction | New aisles, categories, capacity caps, cosmetic slots |
| **Reputation / Stars** | Derived from customer satisfaction ratings | Foot traffic multiplier, premium customer archetypes, supplier discounts |
| **Net Worth** | Total cash + asset value | Leaderboard ranking, loan eligibility, franchise unlock |
| **Skill Trees** | Spend Skill Points (earned on level-up) across Operations / Marketing / Hospitality branches | Passive bonuses (faster restock, higher margins, employee efficiency) |
| **Collection/Mastery** | Selling cumulative units per product category | Category mastery bonuses, unique badges |

### 6.2 Progression Curve Philosophy

- **Early game (Levels 1–10):** Fast, dopamine-rich unlocks every 2–5 minutes of play. Teaches core loop.
- **Mid game (Levels 11–40):** Unlock cadence slows; introduces employees, second departments, layout optimization, missions/achievements as parallel progression.
- **Late game (Levels 41+):** Optimization-focused; prestige/franchise systems, leaderboards, multi-store management, rare cosmetics.

### 6.3 Skill Trees (Illustrative)

- **Operations:** Faster delivery times, bulk order discounts, reduced spoilage.
- **Marketing:** Increased foot traffic, better tip rates, ad campaigns for temporary customer surges.
- **Hospitality:** Faster checkout, higher customer patience, higher satisfaction-to-tip conversion.

### 6.4 Prestige / Franchise System

At Store Level cap (or by player choice), players may **"Franchise"** their store:
- Reset current store's level/cash in exchange for a permanent global multiplier (Franchise Points) and a cosmetic franchise badge.
- Unlocks ability to open **additional store locations** run semi-autonomously (idle income) rather than a hard reset — softer, more rewarding than punitive prestige loops.

---

## 7. Economy

### 7.1 Currency Design

| Currency | Type | Source | Sink |
|---|---|---|---|
| **Cash ($)** | Soft, primary | Sales, missions, idle income | Inventory orders, upgrades, employee wages, rent |
| **Gems 💎** | Premium/hard | Purchase, achievements, events, ads | Cosmetics, time-skips, premium unlocks, gem-exclusive decor |
| **Reputation Stars ⭐** | Soft, secondary | Customer satisfaction | Unlocks premium supplier tiers, prestige bonuses (non-purchasable) |
| **Franchise Points (FP)** | Meta-currency | Prestige resets | Permanent global multipliers, franchise-tier cosmetics |

### 7.2 Economic Loop

```
Supplier Cost --> Shelf Price --> Customer Purchase --> Cash + Tips --> Wages/Rent/Restock (sink) --> Net Profit --> Reinvestment
```

- **Dynamic pricing:** Players set prices per SKU; too high reduces customer satisfaction & purchase likelihood, too low erodes margin. Sweet-spot pricing is a core skill-expression mechanic.
- **Supply & demand fluctuation:** Supplier costs fluctuate daily (mild randomization + event-driven spikes) to keep purchasing decisions engaging.
- **Spoilage/expiry:** Perishables (produce, dairy, bakery) degrade over time, pushing players toward just-in-time ordering — a key depth/tension mechanic distinguishing MarketVerse from purely idle games.
- **Wages & rent:** Recurring soft-currency sinks that scale with store size, ensuring cash never becomes a purely idle accumulate-and-ignore resource.

### 7.3 Balancing Principles

- No system should allow a purely AFK/idle player to out-progress an actively engaged player in *relative* terms — active play always has a meaningful multiplier over idle/offline accrual (idle capped at e.g. 4–8 hours of offline earnings, diminishing beyond).
- Premium currency (Gems) never sold as a direct "win" — always convenience, cosmetics, or time compression (see §14 Monetization).
- All economy tuning parameters (prices, costs, spoilage rates, wage curves) live in a live-configurable balancing sheet/backend for rapid live-ops tuning without client redeploys.

### 7.4 Loans & Risk (Mid-game system)

- Players may take small business loans to accelerate expansion, repaid automatically from daily revenue with interest — introduces light financial-strategy decision-making without punishing failure (no bankruptcy/game-over state; worst case is slowed growth).

---

## 8. Store Upgrades

### 8.1 Upgrade Categories

| Category | Examples | Effect |
|---|---|---|
| **Structural** | Additional aisles, second floor, storage room, parking lot | Increases capacity, unlocks new departments |
| **Equipment** | Better registers (faster checkout), refrigeration (less spoilage), shelving (more SKU slots per aisle), self-checkout kiosks | Operational efficiency |
| **Aesthetic** | Flooring, wall themes, signage, lighting, exterior facades, seasonal decor | Customer satisfaction bonus + cosmetic expression |
| **Departmental** | Bakery, deli, pharmacy, electronics, floral, café corner | Unlocks new product categories & customer types |
| **Automation** | Auto-restocking shelves, conveyor systems, inventory scanners | Reduces manual micromanagement for veteran players |
| **Utility** | Expanded parking, cart return automation, better lighting/HVAC | Foot traffic & satisfaction multipliers |

### 8.2 Upgrade Acquisition Flow

Store Blueprint menu → select upgrade → pay cash/gems + meet level requirement → construction timer (short, skippable with gems) → upgrade live.

### 8.3 Layout Editor

- Free-form placement of shelving, registers, decor within owned floor space (grid-snapped for performance and clarity).
- "Efficiency Heatmap" overlay showing customer traffic flow, bottlenecks, and blind spots — ties creative layout design to measurable performance gains (a key differentiator/depth feature).

---

## 9. Inventory

### 9.1 Product System

- Hierarchical catalog: **Department → Category → Product → SKU variant** (e.g., Grocery → Snacks → Chips → Brand/Flavor variants).
- Each product has: cost price, suggested retail price, shelf life (perishable/non-perishable), popularity rating, unlock level.
- Launch catalog target: **150–250 products** across 8–10 departments for MVP, expanding via live ops.

### 9.2 Ordering & Delivery

- Supplier menu with tiered suppliers (Budget / Standard / Premium) offering cost-vs-quality tradeoffs.
- Scheduled delivery windows (e.g., truck arrives every N minutes/hours) requiring players to unload and shelve stock — this is the primary "physical" gameplay beat.
- Bulk-order discounts and auto-reorder subscriptions (unlockable convenience feature, later gated behind automation upgrades or premium).

### 9.3 Shelf & Stock Management

- Visual shelf-fill states (full/low/empty) drive both gameplay urgency and UI clarity.
- Overstock has diminishing returns (storage capacity limits, spoilage risk) to prevent "buy everything and forget" degenerate strategies.
- Inventory dashboard: sortable/filterable list view for players who prefer menu-driven optimization over physical shelf interaction (accessibility + supports Devon-persona optimizer playstyle).

### 9.4 Spoilage & Waste

- Perishables lose value/appeal over time; expired stock must be discarded (small cash penalty) or discounted via a "Clearance" mechanic — introduces a satisfying tension/puzzle layer and a natural teaching moment for demand forecasting.

---

## 10. Customer AI

### 10.1 Customer Archetypes

| Archetype | Behavior | Design Purpose |
|---|---|---|
| **Regular Shopper** | Predictable list-based shopping, moderate patience | Baseline traffic |
| **Bargain Hunter** | Seeks discounted/clearance items, price-sensitive | Rewards clearance/pricing strategy |
| **Impulse Buyer** | Drawn to endcap displays & promotions, buys extra items | Rewards store layout & merchandising |
| **VIP/Loyalty Customer** | High spend, high tip, requires high satisfaction to retain | Rewards reputation investment |
| **Rush Hour Crowd** | Arrives in waves during peak hours, low patience | Stress-tests checkout throughput & staffing |
| **Difficult Customer** | Complains, needs manager intervention (mini-interaction) | Light challenge/skill-check content |

### 10.2 AI Behavior Model

- **Utility-based decision system**: customers evaluate shelves based on product availability, price attractiveness, and personal "shopping list" needs, then pathfind via a simplified navmesh/grid to target items.
- **Patience meter**: depletes while queueing or searching for unavailable items; low patience → item abandonment or store exit (satisfaction penalty).
- **Satisfaction score**: composite of price fairness, item availability, checkout speed, store cleanliness/aesthetics, and employee friendliness — feeds directly into Reputation Stars (§6, §7).
- Crowd simulation kept lightweight for browser performance: capped concurrent active customer agents (scaling with store tier), pooled/recycled agent objects, simplified steering behavior rather than full physics.

### 10.3 Customer Interaction Points

- Shelf browsing & picking (autonomous)
- Checkout queueing and manual/automated scanning
- Optional direct interactions: greeting, complaint resolution, sampling stations (mini-games/quick-time light interactions for engagement variety)

---

## 11. Employee System

### 11.1 Roles

| Role | Function | Unlock Tier |
|---|---|---|
| **Stocker** | Auto-restocks shelves from storage | Early (Level ~5) |
| **Cashier** | Staffs registers, reduces queue time | Early (Level ~8) |
| **Manager** | Handles difficult customers, boosts nearby employee efficiency | Mid |
| **Butcher/Baker/Barista** | Staffs specialty department stations | Mid (with department unlocks) |
| **Cleaner/Janitor** | Maintains store cleanliness score | Mid |
| **Store Manager (NPC assistant)** | Automates entire store operation at reduced efficiency for idle/offline play | Late/Premium-adjacent |

### 11.2 Employee Attributes

- **Skill Level** (improves via XP/training, or instantly via cash-based training investment)
- **Speed / Efficiency**
- **Morale** (affects performance; raised via wages, breaks, workplace decor)
- **Specialization traits** (e.g., "Fast Learner," "People Person") — light roguelite-style variance for replay interest when hiring.

### 11.3 Management Mechanics

- Hiring via a candidate pool (refreshes periodically; cash cost + wage commitment).
- Scheduling: assign shifts/zones; automation upgrades reduce need for manual scheduling for casual players.
- Wage sink ties into economy balancing (§7) — employees are a cash sink that scales with automation benefit, core to mid/late-game decision-making.
- Employee happiness mini-system (break rooms, decor, fair wages) ties employee system back into the Store Upgrade / Decoration systems for cross-system synergy.

---

## 12. Achievements

### 12.1 Design Goals

- Provide **long-tail goals** beyond core leveling for completionist players.
- Surface **teaching moments** (e.g., "Sell your first 100 items," "Fully stock every shelf") to guide new players toward good practices.
- Reward with a mix of cash, gems (small amounts), cosmetic unlocks, and profile badges — never gate core progression behind achievements.

### 12.2 Categories

| Category | Example |
|---|---|
| **Sales Milestones** | "Sell 1,000 / 10,000 / 1,000,000 items" |
| **Economy Mastery** | "Earn $1M total revenue," "Maintain 90%+ margin for 7 days" |
| **Customer Satisfaction** | "Reach 5-star reputation," "Serve 500 VIP customers" |
| **Store Building** | "Unlock all departments," "Fully decorate a store" |
| **Employee Management** | "Hire 10 employees," "Reach max morale store-wide" |
| **Exploration/Meta** | "Complete first Franchise reset," "Open second location" |
| **Event/Seasonal** | Time-limited achievements tied to live events |

### 12.3 Presentation

- Dedicated Achievements panel with progress bars, categorized tabs, and rarity indicators (common/rare/legendary) to support social bragging/profile display.

---

## 13. Daily Rewards

### 13.1 Structure

- **7-day cycling reward calendar** (resets/escalates in value; day 7 = premium-tier reward), soft-punishing but not eliminating streak on a missed day (1-day grace period) to reduce anxiety-driven design.
- Escalating rewards: Cash → Inventory crates → Gems → Cosmetic item → rare Gem bundle on day 7.
- **Monthly login calendar** running in parallel for long-term retention hooks, themed seasonally.

### 13.2 Anti-Manipulation Considerations

- No countdown-anxiety dark patterns (e.g., no aggressive "you'll lose everything" messaging).
- Streak-restore available via modest gem cost or single rewarded ad — respectful monetization touchpoint, not exploitative.

---

## 14. Missions

### 14.1 Mission Types

| Type | Cadence | Example | Reward Scale |
|---|---|---|---|
| **Daily Tasks** | Refresh every 24h, 3–5 tasks | "Sell 20 dairy products," "Serve 15 customers with 90%+ satisfaction" | Small cash/XP |
| **Weekly Challenges** | Refresh every 7 days | "Earn $50,000," "Fully restock store 3 times" | Medium cash/gems |
| **Story/Campaign Missions** | Linear, one-time | "Open your second checkout lane," "Hire your first employee" | Unlocks + narrative beats |
| **Seasonal Event Missions** | Time-limited (2–3 weeks) | Themed objectives tied to live events (Holiday Rush, Summer BBQ) | Exclusive cosmetics |
| **Community/Guild Missions** (post-MVP) | Rolling | Server/guild-wide collective goals | Shared reward pool |

### 14.2 Mission System Design Notes

- Mission board UI with claimable rewards, progress tracking, and re-roll option (limited free re-rolls/day, gem-cost beyond that).
- Missions double as an onboarding/tutorial delivery mechanism in early game (guided-task funnel).

---

## 15. Premium Features

> Premium features are **convenience and expression**, never power. See Monetization (§17) for pricing model.

| Feature | Description |
|---|---|
| **VIP Membership (subscription)** | Daily gem stipend, idle-earnings cap increase, exclusive cosmetic rotation, cosmetic name badge |
| **Cosmetic Store Themes** | Fully premium decor sets (e.g., "Retro Diner Mart," "Futuristic Mega-Store") |
| **Time-Skip Tokens** | Instantly complete construction/delivery timers (also earnable free, gem-purchasable for convenience) |
| **Extra Store Slots** | Own/manage more than the free-tier limit of store locations |
| **Custom Storefront Branding** | Upload/select custom logo, name styling, banner for social/leaderboard visibility |
| **Battle-Pass-style Season Pass** | Free + Premium reward tracks tied to seasonal missions (cosmetics-forward, optional bonus currency) |

---

## 16. Multiplayer Possibilities

MarketVerse launches as a **single-player-first** experience (see MVP, §18) with asynchronous and lightweight social features layered in, expanding toward deeper multiplayer post-launch.

### 16.1 Phase 1 — Asynchronous Social (Post-MVP, Near-term)

- **Store Visiting:** Browse and walk through friends'/leaderboard stores (read-only "tour mode"), leave a rating/like.
- **Leaderboards:** Regional/global/friends leaderboards by net worth, reputation, or weekly revenue.
- **Gifting:** Send small consumable gifts (cash bonus, inventory crate) to friends daily.

### 16.2 Phase 2 — Light Synchronous Features (Mid-term)

- **Guilds/Co-ops:** Join a "Retail Guild" with shared missions, guild chat, and cooperative leaderboard competitions.
- **Trading:** Limited player-to-player trading of cosmetic items or surplus inventory crates.

### 16.3 Phase 3 — Deep Multiplayer (Long-term / Exploratory)

- **Co-op Store Management:** Multiple players jointly manage a shared mega-store in real time (staffing division of labor).
- **Competitive Events:** Timed head-to-head sales competitions or regional "Supermarket Wars" leaderboards with seasonal prizes.
- **Player Marketplace:** Broader player-driven economy for trading rare cosmetics/decor.

*Note: All multiplayer features must be designed to preserve single-player viability — MarketVerse should never require other players to progress meaningfully, preserving accessibility for the casual solo audience (§3).*

---

## 17. Monetization

### 17.1 Model

**Free-to-Play with Ethical Monetization** — no purchasable pay-to-win advantage; monetization centers on **cosmetics, convenience, and time**.

### 17.2 Revenue Streams

| Stream | Description | Priority |
|---|---|---|
| **Gem Purchases (IAP)** | Tiered gem packs ($0.99–$99.99) | Primary |
| **VIP Subscription** | Monthly recurring, $4.99–$9.99/mo | Primary (retention + predictable revenue) |
| **Season Pass** | ~$7.99 per season (4–6 weeks), free track always available | Primary |
| **Rewarded Video Ads** | Opt-in only — doubles offline earnings, free re-rolls, bonus crate | Secondary (respects non-paying majority) |
| **Cosmetic Bundles** | Direct-purchase themed decor packs | Secondary |
| **Starter Packs** | One-time new-player value bundle (industry-standard conversion driver) | Secondary |

### 17.3 Monetization Principles (Guardrails)

1. **No pay-to-lose-avoidance:** since there are no hard failure states, there's nothing predatory to "rescue" players from.
2. **No loot boxes with gameplay-affecting randomized power** — cosmetic-only randomization if any gacha-style mechanic is used, with disclosed odds.
3. **Ads are always opt-in and rewarded**, never forced/interstitial interruptions during core play.
4. **Price anchoring transparency** — no dark-pattern countdown pressure selling.
5. **F2P players must be able to reach max functional progression** (all gameplay systems), just on a longer timescale than paying players — payment buys *speed and style*, not *ceiling*.

### 17.4 Target Monetization KPIs

| KPI | Target |
|---|---|
| Payer conversion rate | 3–6% |
| ARPPU (Average Revenue per Paying User) | $8–$15/mo |
| VIP subscription attach rate | 1–2% of MAU |

---

## 18. Technical Constraints

### 18.1 Platform & Delivery

- **Runtime:** Browser-based, HTML5. No install required; playable via direct URL.
- **Target Engine/Stack:** Recommend a lightweight 2D web-native stack — e.g., **PixiJS or Phaser 3** (2D rendering) for performance-friendly isometric/top-down rendering, or a **WebGL-based engine (e.g., Three.js for stylized 2.5D)** if a light 3D aesthetic is desired. Avoid full 3D engines (Unity WebGL/Unreal Pixel Streaming) for MVP due to load-time and performance overhead on browser/mobile-web.
- **Frontend Framework:** React/Vue/Svelte shell for UI/menus layered over canvas/WebGL game surface.
- **Backend:** Node.js (or similar) services for account/auth, save-state persistence, live-ops config, leaderboard, and economy backend; REST/WebSocket hybrid (WebSocket for real-time features like multiplayer visiting, presence).
- **Database:** Cloud-hosted (e.g., PostgreSQL for relational player/economy data + Redis for session/cache/leaderboard).
- **Hosting/CDN:** CDN-delivered static assets (sprites, audio) for fast global load times; autoscaling backend infrastructure (containerized, e.g., Kubernetes or managed serverless).

### 18.2 Performance Targets

| Metric | Target |
|---|---|
| Initial load time (first interactive) | < 5 seconds on broadband, < 12s on 4G mobile |
| Steady-state frame rate | 60 FPS desktop, 30 FPS minimum mobile-web |
| Max concurrent active customer AI agents rendered | 20–30 (scaled by device tier) |
| Client memory footprint | < 500MB active |
| Save/sync latency | < 1s round-trip for cloud save |

### 18.3 Compatibility

- **Browsers:** Latest 2 versions of Chrome, Firefox, Safari, Edge.
- **Devices:** Desktop-first; responsive layout supporting tablets and modern mobile browsers (portrait/landscape).
- **Accessibility:** Colorblind-safe UI palette options, scalable UI text, full mouse+keyboard and touch input parity, subtitle/caption support for any voiced content.
- **Offline/Reconnect handling:** Robust offline-earnings calculation and conflict-safe save reconciliation for intermittent connectivity (common in mobile-web contexts).

### 18.4 Data & Security

- Server-authoritative economy (no client-trusted currency/inventory writes) to prevent client-side save/currency tampering — critical given browser dev-tools accessibility.
- Rate-limiting and anti-bot protections on API endpoints (mission claim, daily reward, IAP validation).
- IAP receipt validation server-side (App Store/Play/Web payment provider webhook verification).
- GDPR/COPPA-conscious data handling given likely teen audience segment (§3.3) — minimal PII collection, parental-consent flows if age-gating requires.

### 18.5 Scalability Considerations

- Stateless backend services behind load balancer for horizontal scaling during traffic spikes (e.g., viral growth, event launches).
- Async job queue for non-real-time processing (offline earnings calculation, leaderboard aggregation).
- Feature-flag/live-config system to tune economy and roll out events without client redeploys.

---

## 19. MVP (Minimum Viable Product)

### 19.1 MVP Scope — Included

| System | MVP Scope |
|---|---|
| **Core Loop** | Order → Stock → Price → Sell → Earn (full loop functional) |
| **Store** | Single store, 3–4 aisles, top-down view |
| **Inventory** | 1 department (Grocery) fully realized, ~40–60 products |
| **Customer AI** | 2 archetypes (Regular Shopper, Bargain Hunter), basic pathfinding & satisfaction system |
| **Employees** | Stocker + Cashier roles only |
| **Progression** | Store Level 1–20, basic skill tree (Operations branch only) |
| **Economy** | Cash + Gems, spoilage system, dynamic supplier pricing |
| **Store Upgrades** | Structural (aisle expansion) + Equipment (registers, shelving) only |
| **Missions** | Daily tasks + linear onboarding/story missions |
| **Daily Rewards** | 7-day cycling calendar |
| **Achievements** | Core categories (Sales, Economy, Store Building) — ~25 achievements |
| **Monetization** | Gem purchases + starter pack + rewarded ads (no VIP/Season Pass yet) |
| **Multiplayer** | None (single-player only) — leaderboard (read-only, global net worth) as sole social touchpoint |
| **Platform** | Desktop browser (Chrome/Firefox/Safari/Edge), responsive tablet support |

### 19.2 Explicitly Out of Scope for MVP

- Multiple store locations / Franchise system
- Guilds, trading, co-op multiplayer
- Additional departments beyond Grocery (Bakery, Deli, Pharmacy, etc.)
- VIP subscription, Season Pass
- Manager/specialist employee roles
- Weekly challenges, seasonal events
- Layout Efficiency Heatmap (nice-to-have depth feature)
- Mobile native app wrapper

### 19.3 MVP Success Criteria

- D1 retention ≥ 30%, average session length ≥ 6 minutes.
- Core loop completion (first sale within first 3 minutes of play) ≥ 85% of new users.
- No P0/P1 economy exploits (server-authoritative validation holds under QA/pen-testing).
- Positive qualitative playtest feedback on "satisfyingness" of stocking/checkout interactions (target ≥ 4/5 average rating in playtest surveys).

---

## 20. Future Roadmap

### Phase 1 — Launch (Months 0–2 post-MVP)
- Polish MVP based on soft-launch data
- Add Bakery + Deli departments
- Introduce VIP Subscription & first Season Pass
- Weekly Challenges + expanded Achievements

### Phase 2 — Social Foundations (Months 3–5)
- Friend system, store visiting/tour mode
- Global + friends leaderboards (expanded categories)
- Gifting system
- Additional customer archetypes (Impulse Buyer, VIP Customer, Rush Hour)

### Phase 3 — Depth Expansion (Months 6–9)
- Manager/specialist employee roles, employee morale system
- Layout Efficiency Heatmap & advanced layout tools
- Second store location unlock + light multi-store management
- Pharmacy/Electronics/Floral departments
- Loans & financial risk system

### Phase 4 — Meta Progression & Live Ops Maturity (Months 9–12)
- Franchise/Prestige system
- Full seasonal event calendar (bi-weekly cadence) with themed limited content
- Guild system + guild missions
- Difficult Customer mini-game interactions

### Phase 5 — Multiplayer & Platform Expansion (Year 2+)
- Co-op real-time store management
- Player marketplace / cosmetic trading
- Competitive "Supermarket Wars" seasonal events
- Evaluate native mobile app / Steam packaging (e.g., via Electron/Capacitor wrapper) based on browser-proven retention & monetization data
- Evaluate UGC tools (custom store blueprints/sharing)

---

## 21. Success Metrics Summary (Cross-Reference)

| Metric | MVP Target | Year-1 Target |
|---|---|---|
| MAU | 20K (soft launch) | 500K+ |
| D1 / D7 / D30 Retention | 30% / 12% / 5% | 40% / 18% / 8% |
| Avg. Session Length | 6 min | 8+ min |
| Payer Conversion | 2% | 3–6% |
| ARPDAU | $0.02–$0.04 | $0.05–$0.12 |

---

## 22. Open Questions / Risks

| Risk | Mitigation |
|---|---|
| Browser performance ceiling for AI agent count / rendering fidelity | Aggressive agent pooling, LOD scaling by device tier, performance budget enforced in tech constraints (§18.2) |
| Economy exploitability (client-side tampering) | Server-authoritative economy mandatory from MVP (§18.4) |
| Idle vs. active play balance tension | Offline earnings cap + active-play multiplier design principle (§7.3) |
| Differentiation from existing Supermarket Simulator-likes | Lean into browser accessibility, social/visiting features, and layout-optimization depth as key differentiators |
| Monetization backlash risk (F2P fatigue) | Strict adherence to ethical monetization guardrails (§17.3); no pay-to-win, transparent odds, opt-in ads only |
| Scope creep beyond MVP | Hard MVP boundary (§19.2) enforced via phased roadmap gating |

---

*End of Document — v1.0*
