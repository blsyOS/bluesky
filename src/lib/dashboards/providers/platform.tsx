import {
  BellIcon,
  BoxesIcon,
  ScrollIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";
import { ActivityCenter } from "@/components/notifications/activity-center";
import type { ActivityEntry } from "@/lib/notifications/types";
import { CORE_WIDGET_CATEGORIES } from "../categories";
import { dashboardRegistry } from "../registry";
import type { DashboardWidget, WidgetIconComponent } from "../types";

/**
 * The Platform dashboard is the operational command center — it answers
 * "what requires attention right now?", not "what products exist".
 *
 * The operational Operations/System/Quality metrics come from modules and
 * services that are not built yet, so those widgets render honest
 * empty states that explain when data will connect — no invented numbers.
 * The Activity section reuses the BO-01.03C ActivityCenter with real
 * audit-log entries the host page fetches server-side.
 */

export const PLATFORM_DASHBOARD_ID = "platform";

export type PlatformDashboardData = {
  /** Mapped from audit logs server-side; rendered via ActivityCenter. */
  activity: ActivityEntry[];
  loadedAt: string;
};

const C = CORE_WIDGET_CATEGORIES;

/** Builds an operational metric widget that has no data source yet. */
function pending(
  id: string,
  title: string,
  categoryId: string,
  icon: WidgetIconComponent,
  emptyMessage: string,
  order: number
): DashboardWidget {
  return {
    id,
    categoryId,
    title,
    icon,
    size: "small",
    status: "active",
    state: "empty",
    emptyMessage,
    order,
  };
}

dashboardRegistry.registerDashboardProvider({
  id: "platform:dashboard",
  label: "Platform",
  getDashboards: () => [
    {
      id: PLATFORM_DASHBOARD_ID,
      title: "Platform",
      description: "Operational command center for your company.",
    },
  ],
});

dashboardRegistry.registerWidgetProvider({
  id: "platform",
  label: "Platform",
  categories: [C.OPERATIONS, C.SYSTEM, C.QUALITY, C.ACTIVITY],
  getWidgets({ dashboardId, data }) {
    if (dashboardId !== PLATFORM_DASHBOARD_ID) return [];
    const stats = data?.platform as PlatformDashboardData | undefined;
    const activity = stats?.activity ?? [];

    return [
      // Operations — "what's happening in the field right now".
      pending(
        "active-jobs",
        "Active jobs",
        C.OPERATIONS.id,
        BoxesIcon,
        "Live job data connects with the Locate and Dispatch modules.",
        0
      ),
      pending(
        "active-users",
        "Active users",
        C.OPERATIONS.id,
        UsersIcon,
        "Live session tracking begins with the operations modules.",
        1
      ),
      pending(
        "todays-work",
        "Today's work",
        C.OPERATIONS.id,
        ScrollIcon,
        "Scheduled work appears once Dispatch is online.",
        2
      ),
      pending(
        "open-alerts",
        "Open alerts",
        C.OPERATIONS.id,
        BellIcon,
        "No alert sources are connected yet.",
        3
      ),

      // System — platform service health.
      pending(
        "api-health",
        "API health",
        C.SYSTEM.id,
        SettingsIcon,
        "Service telemetry connects with platform monitoring.",
        0
      ),
      pending(
        "queue-status",
        "Queue status",
        C.SYSTEM.id,
        BoxesIcon,
        "Background queue metrics are not reporting yet.",
        1
      ),
      pending(
        "notification-services",
        "Notification services",
        C.SYSTEM.id,
        BellIcon,
        "Delivery channels (email, SMS) are configured in a later phase.",
        2
      ),
      pending(
        "background-jobs",
        "Background jobs",
        C.SYSTEM.id,
        SearchIcon,
        "Job-runner metrics connect with platform monitoring.",
        3
      ),

      // Quality — processing integrity.
      pending(
        "failed-jobs",
        "Failed jobs",
        C.QUALITY.id,
        ShieldIcon,
        "Job outcomes report once background processing is online.",
        0
      ),
      pending(
        "validation-errors",
        "Validation errors",
        C.QUALITY.id,
        ShieldIcon,
        "Validation telemetry connects with the operations modules.",
        1
      ),
      pending(
        "sync-issues",
        "Sync issues",
        C.QUALITY.id,
        SearchIcon,
        "Integration sync health connects in a later phase.",
        2
      ),
      pending(
        "processing-errors",
        "Processing errors",
        C.QUALITY.id,
        ScrollIcon,
        "Error tracking connects with platform monitoring.",
        3
      ),

      // Activity — reuses the ActivityCenter with real audit data.
      {
        id: "recent-activity",
        categoryId: C.ACTIVITY.id,
        title: "Recent activity",
        subtitle: "Audit events across your company",
        icon: ScrollIcon,
        size: "wide",
        status: "active",
        order: 0,
        href: "/audit-logs",
        timestamp: stats?.loadedAt,
        render: () => (
          <ActivityCenter
            entries={activity}
            emptyTitle="No activity yet"
            emptyDescription="Admin actions and audit events will appear here."
          />
        ),
      },
    ];
  },
});
