import { db } from "@/lib/db";
import { humanizeAction } from "@/lib/format";
import type { PlatformDashboardData } from "./providers/platform";

/**
 * Server-side loader for the Platform dashboard. Sources only data the
 * platform genuinely has — audit-log activity — and never fabricates
 * operational metrics. Safe to import from server components only (pulls
 * in the database client).
 */
export async function loadPlatformStats(
  companyId: string
): Promise<PlatformDashboardData> {
  const recent = await db.auditLog.findMany({
    where: { companyId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return {
    activity: recent.map((entry) => ({
      id: entry.id,
      title: humanizeAction(entry.action),
      description: entry.user
        ? `${entry.description} — ${entry.user.firstName} ${entry.user.lastName}`
        : entry.description,
      timestamp: entry.createdAt.toISOString(),
    })),
    loadedAt: new Date().toISOString(),
  };
}
