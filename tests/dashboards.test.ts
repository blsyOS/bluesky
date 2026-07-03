import { test } from "node:test";
import assert from "node:assert/strict";
import { DashboardRegistry } from "../src/lib/dashboards/registry";
import type { DashboardWidget } from "../src/lib/dashboards/types";

function widget(
  partial: Partial<DashboardWidget> & { id: string }
): DashboardWidget {
  return {
    categoryId: "overview",
    title: partial.id,
    size: "small",
    status: "active",
    ...partial,
  };
}

const overview = { id: "overview", label: "Overview", order: 0 };
const activity = { id: "activity", label: "Activity", order: 90 };

test("registry with no providers reports empty", async () => {
  const registry = new DashboardRegistry();
  assert.equal(registry.hasWidgetProviders(), false);
  assert.deepEqual(await registry.loadSections({ dashboardId: "x" }), []);
});

test("widget providers register categories and group into ordered sections", async () => {
  const registry = new DashboardRegistry();
  registry.registerWidgetProvider({
    id: "b",
    label: "B",
    categories: [activity],
    getWidgets: async () => [widget({ id: "feed", categoryId: "activity" })],
  });
  registry.registerWidgetProvider({
    id: "a",
    label: "A",
    categories: [overview],
    getWidgets: () => [widget({ id: "kpi", categoryId: "overview" })],
  });

  const sections = await registry.loadSections({ dashboardId: "platform" });
  assert.deepEqual(
    sections.map((s) => s.category.id),
    ["overview", "activity"] // category order wins over registration order
  );
});

test("widgets sort by order within a section; disabled widgets are dropped", async () => {
  const registry = new DashboardRegistry();
  registry.registerWidgetProvider({
    id: "p",
    label: "P",
    categories: [overview],
    getWidgets: () => [
      widget({ id: "second", order: 2 }),
      widget({ id: "first", order: 1 }),
      widget({ id: "hidden", order: 0, status: "disabled" }),
      widget({ id: "soon", order: 3, status: "coming_soon" }),
    ],
  });
  const [section] = await registry.loadSections({ dashboardId: "x" });
  assert.deepEqual(
    section.widgets.map((w) => w.id),
    ["first", "second", "soon"] // disabled dropped, coming_soon kept
  );
});

test("a failing provider is isolated", async () => {
  const registry = new DashboardRegistry();
  registry.registerWidgetProvider({
    id: "ok",
    label: "OK",
    categories: [overview],
    getWidgets: () => [widget({ id: "survives" })],
  });
  registry.registerWidgetProvider({
    id: "broken",
    label: "Broken",
    getWidgets: () => Promise.reject(new Error("provider exploded")),
  });
  const sections = await registry.loadSections({ dashboardId: "x" });
  assert.equal(sections.length, 1);
  assert.equal(sections[0].widgets[0].id, "survives");
});

test("context reaches providers; unknown categories fall back to id labels", async () => {
  const registry = new DashboardRegistry();
  let seenDashboard = "";
  registry.registerWidgetProvider({
    id: "p",
    label: "P",
    getWidgets: (ctx) => {
      seenDashboard = ctx.dashboardId;
      const flag = (ctx.data?.flag as string) ?? "missing";
      return [widget({ id: `w-${flag}`, categoryId: "mystery" })];
    },
  });
  const sections = await registry.loadSections({
    dashboardId: "platform",
    data: { flag: "ok" },
  });
  assert.equal(seenDashboard, "platform");
  assert.equal(sections[0].category.label, "mystery");
  assert.equal(sections[0].widgets[0].id, "w-ok");
});

test("dashboard providers resolve layouts by id across providers", () => {
  const registry = new DashboardRegistry();
  registry.registerDashboardProvider({
    id: "a",
    label: "A",
    getDashboards: () => [{ id: "platform", title: "Company overview" }],
  });
  registry.registerDashboardProvider({
    id: "b",
    label: "B",
    getDashboards: () => [{ id: "locate", title: "LocateOS" }],
  });
  assert.equal(registry.getDashboard("locate")?.title, "LocateOS");
  assert.equal(registry.getDashboard("nope"), undefined);
});
