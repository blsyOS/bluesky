"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { getCurrentSession } from "@/lib/session";
import {
  DEFAULT_DEPARTMENTS,
  LOCATION_STATUSES,
  LOCATION_TYPES,
  SHIFT_LENGTHS_HOURS,
  WORK_WEEKS,
} from "@/lib/organization";

/**
 * Organization structure actions (BO-02.01C): locations, departments,
 * teams, and business/operations settings. All mutations are scoped to
 * the current tenant, require organization administration, and write
 * audit-log entries.
 */

async function requireOrgAdmin() {
  const session = await getCurrentSession();
  if (!session.hasPermission("company.manage")) {
    throw new Error("You do not have permission to manage the organization.");
  }
  return session;
}

function text(formData: FormData, name: string): string | null {
  const v = String(formData.get(name) ?? "").trim();
  return v || null;
}

type ActionState = { error: string } | null;

// ── Locations ────────────────────────────────────────────────────────────

export async function createLocation(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireOrgAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Location name is required." };

  const type = String(formData.get("type") ?? "branch_office");
  if (!LOCATION_TYPES.some((t) => t.id === type)) {
    return { error: `Unknown location type: ${type}` };
  }
  const status = String(formData.get("status") ?? "active");
  if (!LOCATION_STATUSES.includes(status as (typeof LOCATION_STATUSES)[number])) {
    return { error: `Invalid location status: ${status}` };
  }

  const existing = await db.organizationLocation.findUnique({
    where: { companyId_name: { companyId: session.company.id, name } },
  });
  if (existing) {
    return { error: "A location with that name already exists." };
  }

  const location = await db.organizationLocation.create({
    data: {
      companyId: session.company.id,
      name,
      code: text(formData, "code"),
      type,
      status,
      description: text(formData, "description"),
      addressLine1: text(formData, "addressLine1"),
      addressLine2: text(formData, "addressLine2"),
      city: text(formData, "city"),
      state: text(formData, "state"),
      postalCode: text(formData, "postalCode"),
      country: text(formData, "country") ?? "USA",
      timezone: text(formData, "timezone"),
      businessHoursStart: text(formData, "businessHoursStart"),
      businessHoursEnd: text(formData, "businessHoursEnd"),
      phone: text(formData, "phone"),
      email: text(formData, "email"),
    },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "organization.location_created",
    entityType: "OrganizationLocation",
    entityId: location.id,
    description: `Location "${name}" was created.`,
    metadata: { type, status },
  });

  revalidatePath("/locations");
  return null;
}

export async function setLocationStatus(formData: FormData) {
  const session = await requireOrgAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!LOCATION_STATUSES.includes(status as (typeof LOCATION_STATUSES)[number])) {
    throw new Error(`Invalid location status: ${status}`);
  }

  // Tenant-scoped update: the id must belong to this company.
  const location = await db.organizationLocation.findFirst({
    where: { id, companyId: session.company.id },
  });
  if (!location) throw new Error("Location not found.");

  await db.organizationLocation.update({ where: { id }, data: { status } });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action:
      status === "active"
        ? "organization.location_activated"
        : "organization.location_deactivated",
    entityType: "OrganizationLocation",
    entityId: id,
    description: `Location "${location.name}" was marked ${status}.`,
    metadata: { status },
  });

  revalidatePath("/locations");
}

// ── Departments ──────────────────────────────────────────────────────────

export async function createDepartment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireOrgAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Department name is required." };

  const existing = await db.department.findUnique({
    where: { companyId_name: { companyId: session.company.id, name } },
  });
  if (existing) {
    return { error: "A department with that name already exists." };
  }

  const department = await db.department.create({
    data: {
      companyId: session.company.id,
      name,
      description: text(formData, "description"),
    },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "organization.department_created",
    entityType: "Department",
    entityId: department.id,
    description: `Department "${name}" was created.`,
  });

  revalidatePath("/departments");
  return null;
}

