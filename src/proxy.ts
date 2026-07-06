import { NextResponse, type NextRequest } from "next/server";

/**
 * Route protection (BO-AUTH-01). Optimistic check only: a missing
 * session cookie means the request can never be authenticated, so it is
 * redirected to /login without touching the database. Real session
 * validation (expiry, revocation, user status) happens server-side in
 * src/lib/session.ts on every request — a present-but-stale cookie
 * passes here and is rejected there.
 */

const SESSION_COOKIE = "bsky_session";

/** Routes reachable without authentication. */
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/setup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|svg|jpg|jpeg|webp|ico)$).*)"],
};
