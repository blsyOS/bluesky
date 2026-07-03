import { isDashboardId, type DashboardId } from "./catalog";

/**
 * Role → default dashboard routing. The authenticated user's role decides
 * which dashboard they land on; future user preferences may override this,
 * but role selection is the default.
 *
 * Keys are role `key` values (see src/lib/constants.ts + future module
 * roles). Unknown roles fall back to the Platform command center.
 */
const ROLE_DASHBOARD: Record<string, DashboardId> = {
  // Seeded platform roles — all land on the operational command center.
  platform_admin: "platform",
  company_admin: "platform",
  manager: "platform",
  supervisor: "supervisor",
  tech: "platform",
  viewer: "platform",

  // Forward-looking module/role keys (their dashboards scaffold empty until
  // their build orders complete).
  executive: "platform",
  operations_manager: "platform",
  storm_manager: "storm",
  dispatcher: "dispatch",
  locator: "locate",
  leak_manager: "leak",
  fleet_manager: "fleet",
};

export const DEFAULT_DASHBOARD: DashboardId = "platform";

/**
 * More specific roles win when a user holds several. A role not listed here
 * resolves through ROLE_DASHBOARD (or the platform default).
 */
const ROLE_PRIORITY = [
  "dispatcher",
  "locator",
  "storm_manager",
  "leak_manager",
  "fleet_manager",
  "supervisor",
  "operations_manager",
  "manager",
  "executive",
  "company_admin",
  "platform_admin",
];

export function defaultDashboardForRole(roleKey?: string): DashboardId {
  if (!roleKey) return DEFAULT_DASHBOARD;
  return ROLE_DASHBOARD[roleKey] ?? DEFAULT_DASHBOARD;
}

/**
 * Resolves the landing dashboard for a user from their role keys. Picks the
 * highest-priority known role; falls back to the platform command center.
 */
export function resolveDefaultDashboard(roleKeys: string[]): DashboardId {
  for (const key of ROLE_PRIORITY) {
    if (roleKeys.includes(key)) return defaultDashboardForRole(key);
  }
  for (const key of roleKeys) {
    const mapped = defaultDashboardForRole(key);
    if (mapped !== DEFAULT_DASHBOARD) return mapped;
  }
  return DEFAULT_DASHBOARD;
}

/** Guard re-export so callers can validate a persisted preference later. */
export { isDashboardId };
