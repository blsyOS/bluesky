import type { DashboardWidgetCategory } from "./types";

/**
 * Core widget categories. Modules may reuse these or register their own
 * through DashboardRegistry.registerCategory / WidgetProvider.categories —
 * adding a category never requires modifying the dashboard engine.
 */
export const CORE_WIDGET_CATEGORIES = {
  OVERVIEW: { id: "overview", label: "Overview", order: 0 },
  OPERATIONS: { id: "operations", label: "Operations", order: 10 },
  PRODUCTS: { id: "products", label: "Products", order: 20 },
  QUALITY: { id: "quality", label: "Quality", order: 30 },
  SAFETY: { id: "safety", label: "Safety", order: 40 },
  PEOPLE: { id: "people", label: "People", order: 50 },
  TRAINING: { id: "training", label: "Training", order: 60 },
  FINANCIAL: { id: "financial", label: "Financial", order: 70 },
  SYSTEM: { id: "system", label: "System", order: 80 },
  ACTIVITY: { id: "activity", label: "Activity", order: 90 },
} as const satisfies Record<string, DashboardWidgetCategory>;
