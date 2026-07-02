import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGlyph } from "@/components/ui/product-card";
import {
  BoxesIcon,
  ScrollIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { getProductAccess } from "@/lib/access";
import { formatDateTime, humanizeAction } from "@/lib/format";

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
        take: 6,
      }),
    ]);

  const enabledProducts = products.filter((p) => p.enabledForCompany);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session.user.firstName}`}
        description={`Here's what's happening across ${session.company.name}.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Products enabled"
          value={enabledProducts.length}
          helper={`of ${products.length} available`}
          icon={<BoxesIcon />}
          href="/products"
        />
        <KpiCard
          title="Users"
          value={userCount}
          helper="in your company"
          icon={<UsersIcon />}
          href="/users"
        />
        <KpiCard
          title="Roles"
          value={roleCount}
          helper="system & custom"
          icon={<ShieldIcon />}
          href="/roles"
        />
        <KpiCard
          title="Audit events"
          value={auditCount}
          helper="recorded actions"
          icon={<ScrollIcon />}
          href="/audit-logs"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Your products"
            description="Products licensed to your company."
            actions={
              <Link
                href="/switcher"
                className="text-sm font-medium text-primary hover:underline"
              >
                Open switcher
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {enabledProducts.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-surface-muted/40"
              >
                <ProductGlyph
                  name={item.product.name}
                  productKey={item.product.key}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="truncate text-caption">
                    {item.product.description}
                  </p>
                </div>
                <StatusBadge status={item.licenseStatus ?? "disabled"} />
              </div>
            ))}
            {enabledProducts.length === 0 ? (
              <EmptyState
                title="No products enabled"
                description="Enable products for your company to see them here."
                icon={<BoxesIcon />}
              />
            ) : null}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent activity"
            description="Latest admin actions."
            actions={
              <Link
                href="/audit-logs"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            }
          />
          <CardBody className="space-y-4">
            {recentActivity.map((entry) => (
              <div key={entry.id} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {humanizeAction(entry.action)}
                  </p>
                  <p className="text-caption">{entry.description}</p>
                  <p className="mt-0.5 text-xs text-faint-foreground">
                    {formatDateTime(entry.createdAt)}
                    {entry.user
                      ? ` · ${entry.user.firstName} ${entry.user.lastName}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Admin actions will appear here as they happen."
                icon={<ScrollIcon />}
              />
            ) : null}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
