import type { ComponentType, ReactNode, SVGProps } from "react";

/**
 * BlueSky OS dashboard framework contracts.
 *
 * Same extension philosophy as search and notifications: modules register
 * DashboardProviders (dashboard definitions) and WidgetProviders (widget
 * definitions) with the DashboardRegistry. The engine never knows which
 * modules exist; providers never reference each other; a failing provider
 * is isolated and cannot break the dashboard.
 *
 * This build order ships the engine only — no real KPIs, no charts, no
 * drag-and-drop, no persistence.
 */

export type WidgetIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/** Grid footprint. Mobile always stacks; see components/dashboards. */
export type WidgetSize = "small" | "medium" | "large" | "wide";

/** Lifecycle/availability of a widget definition. */
export type WidgetStatus = "active" | "coming_soon" | "disabled";

/** Render state of a widget's body. */
export type WidgetState = "ready" | "loading" | "empty" | "error";

export type DashboardWidgetCategory = {
  /** Stable identifier, e.g. "operations", "activity". */
  id: string;
  label: string;
  /** Lower numbers render earlier as dashboard sections. */
  order?: number;
};

export type WidgetTrend = {
  direction: "up" | "down" | "flat";
  label: string;
};

export type WidgetMetric = {
  value: string | number;
  helper?: string;
  trend?: WidgetTrend;
};

/** Capabilities handed to a widget action when it runs. UI-agnostic. */
export type WidgetActionContext = {
  navigate: (href: string) => void;
  notify: (message: string) => void;
  /** Re-runs provider loading for the whole dashboard. */
  refresh: () => void;
  /** Hides the widget for this session (no persistence yet). */
  hide: () => void;
  /** Opens the widget configuration placeholder. */
  configure: () => void;
};

export type WidgetAction = {
  id: string;
  label: string;
  perform: (ctx: WidgetActionContext) => void;
};

export type DashboardWidget = {
  /** Unique within the provider. */
  id: string;
  categoryId: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: WidgetIconComponent;
  size: WidgetSize;
  status: WidgetStatus;
  /** Body render state; defaults to "ready". */
  state?: WidgetState;
  /** Product key for accent tinting (see src/lib/accents.ts). */
  accentKey?: string;
  /** Lower numbers render earlier within a section. */
  order?: number;
  /** Headline number + trend, rendered by the card when present. */
  metric?: WidgetMetric;
  /** Custom body content (charts, lists, embedded components). */
  render?: () => ReactNode;
  footer?: string;
  /** ISO timestamp shown as "updated … ago". */
  timestamp?: string;
  href?: string;
  emptyMessage?: string;
  errorMessage?: string;
  /** Extra actions appended to the standard action menu. */
  actions?: WidgetAction[];
};

/**
 * Passed to widget providers when a dashboard loads. `data` is an open
 * bag the dashboard host fills (e.g. server-fetched stats); each provider
 * owns the shape of the keys it reads.
 */
export type DashboardContext = {
  /** Which dashboard is loading, e.g. "platform". */
  dashboardId: string;
  data?: Record<string, unknown>;
};

/** A dashboard surface a module contributes (title/description only for now). */
export type DashboardLayout = {
  id: string;
  title: string;
  description?: string;
};

export interface DashboardProvider {
  id: string;
  label: string;
  getDashboards(): DashboardLayout[];
}

export interface WidgetProvider {
  /** Stable identifier, e.g. "platform", "locate-os". */
  id: string;
  label: string;
  /** Categories this provider emits; auto-registered with the registry. */
  categories?: DashboardWidgetCategory[];
  getWidgets(
    context: DashboardContext
  ): Promise<DashboardWidget[]> | DashboardWidget[];
}

export type DashboardSectionData = {
  category: DashboardWidgetCategory;
  widgets: DashboardWidget[];
};