/** Creates any of the platform's default departments this org is missing. */
export async function addDefaultDepartments() {
  const session = await requireOrgAdmin();

  const existing = await db.department.findMany({
    where: { companyId: session.company.id },
    select: { name: true },
  });
  const have = new Set(existing.map((d) => d.name));
  const missing = DEFAULT_DEPARTMENTS.filter((d) => !have.has(d.name));

  if (missing.length === 0) return;

  await db.department.createMany({
    data: missing.map((d) => ({
      companyId: session.company.id,
      name: d.name,
      description: d.description,
    })),
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "organization.default_departments_added",
    entityType: "Department",
    description: `${missing.length} default department${missing.length === 1 ? "" : "s"} added.`,
    metadata: { names: missing.map((d) => d.name) },
  });

  revalidatePath("/departments");
}

export async function setDepartmentActive(formData: FormData) {
  const session = await requireOrgAdmin();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active")) === "true";

  const department = await db.department.findFirst({
    where: { id, companyId: session.company.id },
  });
  if (!department) throw new Error("Department not found.");

  await db.department.update({ where: { id }, data: { active } });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: active
      ? "organization.department_activated"
      : "organization.department_deactivated",
    entityType: "Department",
    entityId: id,
    description: `Department "${department.name}" was ${active ? "activated" : "deactivated"}.`,
    metadata: { active },
  });

  revalidatePath("/departments");
  revalidatePath("/teams");
}

// ── Teams ────────────────────────────────────────────────────────────────

export async function createTeam(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireOrgAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Team name is required." };

  const departmentId = String(formData.get("departmentId") ?? "");
  const department = await db.department.findFirst({
    where: { id: departmentId, companyId: session.company.id },
  });
  if (!department) return { error: "Choose the department this team belongs to." };

  const existing = await db.team.findUnique({
    where: { companyId_name: { companyId: session.company.id, name } },
  });
  if (existing) {
    return { error: "A team with that name already exists." };
  }

  const team = await db.team.create({
    data: {
      companyId: session.company.id,
      departmentId,
      name,
      code: text(formData, "code"),
      description: text(formData, "description"),
    },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "organization.team_created",
    entityType: "Team",
    entityId: team.id,
    description: `Team "${name}" was created in ${department.name}.`,
    metadata: { departmentId },
  });

  revalidatePath("/teams");
  return null;
}

export async function setTeamActive(formData: FormData) {
  const session = await requireOrgAdmin();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active")) === "true";

  const team = await db.team.findFirst({
    where: { id, companyId: session.company.id },
  });
  if (!team) throw new Error("Team not found.");

  await db.team.update({ where: { id }, data: { active } });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: active ? "organization.team_activated" : "organization.team_deactivated",
    entityType: "Team",
    entityId: id,
    description: `Team "${team.name}" was ${active ? "activated" : "deactivated"}.`,
    metadata: { active },
  });

  revalidatePath("/teams");
}

// ── Business & operations settings ───────────────────────────────────────

export async function updateOrganizationOperations(formData: FormData) {
  const session = await requireOrgAdmin();

  const workWeek = String(formData.get("workWeek") ?? "monday_friday");
  if (!WORK_WEEKS.some((w) => w.id === workWeek)) {
    throw new Error(`Unknown work week: ${workWeek}`);
  }

  const defaultShiftHours = Number(formData.get("defaultShiftHours") ?? 8);
  if (!SHIFT_LENGTHS_HOURS.includes(defaultShiftHours as (typeof SHIFT_LENGTHS_HOURS)[number])) {
    throw new Error(`Invalid shift length: ${defaultShiftHours}`);
  }

  const data = {
    timezone: String(formData.get("timezone") ?? "America/Chicago"),
    workWeek,
    businessHoursStart: text(formData, "businessHoursStart") ?? "08:00",
    businessHoursEnd: text(formData, "businessHoursEnd") ?? "17:00",
    defaultShiftHours,
  };

  await db.companySettings.upsert({
    where: { companyId: session.company.id },
    update: data,
    create: { companyId: session.company.id, ...data },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "organization.operations_settings_updated",
    entityType: "CompanySettings",
    entityId: session.company.id,
    description: "Organization business and operations settings were updated.",
    metadata: { workWeek, defaultShiftHours },
  });

  revalidatePath("/company/preferences");
  revalidatePath("/settings");
}
