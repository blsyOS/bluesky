/**
 * Small client-side cookie writer for UI preferences (sidebar collapse,
 * active product). Lives outside components so React's immutability lint
 * rule doesn't flag the `document.cookie` assignment, and so the one-year
 * persistence policy is defined in a single place.
 */
const ONE_YEAR_SECONDS = 31_536_000;

export function setPreferenceCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}
