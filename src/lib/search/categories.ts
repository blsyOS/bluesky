import type { SearchCategory } from "./types";

/**
 * Core platform categories. Modules may reuse these or register their own
 * through SearchRegistry.registerCategory / SearchProvider.categories —
 * adding a category never requires modifying existing code.
 */
export const CORE_CATEGORIES = {
  ACTIONS: { id: "actions", label: "Actions", order: 0 },
  PAGES: { id: "pages", label: "Pages", order: 10 },
  PRODUCTS: { id: "products", label: "Products", order: 20 },
  USERS: { id: "users", label: "Users", order: 30 },
  COMPANIES: { id: "companies", label: "Companies", order: 40 },
  PROJECTS: { id: "projects", label: "Projects", order: 50 },
  TICKETS: { id: "tickets", label: "Tickets", order: 60 },
  REPORTS: { id: "reports", label: "Reports", order: 70 },
  SETTINGS: { id: "settings", label: "Settings", order: 80 },
} as const satisfies Record<string, SearchCategory>;
