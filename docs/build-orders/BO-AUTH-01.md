# BO-AUTH-01 — Authentication & Identity Foundation

**Status:** Complete
**Epic:** 02 – Authentication & Identity
**Depends on:** Platform Foundation (Epic 01), Organization Foundation (Epic 02)

## Purpose

Replaces the temporary pinned-admin session with real, platform-wide
authentication. Every product consumes the same identity system;
authorization is unchanged and keeps flowing through the existing
permission architecture (`platform.manage`, `company.manage`, …).

## Authentication architecture

```
browser ──(bsky_session cookie: random 256-bit token)──▶ proxy.ts
   │            optimistic check: no cookie → /login
   ▼
src/lib/session.ts   getOptionalSession(): token → SHA-256 → Session row
   │                 must be unexpired + unrevoked + user status "active"
   ▼
getCurrentSession(): same, but redirects to /login — every existing
                     call site keeps its non-null contract
```

- **Passwords**: Argon2id (`argon2` package) with library defaults
  (64 MiB, 3 iterations). Hashes are self-describing, so parameters can
  be strengthened later without invalidating credentials. Plain-text
  passwords are never stored or logged.
- **Login** (`/login`): email + password + remember me, inline errors,
  pending state, forgot-password link. Errors are deliberately generic
  ("Invalid email or password.") — no account enumeration. A
  non-active status is only revealed *after* a correct password.
- **Logout**: revokes the server-side session, clears the cookie,
  audits, redirects to /login. Wired into both the sidebar card and the
  top-bar user menu.
- **Account status**: only `active` users authenticate — and a live
  session dies on the next request if the user's status changes.
  Status wording: `inactive` = Disabled, `invited` = Pending
  Invitation, `suspended` = Suspended (existing DB values are kept; no
  data migration).

## Session architecture

- `Session` table: `tokenHash` (SHA-256 of the browser token — a leaked
  database cannot be replayed), `rememberMe`, `expiresAt`,
  `lastActivityAt` (throttled to one write per 5 minutes),
  `revokedAt`, IP + user agent.
- **Standard sign-in**: 12-hour server-side expiry, cookie ends with
  the browser session. **Remember me**: 30 days, persistent cookie.
- Cookie: `bsky_session`, httpOnly, sameSite=lax, secure in
  production, path=/.
- `revokeAllSessions(userId, exceptSessionId?)` exists in the store:
  password changes already revoke every other session; the
  "Log out all sessions" button is a placeholder until
  concurrent-session management (future) adds visibility into sessions.
- Last login (User.lastLoginAt) and last activity are shown in
  Settings → Security.

## Route protection

Two layers, by design:

1. **`src/proxy.ts`** (Next 16's middleware): optimistic — requests
   without a session cookie can never be authenticated, so they redirect
   to /login without a database read. Public paths: `/login`,
   `/forgot-password`, `/reset-password`, `/setup`.
2. **Server-side validation** on every request: `getCurrentSession()`
   in the (app) layout/pages validates the token against the database
   (expiry, revocation, user status) and redirects; `requirePermission`
   continues to 404 unauthorized areas. A stale cookie passes the proxy
   and is rejected here — no redirect loops.

## Initial setup process

- The seed provisions the **catalog only**: products, permissions,
  system roles. No tenant, no administrator.
- While `User.count() === 0`, `/login` redirects to `/setup` — a
  three-step wizard: Organization → Platform Administrator →
  Organization Administrator. The org admin step offers "the platform
  administrator also manages this organization" (extra `company_admin`
  role grant) or creates a second user.
- The first organization is provisioned with the product catalog
  enabled (mirrors previous seed behavior; admins can disable products).
- The moment any user exists, `/setup` permanently redirects to
  `/login` (both the page and the server action re-check) — the wizard
  can only reappear if the database is reset.

## Password policy

`src/lib/auth/password-policy.ts`: minimum 8 characters, uppercase,
lowercase, number, special character. `validatePassword(password,
policy)` already takes a policy object, so per-organization overrides,
expiration, and history are future additions without call-site changes.
MFA is explicitly out of scope. The same policy is enforced in the
setup wizard and password change, with matching helper text.

## Audit logging

All auth events use the existing `recordAudit` pipeline:
`auth.login_succeeded`, `auth.login_failed` (wrong password or blocked
status), `auth.logout`, `auth.password_changed`,
`auth.password_reset_requested`, `auth.initial_setup_completed`.
Failed attempts against **unknown** emails are not audited — there is
no tenant to attribute them to; a platform-level security event sink is
future scope.

## Security decisions

- Token hashing (DB stores SHA-256, browser holds the only secret).
- Generic login errors; reset requests always return the same message.
- Password change requires the current password and revokes all other
  sessions.
- Reset-password is a placeholder page: token-based reset requires
  email delivery (future build order); administrators handle resets
  until then. The forgot-password form audits the request and reveals
  nothing.
- Proxy never trusts the cookie for authorization — it only fast-fails
  the definitely-unauthenticated.

## Changed existing functionality (documented per the build order)

- `getCurrentSession()` now authenticates for real and **redirects**
  instead of throwing when unauthenticated; its return shape is
  unchanged plus `sessionId`/`sessionLastActivityAt`.
- The seed no longer creates BlueSky Locating or the admin user (the
  wizard does); README updated.
- `/login` is a real form; sidebar and user-menu sign-out are real
  logout actions.
- Settings gained a Security panel (change password, last login/
  activity, logout-all placeholder).
- Users created by the existing invite flow have no password and status
  `invited` — they cannot sign in until invitation email integration
  (future) delivers credential setup.

## Known limitations

- No MFA, SSO, OAuth, SCIM, LDAP, API keys (explicitly out of scope).
- Reset emails/invitation emails are not sent; reset-password is a
  landing page until email integration.
- No rate limiting/lockout on failed logins yet — audit entries exist
  for future anomaly detection; recommend adding lockout with the
  security hardening build order.
- Session list UI ("log out all sessions", concurrent sessions) is a
  placeholder; the store already supports revocation.
