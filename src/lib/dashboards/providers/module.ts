import { DASHBOARDS, type DashboardId } from "../catalog";
import { dashboardRegistry } from "../registry";
import type {
  DashboardWidget,
  DashboardWidgetCategory,
  WidgetIconComponent,
} from "../types";

/**
 * Shared scaffolding for a not-yet-built module dashboard. Registers the
 * dashboard layout plus a widget provider that emits empty-state widgets
 * scoped to this dashboard id. No fake data — every widget renders its
 * empty state explaining that data connects when the module comes online.
 *
 * Module build orders replace `list` with real widget providers; the
 * registration surface stays identical.
 */
export type ModuleWidgetSpec = {
  id: string;
  title: string;
  categoryId: string;
  icon?: WidgetIconComponent;
  /** Why there's no data yet. */
  emptyMessage: string;
  accentKey?: string;
  order?: number;
};

export function registerModuleDashboard(options: {
  id: DashboardId;
  categories: DashboardWidgetCategory[];
  widgets: ModuleWidgetSpec[];
}): void {
  const meta = DASHBOARDS[options.id];

  dashboardRegistry.registerDashboardProvider({
    id: `${options.id}:dashboard`,
    label: meta.title,
    getDashboards: () => [
      { id: meta.id, title: meta.title, description: meta.description },
    ],
  });

  dashboardRegistry.registerWidgetProvider({
    id: options.id,
    label: meta.title,
    categories: options.categories,
    getWidgets: ({ dashboardId }): DashboardWidget[] => {
      if (dashboardId !== options.id) return [];
      return options.widgets.map((w, index) => ({
        id: `${options.id}-${w.id}`,
        categoryId: w.categoryId,
        title: w.title,
        icon: w.icon,
        size: "small",
        status: "active",
        state: "empty",
        emptyMessage: w.emptyMessage,
        accentKey: w.accentKey,
        order: w.order ?? index,
      }));
    },
  });
}
