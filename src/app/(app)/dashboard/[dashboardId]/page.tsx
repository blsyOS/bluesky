import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { DashboardView } from "@/components/dashboards/dashboard-view";
import { DASHBOARDS, isDashboardId } from "@/lib/dashboards/catalog";
import { getCurrentSession } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dashboardId: string }>;
}): Promise<Metadata> {
  const { dashboardId } = await params;
  const meta = isDashboardId(dashboardId) ? DASHBOARDS[dashboardId] : null;
  return { title: meta ? `${meta.title} dashboard` : "Dashboard" };
}

/**
 * Renders a specific dashboard by id. Module and role dashboards are
 * scaffolded (empty-state) until their build orders complete; the platform
 * dashboard lives at /dashboard, so requests here redirect there.
 */
export default async function DashboardByIdPage({
  params,
}: {
  params: Promise<{ dashboardId: string }>;
}) {
  const { dashboardId } = await params;
  if (!isDashboardId(dashboardId)) notFound();
  if (dashboardId === "platform") redirect("/dashboard");

  const meta = DASHBOARDS[dashboardId];

  // The platform stats loader is only relevant to the platform dashboard;
  // scaffolded dashboards render empty-state widgets with no data.
  const session = await getCurrentSession();
  void session; // reserved for future per-dashboard access checks

  return (
    <>
      <PageHeader
        title={`${meta.title} dashboard`}
        description={meta.description}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: meta.title },
        ]}
      />
      <DashboardView dashboardId={dashboardId} />
    </>
  );
}
