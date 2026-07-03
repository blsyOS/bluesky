"use client";

// Registers the platform dashboard + widget provider on import. Future
// modules add their own side-effect import in their module entry.
import "@/lib/dashboards/providers/platform";

import { Dashboard } from "@/components/dashboards/dashboard";
import {
  PLATFORM_DASHBOARD_ID,
  type PlatformDashboardData,
} from "@/lib/dashboards/providers/platform";

/**
 * Client host for the platform dashboard: the server page fetches the
 * seeded stats and hands them to the engine through DashboardContext.data.
 */
export function PlatformDashboard({ stats }: { stats: PlatformDashboardData }) {
  return (
    <Dashboard
      context={{ dashboardId: PLATFORM_DASHBOARD_ID, data: { platform: stats } }}
    />
  );
}
