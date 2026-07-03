import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PlatformDashboard } from "@/components/dashboards/platform-dashboard";
import type { PlatformDashboardData } from "@/lib/dashboards/providers/platform";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { getProductAccess } from "@/lib/access";
import { humanizeAction } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const companyId = session.company.id;

  const [products, userCount, roleCount, auditCount, recentActivity] =
    await Promise.all([
      getProductAccess(),
      db.user.count({ where: { companyId } }),
      db.role.count({
        where: { OR: [{ isSystemRole: true }, { companyId }] },
      }),
      db.auditLog.count({ where: { companyId } }),
      db.auditLog.findMany({
        where: { companyId },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const enabledProducts = products.filter((p) => p.enabledForCompany);

  const stats: PlatformDashboardData = {
    productsEnabled: enabledProducts.length,
    productsTotal: products.length,
    userCount,
    roleCount,
    auditCount,
    products: enabledProducts.map((item) => ({
      key: item.product.key,
      name: item.product.name,
      description: item.product.description,
      licenseStatus: item.licenseStatus ?? "disabled",
    })),
    activity: recentActivity.map((entry) => ({
      id: entry.id,
      title: humanizeAction(entry.action),
      description: entry.user
        ? `${entry.description} — ${entry.user.firstName} ${entry.user.lastName}`
        : entry.description,
      timestamp: entry.createdAt.toISOString(),
    })),
    loadedAt: new Date().toISOString(),
  };

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session.user.firstName}`}
        description={`Here's what's happening across ${session.company.name}.`}
      />
      <PlatformDashboard stats={stats} />
    </>
  );
}
