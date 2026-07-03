import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { DashboardView } from "@/components/dashboards/dashboard-view";
import { DASHBOARDS } from "@/lib/dashboards/catalog";
import { resolveDefaultDashboard } from "@/lib/dashboards/roles";
import { loadPlatformStats } from "@/lib/dashboards/platform-stats";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * The operational landing page. The dashboard shown is chosen by the
 * user's role (resolveDefaultDashboard); platform is the default and the
 * only fully implemented surface today.
 */
export default async function DashboardPage() {
  const session = await getCurrentSession();
  const roleKeys = session.user.productRoles.map((pr) => pr.role.key);
  const dashboardId = resolveDefaultDashboard(roleKeys);

  if (dashboardId === "platform") {
    const stats = await loadPlatformStats(session.company.id);
    return (
      <>
        <PageHeader
          title={`Welcome back, ${session.user.firstName}`}
          description={`Here's what needs attention across ${session.company.name}.`}
        />
        <DashboardView dashboardId="platform" stats={stats} />
      </>
    );
  }

  const meta = DASHBOARDS[dashboardId];
  return (
    <>
      <PageHeader title={`${meta.title} dashboard`} description={meta.description} />
      <DashboardView dashboardId={dashboardId} />
    </>
  );
}
