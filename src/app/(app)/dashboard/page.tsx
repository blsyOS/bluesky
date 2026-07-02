import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
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

  const stats = [
    { label: "Products enabled", value: enabledProducts.length, href: "/products" },
    { label: "Users", value: userCount, href: "/users" },
    { label: "Roles", value: roleCount, href: "/roles" },
    { label: "Audit events", value: auditCount, href: "/audit-logs" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session.user.firstName}`}
        description={`Here's what's happening across ${session.company.name}.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardBody>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
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
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
              >
                <span
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{
                    backgroundColor: item.product.accentColor ?? "#64748b",
                  }}
                >
                  {item.product.name.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.product.description}
                  </p>
                </div>
                <StatusBadge status={item.licenseStatus ?? "disabled"} />
              </div>
            ))}
            {enabledProducts.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No products enabled yet.
              </p>
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
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {humanizeAction(entry.action)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.description}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    {formatDateTime(entry.createdAt)}
                    {entry.user
                      ? ` · ${entry.user.firstName} ${entry.user.lastName}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No activity yet.
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
