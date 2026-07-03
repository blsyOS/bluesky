# BlueSky OS — Architectural Decision Log

Append-only record of platform-level decisions. Newest entries last.

## BO-01.01 — Platform Foundation

- **Company is the top-level tenant object**; products are platform-owned
  and licensed per company via `CompanyProduct`; user access flows through
  `UserProductRole` only.
- **SQLite for local development** via Prisma driver adapters
  (better-sqlite3). No native enums — statuses are typed string constants
  in `src/lib/constants.ts` to keep the schema portable to PostgreSQL.
- **Placeholder session** pinned to the seeded platform admin in
  `src/lib/session.ts`; all actions and pages resolve identity through it
  so real auth is a one-file swap.
- **Audit logging is a helper, not middleware** (`src/lib/audit.ts`),
  called explicitly by each admin mutation.

## BO-01.01A — Foundation Polish

- **Two form-feedback patterns:** `useActionState` + inline errors for
  field-level validation (user invite); errors are returned as state, not
  thrown, so no 500 pages. Pure input parsing lives in
  `src/lib/validation.ts` for unit testing.
- **Unique constraints are the real duplicate guard**; pre-checks exist
  for friendly messages, with `P2002` fallback for races.

## BO-01.02 — Design System & Component Library

- **Tokens are CSS variables remapped by `.dark`**, exposed through
  Tailwind `@theme inline`; components consume utilities only.
- **Product accents are opt-in**: a generic `--accent` slot with
  `accentStyle(productKey)` scoping, keeping the platform neutral.
- **`ToastForm` wraps server-action forms** whose only feedback is
  success/failure; field-error forms keep `useActionState`.

## BO-01.03A — Application Navigation Framework

- **Sidebar collapse state persists in a cookie** read server-side in the
  layout, so SSR renders the saved state with no hydration flash.
- **Breadcrumbs auto-derive from the URL** (`AutoBreadcrumbs`), with
  product keys resolved to display names; `PageHeader` delegates manual
  crumbs to the same presentational component.
- **Shared popover hook (`usePopover`)** backs the product switcher and
  user menu; product availability wording is centralized in
  `describeAvailability()` (`src/lib/availability.ts`, kept database-free so client components can import it).
- **Topbar reserves growth slots**: center `data-slot="search"` for the
  future command palette/search, right cluster ordered for a notifications
  button.

## BO-01.03B — Global Search & Command Palette

- **Registry pattern for search**: a single `searchRegistry`
  (`src/lib/search/registry.ts`) that modules register
  providers/categories/quick actions into via side-effect imports;
  providers never know about each other, and queries fan out with
  `Promise.allSettled` so one failing provider can't break search.
- **Quick actions receive a UI-agnostic `QuickActionContext`**
  (`navigate/toggleTheme/notify/close`) instead of touching React or the
  router directly — actions stay unit-testable and portable.
- **The palette is code-split** (`next/dynamic`, `ssr: false`) behind
  `SearchLauncher`, which owns the single global instance and the ⌘K /
  Ctrl+K binding; the chunk loads on first open, keeping initial page
  load unaffected.
- **One document-level keyboard listener** (`src/lib/shortcuts.ts`
  ShortcutManager) dispatches all global shortcuts; components bind via
  `useGlobalShortcut` so bindings never stack duplicate listeners.
- **Recent searches sit behind a `RecentSearchStore` interface** with an
  intentionally non-persistent in-memory implementation; persistence is
  deferred to authenticated user preferences.

## BO-01.03C — Notification Framework & Activity Center

- **Same registry pattern as search**: a `notificationRegistry` singleton
  that modules register notification providers, activity providers, and
  categories into via side-effect imports; fan-out uses
  `Promise.allSettled` so a failing provider can't break the center.
- **Priorities are a fixed five-level scale** (critical/high/normal/low/
  information) with display metadata centralized in `PRIORITY_META`;
  categories are open-ended like search categories.
- **Center state is deliberately session-only**: `useNotificationCenter`
  owns read/pin/archive mutations in React state at the launcher level so
  the bell badge stays live; a persistence-backed store replaces the hook
  internals when authenticated preferences land.
- **Shared modal plumbing extracted**: `lib/focus-trap.ts` and
  `lib/use-modal-guards.ts` now back both the command palette and the
  notification drawer (the palette was refactored onto them — behavior
  identical, logic single-sourced).
- **Drawer animation via CSS keyframes** (`--animate-drawer-in`), not
  mount-state juggling, keeping the lazy-mounted drawer free of
  setState-in-effect patterns.

## BO-01.03D — Dashboard Framework

- **Third application of the registry pattern** (`dashboardRegistry`):
  dashboard providers and widget providers register via side-effect
  imports; `loadSections()` fans out with `Promise.allSettled`, drops
  `disabled` widgets, and orders by category then widget order.
- **Server data crosses into the engine through an open
  `DashboardContext.data` bag**: host pages fetch what their widgets need
  server-side; each provider owns the shape of the keys it reads (the
  platform provider exports `PlatformDashboardData`). The engine never
  learns module data shapes.
- **Widget sizes map to grid footprints** (small/medium/large/wide over a
  1/2/4-column responsive grid) rather than free-form layout — drag-and-
  drop and persistence are explicitly deferred.
- **The platform dashboard's activity widget reuses `ActivityCenter`**
  from BO-01.03C with audit-log entries mapped server-side; no second
  feed component exists.
- **Standard widget actions live in the card** (View Details / Refresh /
  Configure / Hide), with widget-defined actions prepended — modules add
  actions without touching the engine.

## BO-01.03E — Operational Dashboard Migration

- **The dashboard engine (BO-01.03D) is frozen as the platform standard**;
  this migration only added catalog/routing data, providers, and widget
  cleanup — no registry/grid/WidgetCard-architecture changes.
- **Server-safe dashboard catalog** (`src/lib/dashboards/catalog.ts`):
  plain data naming all 13 dashboards, consumed by routing, breadcrumbs,
  and tests without importing client widget code. The registry remains the
  runtime widget source.
- **Role → dashboard routing is pure and table-driven**
  (`resolveDefaultDashboard`), defaulting to the Platform command center;
  persistence/override is deferred to a user-preferences build order.
- **Platform dashboard shows operations, not a product catalog.** Products
  moved to the sidebar. Operational Operations/System/Quality widgets with
  no backend render honest empty states (no invented data); Activity reuses
  the BO-01.03C ActivityCenter with real audit entries.
- **Module dashboards scaffold via `registerModuleDashboard`** — empty-state
  widgets only, so a module build order swaps in a real widget provider
  without touching routing or the engine.
- **Widget cleanup**: removed the Configure placeholder and session-only
  Hide action (and their context methods) introduced for framework testing;
  kept View Details, Refresh, and Retry.

## Visual refresh (post BO-01.03B)

- **Light navigation shell**: the sidebar is light in light mode (white
  active "card" state, solid-accent icon tiles, neutral gray text) and
  dark in dark mode — all flowing through the existing `--sidebar-*`
  tokens, so no component knows which variant it renders. Product accent
  still tints the nav tiles inside `/launch/*`.
- **Pill shape language**: buttons and the topbar search trigger are
  fully rounded; the workspace canvas moved to a warm off-white with
  softer neutral borders. Table headers dropped the tinted uppercase
  style for plain gray labels. Purely token/classname changes — no
  behavior, markup structure, or API changes.
