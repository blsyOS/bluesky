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

## BO-01.03F — BlueSky Locate Foundation & Product Navigation

- **Product navigation is config-driven** (`src/lib/products`): each product
  declares a `ProductNavConfig` and registers it; `resolveSidebar` builds the
  sidebar from the active product's sections plus a globally-appended
  Administration section. No hardcoded module nav; new products don't touch
  shared sidebar code.
- **Active product persists in a cookie** (`bsky_product`) read server-side
  in the layout, so SSR renders the correct product sidebar with no flash;
  the client `ProductContextSelector` switches context and navigates to the
  product's default landing. Configs are a client registry (icons are
  components); only the product id crosses the RSC boundary.
- **Feature flags gate optional modules** per product — Contacts is exclusive
  to BlueSky Locate via the `contacts` flag, so it never appears elsewhere.
- **Contacts is an operational directory, not a CRM**: a `Contact` model plus
  a typed taxonomy (`src/lib/contacts.ts`) of seven groups with subtypes;
  the UI reuses the shared table/form/card components and seeds no data.
- **Cookie writes centralized** in `src/lib/cookies.ts` (`setPreferenceCookie`)
  so the React immutability lint rule is satisfied and the persistence policy
  lives in one place (also adopted by the sidebar-collapse preference).
- **"Customers" removed** from the dashboard catalog — Contacts is a module
  page, not a scaffold dashboard.

## BO-01.03F.1 — Product Context Selector Cleanup

- **Product switching is an administrative action, not navigation**: the
  topbar selector was removed; switching lives only in Administration →
  Settings → Product Context. The sidebar shows the active product as
  read-only context.
- **Active-product state lifted into `ProductContextProvider`** (wrapping
  the shell in the app layout), so the Settings dropdown and the shell
  share one source of truth; cookie persistence and default-landing
  navigation live in the provider's `switchProduct`.

## BO-02.01A — Company Profile Foundation

- **Company data is normalized into focused satellites** rather than one
  wide table: `CompanyContactInfo` (1:1), `CompanyAddress` (1:n keyed by an
  open `type` string), `CompanyServiceTerritory` (1:1), and
  `CompanyFeatureFlag` (1:n keyed by an open `key` string). Address types
  and flag keys are constants in `src/lib/company.ts`, so future types/
  flags are one-line additions with no schema or UI-logic changes.
- **Company statuses became trial/active/suspended/archived** (settable)
  plus a derived display-only "expired"; `CompanyStatusBadge` is the one
  place statuses map to design-system tones.
- **Company administration is its own area** (`/company`, first entry in
  the global Administration nav) using the established secondary-tab
  pattern; /settings slimmed to workspace-level concerns and links there.
- **Branding integration starts small**: logo in the sidebar company card;
  favicon/email fields persist as placeholders for later theming epics.
- **List fields share one csv⇄JSON helper** (`src/lib/lists.ts`), adopted
  by both Contacts and Service Territory.

## BO-02.01B — Platform vs Organization Administration Scaffold

- **Two admin scopes, one mechanism**: `adminSectionsFor(access)` maps
  session permissions to sidebar sections — `company.manage` →
  Organization, `platform.manage` → Platform. `resolveSidebar` now
  appends an array of admin sections instead of one hard-coded section,
  so a future scope is a new section + one `AdminAccess` boolean.
- **Nav hiding is not security**: `requirePermission(key)`
  (`src/lib/authz.ts`) guards the `/platform` and `/company` layouts
  server-side and `notFound()`s without the permission, so direct URLs
  are blocked too.
- **Wording says "Organization", storage says `Company`**: all tenant-
  facing UI copy renamed; Prisma models and routes unchanged — renaming
  models would churn every query for zero behavioral gain.
- **BlueSky Locating is a normal tenant.** It licenses products like any
  customer; no special code paths. No separate dispatch portal in the
  MVP — if BlueSky dispatches for ABC Locating, those users operate
  inside ABC Locating's tenant. A cross-company dispatch command center
  is future scope. Platform staff differ only by holding
  `platform.manage`.
- **Scaffold discipline**: only `/platform/companies` reads real data
  (the one legitimate cross-tenant query); the other six pages are
  explicit placeholders listing planned functionality — no invented
  data. The secondary-tab pattern was extracted into a shared `TabNav`
  now used by Organization, Locate, and Platform.

## BO-02.01C — Organization Structure Foundation

- **One shared skeleton for every product**: `OrganizationLocation`,
  `Department`, `Team` (teams belong to departments; locations and
  departments are independent). Employees, dispatch, storm ops,
  scheduling, fleet, and QA/QC will reference these — nothing
  product-specific was built.
- **Types are constants, not schema**: location types, default
  departments, work weeks, and shift lengths live in
  `src/lib/organization.ts` (same pattern as address types and feature
  flags), so additions are one-line changes.
- **Defaults are offered, never seeded**: "Add default departments"
  creates only the missing ones on explicit admin action (audit-logged)
  — consistent with the no-invented-data rule.
- **Deactivate over delete**: rows toggle active/inactive because future
  operational records will reference them.
- **Future FK fields stay out of the schema**: manager, default
  location, team lead, and members arrive with the Employee model so
  they can be real foreign keys instead of placeholder strings.
- **Settings expansion, not a new store**: business/operations defaults
  (work week, business hours, default shift length) are new
  `CompanySettings` columns managed in a Business & operations panel on
  Organization → Preferences.

## BO-AUTH-01 — Authentication & Identity Foundation

- **Argon2id for password hashing** (argon2 package, library defaults):
  self-describing hashes allow future parameter upgrades without
  invalidating credentials.
- **Database sessions keyed by token hash**: the browser holds a random
  256-bit token; the DB stores only its SHA-256, so a leaked database
  cannot be replayed. 12-hour standard sessions, 30-day remember-me.
- **Two-layer route protection**: `src/proxy.ts` (Next 16 middleware)
  fast-fails cookie-less requests without touching the DB; real
  validation (expiry, revocation, user status) happens server-side in
  `getCurrentSession()`, which now redirects to /login — every existing
  call site keeps its non-null contract, so no page needed changes.
- **The seeded admin is gone**: the seed provisions the catalog only;
  the Initial Setup Wizard (/setup, available only while zero users
  exist) creates the platform administrator, first organization, and
  organization administrator, then permanently disables itself.
- **No account enumeration**: generic login errors; account status is
  revealed only after a correct password; reset requests always return
  the same message (and are audited when the account exists).
- **Password change revokes all other sessions**; policy (8+ chars,
  upper/lower/number/special) is a passed-in object so per-org
  overrides, expiration, and history are future drop-ins. MFA/SSO
  explicitly deferred.

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
