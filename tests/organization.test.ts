import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_DEPARTMENTS,
  LOCATION_STATUSES,
  LOCATION_TYPES,
  SHIFT_LENGTHS_HOURS,
  TIMEZONES,
  WORK_WEEKS,
  locationTypeLabel,
  workWeekLabel,
} from "../src/lib/organization";
import { ORG_SECTION } from "../src/lib/products/admin-nav";

// ── Locations ────────────────────────────────────────────────────────────

test("location types cover the required operating locations", () => {
  const ids = LOCATION_TYPES.map((t) => t.id);
  for (const required of [
    "headquarters",
    "branch_office",
    "service_center",
    "operations_center",
    "utility_yard",
    "warehouse",
    "storm_office",
    "remote_office",
    "other",
  ]) {
    assert.ok(ids.includes(required), `${required} is a location type`);
  }
});

test("location type labels resolve (unknown ids pass through)", () => {
  assert.equal(locationTypeLabel("utility_yard"), "Utility Yard");
  assert.equal(locationTypeLabel("storm_office"), "Temporary Storm Office");
  assert.equal(locationTypeLabel("nope"), "nope");
});

test("location statuses are active/inactive", () => {
  assert.deepEqual([...LOCATION_STATUSES], ["active", "inactive"]);
});

// ── Departments ──────────────────────────────────────────────────────────

test("default departments match the platform set", () => {
  const names = DEFAULT_DEPARTMENTS.map((d) => d.name);
  assert.deepEqual(names, [
    "Operations",
    "Dispatch",
    "Field Operations",
    "Damage Prevention",
    "Leak Survey",
    "Fiber Construction",
    "Fleet",
    "Safety",
    "Administration",
    "Accounting",
    "Human Resources",
  ]);
  // Every default carries a description for the UI.
  for (const d of DEFAULT_DEPARTMENTS) {
    assert.ok(d.description.length > 0, `${d.name} has a description`);
  }
});

// ── Organization settings ────────────────────────────────────────────────

test("work weeks and shift lengths are the supported operating defaults", () => {
  assert.deepEqual(WORK_WEEKS.map((w) => w.id), [
    "monday_friday",
    "monday_saturday",
    "seven_day",
  ]);
  assert.equal(workWeekLabel("monday_friday"), "Monday – Friday");
  assert.deepEqual([...SHIFT_LENGTHS_HOURS], [8, 10, 12]);
  assert.ok(TIMEZONES.includes("America/Chicago"));
});

// ── Navigation (BO-02.01C) ───────────────────────────────────────────────

test("Organization admin nav contains the structure pages in order", () => {
  const labels = ORG_SECTION.items.map((i) => i.label);
  assert.deepEqual(labels, [
    "Organization",
    "Locations",
    "Departments",
    "Teams",
    "Products",
    "Users",
    "Roles & Permissions",
    "Audit Logs",
    "Settings",
  ]);
});
