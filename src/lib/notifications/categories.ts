import type { NotificationCategory } from "./types";

/**
 * Core notification categories. Modules may reuse these or register their
 * own through NotificationRegistry.registerCategory /
 * NotificationProvider.categories — adding a category never requires
 * modifying existing code.
 */
export const CORE_NOTIFICATION_CATEGORIES = {
  SYSTEM: { id: "system", label: "System", order: 0 },
  SAFETY: { id: "safety", label: "Safety", order: 10 },
  DISPATCH: { id: "dispatch", label: "Dispatch", order: 20 },
  QA_QC: { id: "qa-qc", label: "QA/QC", order: 30 },
  TRAINING: { id: "training", label: "Training", order: 40 },
  CLAIMS: { id: "claims", label: "Claims", order: 50 },
  PRODUCTS: { id: "products", label: "Products", order: 60 },
  UPDATES: { id: "updates", label: "Updates", order: 70 },
  GENERAL: { id: "general", label: "General", order: 80 },
} as const satisfies Record<string, NotificationCategory>;
