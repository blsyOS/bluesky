import {
  BoxesIcon,
  ScrollIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";
import { ActivityCenter } from "@/components/notifications/activity-center";
import { ProductGlyph } from "@/components/ui/product-card";
import { StatusBadge } from "@/components/ui/badge";
import type { ActivityEntry } from "@/lib/notifications/types";
import { CORE_WIDGET_CATEGORIES } from "../categories";
import { dashboardRegistry } from "../registry";
import type { DashboardWidget } from "../types";

/**
 * Built-in platform dashboard provider. Widgets surface data the platform
 * already has (seeded counts, products, audit activity) — the host page
 * fetches it server-side and passes it through DashboardContext.data.
 * This provider owns the shape of `data.platform`; the engine stays
 * generic. It also demonstrates coming-soon, empty, and error widget
 * states so future modules have a reference implementation.
 */

export const PLATFORM_DASHBOARD_ID = "platform";

export type PlatformDashboardData = {
  productsEnabled: number;
  productsTotal: number;
  userCount: number;
  roleCount: number;
  auditCount: number;
  products: Array<{
    key: string;
    name: string;
    description: string | null;
    licenseStatus: string;
  }>;
  /** Mapped from audit logs server-side; rendered via ActivityCenter. */
  activity: ActivityEntry[];
  loadedAt: string;
};

const C = CORE_WIDGET_CATEGORIES;

dashboardRegistry.registerDashboardProvider({
  id: "platform",
  label: "Platform",
  getDashboards: () => [
    {
      id: PLATFORM_DASHBOARD_ID,
      title: "Company overview",
      description: "Platform metrics and activity for your company.",
    },
  ],
});

dashboardRegistry.registerWidgetProvider({
  id: "platform",
  label: "Platform",
  categories: [C.OVERVIEW, C.PRODUCTS, C.SYSTEM, C.ACTIVITY, C.QUALITY],
  getWidgets({ dashboardId, data }) {
    if (dashboardId !== PLATFORM_DASHBOARD_ID) return [];
    const stats = data?.platform as PlatformDashboardData | undefined;
    if (!stats) return [];

    const widgets: DashboardWidget[] = [
      {
        id: "products-enabled",
        categoryId: C.OVERVIEW.id,
        title: "Products enabled",
        icon: BoxesIcon,
        size: "small",
        status: "active",
        order: 0,
        metric: {
          value: stats.productsEnabled,
          trend: {
            direction: stats.productsEnabled === stats.productsTotal ? "up" : "flat",
            label: `of ${stats.productsTotal} available`,
          },
        },
        href: "/products",
        timestamp: stats.loadedAt,
      },
      {
        id: "users",
        categoryId: C.OVERVIEW.id,
        title: "Users",
        icon: UsersIcon,
        size: "small",
        status: "active",
        order: 1,
        metric: { value: stats.userCount, helper: "in your company" },
        href: "/users",
        timestamp: stats.loadedAt,
      },
      {
        id: "roles",
        categoryId: C.OVERVIEW.id,
        title: "Roles",
        icon: ShieldIcon,
        size: "small",
        status: "active",
        order: 2,
        metric: { value: stats.roleCount, helper: "system & custom" },
        href: "/roles",
        timestamp: stats.loadedAt,
      },
      {
        id: "audit-activity",
        categoryId: C.OVERVIEW.id,
        title: "Audit activity",
        icon: ScrollIcon,
        size: "small",
        status: "active",
        order: 3,
        metric: { value: stats.auditCount, helper: "recorded actions" },
        href: "/audit-logs",
        timestamp: stats.loadedAt,
      },
      {
        id: "your-products",
        categoryId: C.PRODUCTS.id,
        title: "Your products",
        subtitle: "Licensed to your company",
        icon: BoxesIcon,
        size: "large",
        status: "active",
        order: 0,
        href: "/switcher",
        render: () => (
          <ul className="space-y-2.5">
            {stats.products.map((p) => (
              <li key={p.key} className="flex items-center gap-3">
                <ProductGlyph name={p.name} productKey={p.key} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-caption">{p.description}</p>
                </div>
                <StatusBadge status={p.licenseStatus} />
              </li>
            ))}
          </ul>
        ),
        footer: "Manage licenses on the Products page.",
      },
      {
        id: "performance-trends",
        categoryId: C.QUALITY.id,
        title: "Performance trends",
        description: "KPI charts arrive with the product module build orders.",
        icon: SparkleIcon,
        size: "medium",
        status: "coming_soon",
        accentKey: "COMMAND_CENTER",
        order: 0,
      },
      {
        id: "system-status",
        categoryId: C.SYSTEM.id,
        title: "System status",
        subtitle: "Incidents & service health",
        icon: SettingsIcon,
        size: "medium",
        status: "active",
        state: "empty",
        emptyMessage: "No incidents reported.",
        footer: "Service monitoring ships with the operations modules.",
        order: 0,
        timestamp: stats.loadedAt,
      },
      {
        id: "connected-services",
        categoryId: C.SYSTEM.id,
        title: "Connected services",
        subtitle: "Integration health",
        icon: SearchIcon,
        size: "medium",
        status: "active",
        state: "error",
        errorMessage:
          "No integrations are connected yet — this widget demonstrates the error state.",
        footer: "Integrations ship in a later phase.",
        order: 1,
        actions: [
          {
            id: "retry",
            label: "Retry",
            perform: (ctx) => ctx.refresh(),
          },
        ],
      },
      {
        id: "recent-activity",
        categoryId: C.ACTIVITY.id,
        title: "Recent activity",
        subtitle: "Latest admin actions",
        icon: ScrollIcon,
        size: "wide",
        status: "active",
        order: 0,
        href: "/audit-logs",
        timestamp: stats.loadedAt,
        render: () => (
          <ActivityCenter
            entries={stats.activity}
            emptyTitle="No activity yet"
            emptyDescription="Admin actions will appear here as they happen."
          />
        ),
      },
    ];
    return widgets;
  },
});
