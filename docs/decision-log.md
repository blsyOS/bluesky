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
