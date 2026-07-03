import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DASHBOARDS,
  DASHBOARD_IDS,
  MODULE_NAV_IDS,
  isDashboardId,
} from "../src/lib/dashboards/catalog";
import {
  defaultDashboardForRole,
  resolveDefaultDashboard,
} from "../src/lib/dashboards/roles";
import { DashboardRegistry } from "../src/lib/dashboards/registry";
import type { DashboardWidget } from "../src/lib/dashboards/types";

// ── Catalog integrity ────────────────────────────────────────────────────

test("catalog registers every required dashboard id", () => {
  const required = [
    "platform",
    "locate",
    "storm",
    "leak",
    "dispatch",
    "fleet",
    "customers",
    "reports",
    "executive",
    "manager",
    "supervisor",
    "dispatcher",
    "locator",
  ];
  for (const id of required) {
    assert.ok(isDashboardId(id), `${id} is in the catalog`);
  }
  assert.equal(DASHBOARD_IDS.length, required.length);
  assert.equal(DASHBOARDS.platform.kind, "platform");
});

test("isDashboardId rejects unknown ids", () => {
  assert.equal(isDashboardId("nope"), false);
  assert.equal(isDashboardId("locate"), true);
});

test("module nav ids are all real module dashboards", () => {
  for (const id of MODULE_NAV_IDS) {
    assert.equal(DASHBOARDS[id].kind, "module");
  }
});

// ── Role-based routing ───────────────────────────────────────────────────

test("seeded platform roles land on the platform command center", () => {
  for (const role of ["platform_admin", "company_admin", "tech", "viewer"]) {
    assert.equal(defaultDashboardForRole(role), "platform");
  }
});

test("specialized roles route to their dashboards", () => {
  assert.equal(defaultDashboardForRole("dispatcher"), "dispatch");
  assert.equal(defaultDashboardForRole("locator"), "locate");
  assert.equal(defaultDashboardForRole("storm_manager"), "storm");
  assert.equal(defaultDashboardForRole("supervisor"), "supervisor");
});

test("unknown or missing roles fall back to platform", () => {
  assert.equal(defaultDashboardForRole("who_knows"), "platform");
  assert.equal(defaultDashboardForRole(undefined), "platform");
});

test("resolveDefaultDashboard picks the most specific role", () => {
  assert.equal(resolveDefaultDashboard(["platform_admin"]), "platform");
  assert.equal(resolveDefaultDashboard(["dispatcher"]), "dispatch");
  // dispatcher outranks manager
  assert.equal(resolveDefaultDashboard(["manager", "dispatcher"]), "dispatch");
  assert.equal(resolveDefaultDashboard([]), "platform");
});

// ── Empty module dashboards render (empty-state widgets, no fake data) ────

test("a scaffolded module dashboard yields empty-state widgets", async () => {
  const registry = new DashboardRegistry();
  registry.registerWidgetProvider({
    id: "locate",
    label: "Locate",
    categories: [{ id: "operations", label: "Operations", order: 10 }],
    getWidgets: ({ dashboardId }): DashboardWidget[] =>
      dashboardId !== "locate"
        ? []
        : [
            {
              id: "locate-active",
              categoryId: "operations",
              title: "Active tickets",
              size: "small",
              status: "active",
              state: "empty",
              emptyMessage: "Connects when the Locate module launches.",
            },
          ],
  });

  const sections = await registry.loadSections({ dashboardId: "locate" });
  assert.equal(sections.length, 1);
  const widget = sections[0].widgets[0];
  assert.equal(widget.state, "empty");
  assert.ok(widget.emptyMessage, "empty widget explains why there's no data");
  // No fabricated metric value on an empty widget.
  assert.equal(widget.metric, undefined);

  // A different dashboard id gets nothing from this provider.
  assert.deepEqual(await registry.loadSections({ dashboardId: "storm" }), []);
});
