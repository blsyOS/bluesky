import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth/session-store";
import { ACTIVITY_TOUCH_MINUTES, hashSessionToken } from "@/lib/auth/tokens";

/**
 * Session resolution (BO-AUTH-01). The browser token maps to a Session
 * row; the session must be unexpired and unrevoked and its user must be
 * active. Everything downstream (actions, pages, product switcher)
 * resolves user + company through this module only.
 *
 * - `getOptionalSession()` — null when unauthenticated (login/setup pages).
 * - `getCurrentSession()` — redirects to /login when unauthenticated, so
 *   every existing call site keeps its non-null contract.
 */
export const getOptionalSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const record = await db.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: {
      user: {
        include: {
          company: { include: { settings: true } },
          productRoles: {
            include: {
              role: { include: { permissions: { include: { permission: true } } } },
              product: true,
            },
          },
        },
      },
    },
  });

  if (!record) return null;
  const now = new Date();
  if (record.revokedAt || record.expiresAt <= now) return null;
  // Only Active users may hold a live session; a status change takes
  // effect on their next request.
  if (record.user.status !== "active") return null;

  // Sliding activity marker, throttled to avoid a write per request.
  if (
    now.getTime() - record.lastActivityAt.getTime() >
    ACTIVITY_TOUCH_MINUTES * 60 * 1000
  ) {
    await db.session.update({
      where: { id: record.id },
      data: { lastActivityAt: now },
    });
  }

  const user = record.user;
  const permissionKeys = new Set(
    user.productRoles.flatMap((pr) =>
      pr.role.permissions.map((rp) => rp.permission.key)
    )
  );

  return {
    sessionId: record.id,
    sessionLastActivityAt: record.lastActivityAt,
    user,
    company: user.company,
    permissionKeys,
    hasPermission: (key: string) => permissionKeys.has(key),
  };
});

export async function getCurrentSession() {
  const session = await getOptionalSession();
  if (!session) redirect("/login");
  return session;
}

export type Session = NonNullable<Awaited<ReturnType<typeof getOptionalSession>>>;

/**
 * True while the Initial Setup Wizard applies: no users exist yet. The
 * wizard creates the first (platform administrator) user, permanently
 * disabling itself unless the database is reset.
 */
export async function isSetupRequired(): Promise<boolean> {
  return (await db.user.count()) === 0;
}
