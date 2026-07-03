/**
 * Registers every built-in dashboard provider. Importing this module (from
 * the DashboardView client entry) wires the registry once. Future module
 * build orders add their own side-effect import here or in their entry.
 */
import "./platform";
import "./locate";
import "./storm";
import "./leak";
import "./dispatch";

import { DASHBOARDS, type DashboardId } from "../catalog";
import { dashboardRegistry } from "../registry";

/**
 * Dashboards named in the catalog that don't have a dedicated provider yet
 * (Fleet, Reports, and the role dashboards). Registering their
 * layouts lets role routing target them; with no widget provider they
 * render the engine's built-in empty state until their build orders land.
 */
const SCAFFOLD_ONLY: DashboardId[] = [
  "fleet",
  "reports",
  "executive",
  "manager",
  "supervisor",
  "dispatcher",
  "locator",
];

dashboardRegistry.registerDashboardProvider({
  id: "scaffold:dashboards",
  label: "Scaffold",
  getDashboards: () =>
    SCAFFOLD_ONLY.map((id) => ({
      id: DASHBOARDS[id].id,
      title: DASHBOARDS[id].title,
      description: DASHBOARDS[id].description,
    })),
});
