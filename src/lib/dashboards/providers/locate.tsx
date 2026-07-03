import {
  BoxesIcon,
  MapPinIcon,
  ScrollIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";
import { ActivityCenter } from "@/components/notifications/activity-center";
import { CORE_WIDGET_CATEGORIES } from "../categories";
import { DASHBOARDS } from "../catalog";
import { dashboardRegistry } from "../registry";
import type { DashboardWidget } from "../types";

/**
 * BlueSky Locate operational dashboard. Widgets cover Today's Tickets,
 * Ticket Status, Active Locators, Upcoming Due, and Damage Investigations —
 * the locating command view. None of these have a backend until the Locate
 * module ships, so each renders an empty state naming the source; the
 * Recent Activity widget reuses the ActivityCenter. No fabricated data.
 */

const C = CORE_WIDGET_CATEGORIES;
const meta = DASHBOARDS.locate;

function pending(
  id: string,
  title: string,
  categoryId: string,
  emptyMessage: string,
  order: number,
  icon = MapPinIcon
): DashboardWidget {
  return {
    id: `locate-${id}`,
    categoryId,
    title,
    icon,
    size: "small",
    status: "active",
    state: "empty",
    emptyMessage,
    accentKey: "LOCATE_OS",
    order,
  };
}

dashboardRegistry.registerDashboardProvider({
  id: "locate:dashboard",
  label: meta.title,
  getDashboards: () => [
    { id: meta.id, title: meta.title, description: meta.description },
  ],
});

dashboardRegistry.registerWidgetProvider({
  id: "locate",
  label: meta.title,
  categories: [C.OPERATIONS, C.QUALITY, C.ACTIVITY],
  getWidgets: ({ dashboardId }): DashboardWidget[] => {
    if (dashboardId !== "locate") return [];
    return [
      pending(
        "todays-tickets",
        "Today's tickets",
        C.OPERATIONS.id,
        "Received / completed / remaining counts arrive with the Locate ticketing module.",
        0,
        ScrollIcon
      ),
      pending(
        "ticket-status",
        "Ticket status",
        C.OPERATIONS.id,
        "New, assigned, in progress, completed, and delayed counts come from the Locate module.",
        1,
        BoxesIcon
      ),
      pending(
        "active-locators",
        "Active locators",
        C.OPERATIONS.id,
        "Online / working / offline field status connects with the Locate module.",
        2,
        UsersIcon
      ),
      pending(
        "upcoming-due",
        "Upcoming due",
        C.OPERATIONS.id,
        "Due today / tomorrow / overdue tracking arrives with the Locate module.",
        3,
        ScrollIcon
      ),
      pending(
        "damage-investigations",
        "Damage investigations",
        C.QUALITY.id,
        "Open / pending / closed investigations come from the Damage Investigations module.",
        0,
        ShieldIcon
      ),
      {
        id: "locate-recent-activity",
        categoryId: C.ACTIVITY.id,
        title: "Recent activity",
        subtitle: "Audit events across your company",
        icon: ScrollIcon,
        size: "wide",
        status: "active",
        accentKey: "LOCATE_OS",
        order: 0,
        href: "/audit-logs",
        render: () => (
          <ActivityCenter
            entries={[]}
            emptyTitle="No Locate activity yet"
            emptyDescription="Ticket and locator activity will appear here once the Locate module is online."
          />
        ),
      },
    ];
  },
});
