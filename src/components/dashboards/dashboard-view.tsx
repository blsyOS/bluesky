"use client";

// Registers every built-in dashboard/widget provider on import.
import "@/lib/dashboards/providers";

import { Dashboard } from "@/components/dashboards/dashboard";
import type { PlatformDashboardData } from "@/lib/dashboards/providers/platform";

/**
 * Client host for any dashboard. The server page resolves which dashboard
 * to show (by role or route) and passes platform stats when relevant; the
 * engine renders whatever widgets the registry has for that id, or the
 * empty state for scaffolded dashboards.
 */
export function DashboardView({
  dashboardId,
  stats,
}: {
  dashboardId: string;
  stats?: PlatformDashboardData;
}) {
  return (
    <Dashboard
      context={{ dashboardId, data: stats ? { platform: stats } : undefined }}
    />
  );
}
