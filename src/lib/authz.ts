import { notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/session";

/**
 * Server-side permission guard for admin scopes (BO-02.01B).
 *
 * Platform Administration pages require `platform.manage`; Organization
 * Administration pages require `company.manage`. Pages a user cannot
 * access render the 404 surface rather than acknowledging they exist.
 */
export async function requirePermission(key: string) {
  const session = await getCurrentSession();
  if (!session.hasPermission(key)) notFound();
  return session;
}
