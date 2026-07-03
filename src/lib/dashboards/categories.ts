import type { DashboardWidgetCategory } from "./types";

/**
 * Core widget categories. Modules may reuse these or register their own
 * through DashboardRegistry.registerCategory / WidgetProvider.categories —
 * adding a category never requires modifying the dashboard engine.
 *
 * Order matches the operational command-center layout: Operations first,
 * then System, Quality, and finally Activity.
 */
export const CORE_WIDGET_CATEGORIES = {
  OPERATIONS: { id: "operations", label: "Operations", order: 10 },
  SYSTEM: { id: "system", label: "System", order: 20 },
  QUALITY: { id: "quality", label: "Quality", order: 30 },
  SAFETY: { id: "safety", label: "Safety", order: 40 },
  PEOPLE: { id: "people", label: "People", order: 50 },
  TRAINING: { id: "training", label: "Training", order: 60 },
  FINANCIAL: { id: "financial", label: "Financial", order: 70 },
  ACTIVITY: { id: "activity", label: "Activity", order: 90 },
} as const satisfies Record<string, DashboardWidgetCategory>;
