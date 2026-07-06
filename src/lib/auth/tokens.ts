import { createHash, randomBytes } from "node:crypto";

/**
 * Session token primitives (BO-AUTH-01). The browser holds a random
 * 256-bit token; the database stores only its SHA-256 hash, so a leaked
 * database cannot be replayed as live sessions.
 *
 * Db-free by design so tests can exercise it directly.
 */

/** Idle/absolute lifetime for a standard sign-in. */
export const SESSION_HOURS = 12;
/** Extended lifetime when "Remember me" is checked. */
export const REMEMBER_ME_DAYS = 30;
/** lastActivityAt is rewritten at most this often to avoid write storms. */
export const ACTIVITY_TOUCH_MINUTES = 5;

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiry(rememberMe: boolean, from: Date = new Date()): Date {
  const ms = rememberMe
    ? REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000
    : SESSION_HOURS * 60 * 60 * 1000;
  return new Date(from.getTime() + ms);
}
