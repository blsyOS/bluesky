import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(__dirname, "dev.db")}`,
});
const db = new PrismaClient({ adapter });

const PRODUCTS = [
  {
    key: "LOCATE_OS",
    name: "LocateOS",
    description: "Utility locating operations for 811 ticket workflows.",
    accentColor: "#2563eb", // blue
  },
  {
    key: "LEAK_OS",
    name: "LeakOS",
    description: "Leak survey and detection project management.",
    accentColor: "#7c3aed", // purple
  },
  {
    key: "FIBER_OS",
    name: "FiberOS",
    description: "Fiber construction and inspection workflows.",
    accentColor: "#ea580c", // orange
  },
  {
    key: "SITE_VIEW",
    name: "SiteView",
    description: "Site records lookup and field documentation.",
    accentColor: "#16a34a", // green
  },
  {
    key: "COMMAND_CENTER",
    name: "BlueSky Command Center",
    description: "Cross-product operations visibility for leadership.",
    accentColor: "#374151", // charcoal
  },
] as const;

const SYSTEM_ROLES = [
  {
    key: "platform_admin",
    name: "Platform Admin",
    description: "Full access to the BlueSky OS platform and all products.",
  },
  {
    key: "company_admin",
    name: "Company Admin",
    description: "Manages company settings, users, roles, and products.",
  },
  {
    key: "manager",
    name: "Manager",
    description: "Manages teams and day-to-day operations.",
  },
  {
    key: "supervisor",
    name: "Supervisor",
    description: "Oversees field crews and reviews work.",
  },
  {
    key: "tech",
    name: "Tech",
    description: "Field technician performing assigned work.",
  },
  {
    key: "viewer",
    name: "Viewer",
    description: "Read-only access.",
  },
] as const;

const PERMISSIONS = [
  { key: "platform.manage", name: "Manage Platform", description: "Administer platform-level configuration and tenants." },
  { key: "company.manage", name: "Manage Company", description: "Update company profile and status." },
  { key: "products.manage", name: "Manage Products", description: "Enable or disable products for the company." },
  { key: "users.manage", name: "Manage Users", description: "Create, update, and manage user access." },
  { key: "roles.manage", name: "Manage Roles", description: "Manage roles and their permissions." },
  { key: "audit.view", name: "View Audit Logs", description: "View the company audit trail." },
  { key: "settings.manage", name: "Manage Settings", description: "Update company preferences and defaults." },
] as const;

// Which permissions each system role starts with.
const ROLE_PERMISSION_GRANTS: Record<string, readonly string[]> = {
  platform_admin: PERMISSIONS.map((p) => p.key),
  company_admin: [
    "company.manage",
    "products.manage",
    "users.manage",
    "roles.manage",
    "audit.view",
    "settings.manage",
  ],
  manager: ["users.manage", "audit.view"],
  supervisor: ["audit.view"],
  tech: [],
  viewer: [],
};

async function main() {
  console.log("Seeding BlueSky OS platform catalog...");

  // BO-AUTH-01: the seed provisions only the platform catalog — products,
  // permissions, and system roles. No tenant and no administrator are
  // seeded; the Initial Setup Wizard (/setup) creates the platform
  // administrator, the first organization, and its administrator.

  // Products
  const products = [];
  for (const p of PRODUCTS) {
    const product = await db.product.upsert({
      where: { key: p.key },
      update: { name: p.name, description: p.description, accentColor: p.accentColor },
      create: { ...p, status: "active" },
    });
    products.push(product);
  }
  console.log(`Products: ${products.map((p) => p.name).join(", ")}`);

  // Permissions
  const permissionsByKey = new Map<string, { id: string }>();
  for (const p of PERMISSIONS) {
    const permission = await db.permission.upsert({
      where: { key: p.key },
      update: { name: p.name, description: p.description },
      create: p,
    });
    permissionsByKey.set(p.key, permission);
  }
  console.log(`Permissions: ${PERMISSIONS.map((p) => p.key).join(", ")}`);

  // System roles (companyId/productId null => platform-wide system roles)
  const rolesByKey = new Map<string, { id: string }>();
  for (const r of SYSTEM_ROLES) {
    const existing = await db.role.findFirst({
      where: { key: r.key, companyId: null, productId: null },
    });
    const role = existing
      ? await db.role.update({
          where: { id: existing.id },
          data: { name: r.name, description: r.description, isSystemRole: true },
        })
      : await db.role.create({
          data: { ...r, isSystemRole: true },
        });
    rolesByKey.set(r.key, role);
  }
  console.log(`System roles: ${SYSTEM_ROLES.map((r) => r.name).join(", ")}`);

  // Role -> permission grants
  for (const [roleKey, permissionKeys] of Object.entries(ROLE_PERMISSION_GRANTS)) {
    const role = rolesByKey.get(roleKey);
    if (!role) continue;
    for (const permissionKey of permissionKeys) {
      const permission = permissionsByKey.get(permissionKey);
      if (!permission) continue;
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
  console.log("Role permissions assigned.");

  const userCount = await db.user.count();
  if (userCount === 0) {
    console.log(
      "No users exist yet — open the app to run the Initial Setup Wizard (/setup)."
    );
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
