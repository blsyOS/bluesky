import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiry,
} from "./tokens";

/**
 * Server-side session store (BO-AUTH-01). Sessions live in the database
 * keyed by the SHA-256 hash of a random browser token. The cookie is
 * httpOnly + sameSite=lax; "remember me" persists it for 30 days, a
 * normal sign-in lasts 12 hours and ends with the browser session.
 */

export const SESSION_COOKIE = "bsky_session";

async function requestContext() {
  try {
    const h = await headers();
    return {
      ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: h.get("user-agent"),
    };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

/** Creates a session row and sets the browser cookie. */
export async function createSession(userId: string, rememberMe: boolean) {
  const token = generateSessionToken();
  const expiresAt = sessionExpiry(rememberMe);
  const { ipAddress, userAgent } = await requestContext();

  await db.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      rememberMe,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Remember-me cookies persist; otherwise the cookie ends with the
    // browser session (the DB row still expires after SESSION_HOURS).
    ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {}),
  });
}

/** Revokes the current browser session (if any) and clears the cookie. */
export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.updateMany({
      where: { tokenHash: hashSessionToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Revokes every session for a user. Used after password changes;
 * "log out all sessions" UI arrives with concurrent-session management.
 */
export async function revokeAllSessions(userId: string, exceptSessionId?: string) {
  await db.session.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
    },
    data: { revokedAt: new Date() },
  });
}
