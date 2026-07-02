# BlueSky OS

Enterprise multi-tenant SaaS platform for utility field operations.

BlueSky OS is the parent platform. A **Company** (tenant) is the top-level
object and can license one or more **Products**:

- **LocateOS** — utility locating operations
- **LeakOS** — leak survey and detection
- **FiberOS** — fiber construction and inspection
- **SiteView** — site records lookup
- **BlueSky Command Center** — cross-product operations visibility

Users belong to one company, sign in once, and only see products their
company licenses **and** they hold a role on (via `UserProductRole`).

## This milestone (BO-01.01)

Multi-tenant platform foundation only — no product workflows yet:

- Company / Product / CompanyProduct licensing models
- User, Role, Permission, RolePermission, UserProductRole (RBAC foundation)
- AuditLog written automatically for major admin actions
- CompanySettings (timezone, formats, default theme)
- SaaS app shell: navy sidebar, product switcher, light/dark mode
- Pages: login (placeholder), dashboard, product switcher, products,
  users, roles & permissions, audit logs, settings

## Stack

- [Next.js](https://nextjs.org) (App Router, server actions)
- [Prisma](https://prisma.io) ORM with SQLite (via `better-sqlite3` adapter)
- [Tailwind CSS](https://tailwindcss.com) v4
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark mode

## Getting started

```bash
npm install

# Generate the Prisma client, create the SQLite database, and seed it
npm run db:setup

npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The seed provisions the
**BlueSky Locating** tenant (subdomain `bluesky`) with all five products
enabled, the system roles (Platform Admin, Company Admin, Manager,
Supervisor, Tech, Viewer), the initial permission set, and a platform admin
user (`admin@blueskyos.app`).

Authentication is a placeholder for now — the session is pinned to the
seeded platform admin in `src/lib/session.ts`.

## Project layout

```
prisma/               Schema + seed
src/lib/              db client, session, audit, access helpers, constants
src/lib/actions/      Server actions (companies, products, users, roles, audit)
src/components/       UI primitives and app shell
src/app/              Routes (login + authenticated app pages)
```

## Database scripts

| Script            | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `npm run db:setup`| Generate client, push schema, seed       |
| `npm run db:push` | Push schema changes to SQLite            |
| `npm run db:seed` | Re-run the (idempotent) seed             |
