import { test } from "node:test";
import assert from "node:assert/strict";
import { ProductRegistry, resolveSidebar } from "../src/lib/products/registry";
import {
  ORG_SECTION,
  PLATFORM_SECTION,
  adminSectionsFor,
} from "../src/lib/products/admin-nav";
import type { NavSection, ProductNavConfig } from "../src/lib/products/types";
import {
  CONTACT_TYPES,
  contactSubtypeLabel,
  contactTypeLabel,
  isContactType,
} from "../src/lib/contacts";

// A stand-in icon (the registry/sidebar logic never renders it).
const Icon = (() => null) as unknown as ProductNavConfig["icon"];

const ADMIN: NavSection = {
  label: "Administration",
  items: [{ label: "Users", href: "/users", icon: Icon }],
};

function config(over: Partial<ProductNavConfig> = {}): ProductNavConfig {
  return {
    id: "locate",
    name: "BlueSky Locate",
    icon: Icon,
    defaultLanding: "/dashboard/locate",
    featureFlags: { contacts: true },
    sidebar: [
      {
        label: "Modules",
        items: [
          { label: "Locate", href: "/locate", icon: Icon },
          { label: "Contacts", href: "/contacts", icon: Icon, featureFlag: "contacts" },
        ],
      },
    ],
    ...over,
  };
}

// ── Registry + product switching ─────────────────────────────────────────

test("registry registers and lists products in order", () => {
  const reg = new ProductRegistry();
  reg.register(config({ id: "platform", name: "BlueSky OS", featureFlags: {} }));
  reg.register(config({ id: "locate" }));
  assert.deepEqual(reg.list().map((p) => p.id), ["platform", "locate"]);
  assert.equal(reg.get("locate")?.name, "BlueSky Locate");
  assert.equal(reg.has("storm"), false);
});

test("switching product changes the resolved landing", () => {
  const reg = new ProductRegistry();
  reg.register(config({ id: "platform", defaultLanding: "/dashboard", featureFlags: {} }));
  reg.register(config({ id: "locate", defaultLanding: "/dashboard/locate" }));
  assert.equal(reg.get("platform")?.defaultLanding, "/dashboard");
  assert.equal(reg.get("locate")?.defaultLanding, "/dashboard/locate");
});

// ── Config-driven sidebar + admin sections ───────────────────────────────

test("sidebar is product config plus appended admin sections", () => {
  const sections = resolveSidebar(config(), [ADMIN]);
  assert.equal(sections[sections.length - 1].label, "Administration");
  assert.ok(sections.some((s) => s.label === "Modules"));
});

test("Contacts appears when the feature flag is on", () => {
  const sections = resolveSidebar(config({ featureFlags: { contacts: true } }), [ADMIN]);
  const labels = sections.flatMap((s) => s.items.map((i) => i.label));
  assert.ok(labels.includes("Contacts"));
});

test("Contacts is hidden when the feature flag is off (exclusivity)", () => {
  const storm = config({
    id: "storm",
    name: "BlueSky Storm",
    featureFlags: {}, // no contacts flag
  });
  const sections = resolveSidebar(storm, [ADMIN]);
  const labels = sections.flatMap((s) => s.items.map((i) => i.label));
  assert.ok(!labels.includes("Contacts"), "Contacts must not appear without its flag");
  // Non-flagged entries still render.
  assert.ok(labels.includes("Locate"));
});

test("feature-flag gating drops empty sections", () => {
  const cfg = config({
    featureFlags: {}, // contacts off
    sidebar: [
      {
        label: "OnlyContacts",
        items: [
          { label: "Contacts", href: "/contacts", icon: Icon, featureFlag: "contacts" },
        ],
      },
    ],
  });
  const sections = resolveSidebar(cfg, [ADMIN]);
  assert.ok(!sections.some((s) => s.label === "OnlyContacts"));
});

// ── Permission-scoped admin sections (BO-02.01B) ─────────────────────────

test("org admins see Organization but not Platform", () => {
  const sections = adminSectionsFor({ organization: true, platform: false });
  assert.deepEqual(sections.map((s) => s.label), ["Organization"]);
});

test("platform admins see Organization then Platform", () => {
  const sections = adminSectionsFor({ organization: true, platform: true });
  assert.deepEqual(sections.map((s) => s.label), ["Organization", "Platform"]);
});

test("no admin permissions means no admin sections", () => {
  assert.deepEqual(adminSectionsFor({ organization: false, platform: false }), []);
});

test("Platform section routes live under /platform", () => {
  for (const item of PLATFORM_SECTION.items) {
    assert.ok(item.href.startsWith("/platform/"), `${item.label} → ${item.href}`);
  }
  // Organization items never point into /platform.
  for (const item of ORG_SECTION.items) {
    assert.ok(!item.href.startsWith("/platform"), `${item.label} → ${item.href}`);
  }
});

test("resolveSidebar appends multiple admin sections in order", () => {
  const sections = resolveSidebar(
    config(),
    adminSectionsFor({ organization: true, platform: true })
  );
  assert.deepEqual(sections.slice(-2).map((s) => s.label), [
    "Organization",
    "Platform",
  ]);
});

// ── Built-in product configs (integration) ───────────────────────────────

test("built-in configs: Contacts is exclusive to Locate", async () => {
  const { productRegistry } = await import("../src/lib/products/registry");
  await import("../src/lib/products/index");

  const hasContacts = (id: string) => {
    const cfg = productRegistry.get(id);
    if (!cfg) return false;
    return cfg.sidebar.some((s) =>
      s.items.some(
        (i) => i.href === "/contacts" && (!i.featureFlag || cfg.featureFlags[i.featureFlag])
      )
    );
  };

  assert.equal(hasContacts("locate"), true);
  assert.equal(hasContacts("storm"), false);
  assert.equal(hasContacts("leak"), false);
  assert.equal(hasContacts("platform"), false);
});

// ── Contact taxonomy ─────────────────────────────────────────────────────

test("contact types cover the required operational categories", () => {
  const ids = CONTACT_TYPES.map((g) => g.id);
  for (const required of [
    "utility_owner",
    "municipality",
    "contractor",
    "engineering_firm",
    "property_owner",
    "emergency",
    "internal",
  ]) {
    assert.ok(ids.includes(required), `${required} is a contact type`);
  }
});

test("contact type + subtype labels resolve", () => {
  assert.equal(contactTypeLabel("utility_owner"), "Utility Owners");
  assert.equal(contactSubtypeLabel("utility_owner", "gas"), "Gas");
  assert.equal(contactSubtypeLabel("utility_owner", undefined), undefined);
  assert.equal(isContactType("utility_owner"), true);
  assert.equal(isContactType("nope"), false);
});
