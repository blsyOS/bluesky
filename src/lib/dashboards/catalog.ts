/**
 * The catalog of dashboards BlueSky OS knows about. Server-safe plain data
 * (no React, no registry) so routing, breadcrumbs, and tests can consume it
 * without pulling in client widget code.
 *
 * The runtime widget source is still the DashboardRegistry (BO-01.03D) —
 * this catalog only names the surfaces and their titles.
 *
 * kind:
 *   platform — the operational command center (fully implemented)
 *   module   — a product/module dashboard (scaffolded, empty-state)
 *   role     — a role-oriented dashboard (scaffolded, empty-state)
 */
export type DashboardKind = "platform" | "module" | "role";

export type DashboardMeta = {
  id: string;
  title: string;
  description: string;
  kind: DashboardKind;
};

export const DASHBOARDS = {
  platform: {
    id: "platform",
    title: "Platform",
    description: "Operational command center — what needs attention right now.",
    kind: "platform",
  },
  locate: {
    id: "locate",
    title: "Locate",
    description: "Utility locating operations.",
    kind: "module",
  },
  storm: {
    id: "storm",
    title: "Storm",
    description: "Storm response operations.",
    kind: "module",
  },
  leak: {
    id: "leak",
    title: "Leak",
    description: "Leak survey and detection operations.",
    kind: "module",
  },
  dispatch: {
    id: "dispatch",
    title: "Dispatch",
    description: "Work assignment and scheduling.",
    kind: "module",
  },
  fleet: {
    id: "fleet",
    title: "Fleet",
    description: "Vehicle and equipment operations.",
    kind: "module",
  },
  reports: {
    id: "reports",
    title: "Reports",
    description: "Cross-module reporting.",
    kind: "module",
  },
  executive: {
    id: "executive",
    title: "Executive",
    description: "Executive overview.",
    kind: "role",
  },
  manager: {
    id: "manager",
    title: "Manager",
    description: "Operations manager overview.",
    kind: "role",
  },
  supervisor: {
    id: "supervisor",
    title: "Supervisor",
    description: "Crew supervisor overview.",
    kind: "role",
  },
  dispatcher: {
    id: "dispatcher",
    title: "Dispatcher",
    description: "Dispatcher overview.",
    kind: "role",
  },
  locator: {
    id: "locator",
    title: "Locator",
    description: "Field locator overview.",
    kind: "role",
  },
} as const satisfies Record<string, DashboardMeta>;

export type DashboardId = keyof typeof DASHBOARDS;

export const DASHBOARD_IDS = Object.keys(DASHBOARDS) as DashboardId[];

export function isDashboardId(value: string): value is DashboardId {
  return value in DASHBOARDS;
}

/** Module dashboards shown as sidebar navigation entries, in order. */
export const MODULE_NAV_IDS = [
  "locate",
  "storm",
  "leak",
  "dispatch",
  "fleet",
  "reports",
] as const satisfies readonly DashboardId[];
