"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { getCurrentSession } from "@/lib/session";
import { COMPANY_STATUSES } from "@/lib/constants";
import { ADDRESS_TYPES, flagDefinition } from "@/lib/company";
import { csvToJsonList } from "@/lib/lists";

/**
 * Company administration actions (BO-02.01A). All mutations are scoped to
 * the current tenant and write audit-log entries.
 */

function text(formData: FormData, name: string): string | null {
  const v = String(formData.get(name) ?? "").trim();
  return v || null;
}

export async function updateCompanyProfile(formData: FormData) {
  const session = await getCurrentSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Company name is required.");

  const status = String(formData.get("status") ?? session.company.status);
  if (!COMPANY_STATUSES.includes(status as (typeof COMPANY_STATUSES)[number])) {
    throw new Error(`Invalid company status: ${status}`);
  }

  const foundedRaw = text(formData, "foundedDate");
  const foundedDate = foundedRaw ? new Date(foundedRaw) : null;
  if (foundedDate && Number.isNaN(foundedDate.getTime())) {
    throw new Error("Invalid founded date.");
  }

  await db.company.update({
    where: { id: session.company.id },
    data: {
      name,
      legalName: text(formData, "legalName"),
      dba: text(formData, "dba"),
      status,
      description: text(formData, "description"),
      foundedDate,
      website: text(formData, "website"),
    },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "company.profile_updated",
    entityType: "Company",
    entityId: session.company.id,
    description: `Company profile for "${name}" was updated.`,
    metadata: { status },
  });

  revalidatePath("/", "layout");
}

export async function updateCompanyContactInfo(formData: FormData) {
  const session = await getCurrentSession();
  const data = {
    mainPhone: text(formData, "mainPhone"),
    mainEmail: text(formData, "mainEmail"),
    emergencyPhone: text(formData, "emergencyPhone"),
    afterHoursPhone: text(formData, "afterHoursPhone"),
    billingEmail: text(formData, "billingEmail"),
  };

  await db.companyContactInfo.upsert({
    where: { companyId: session.company.id },
    update: data,
    create: { companyId: session.company.id, ...data },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "company.contact_info_updated",
    entityType: "CompanyContactInfo",
    entityId: session.company.id,
    description: "Company contact information was updated.",
  });

  revalidatePath("/company");
}

export async function updateCompanyBranding(formData: FormData) {
  const session = await getCurrentSession();
  const data = {
    logoUrl: text(formData, "logoUrl"),
    primaryColor: text(formData, "primaryColor"),
    secondaryColor: text(formData, "secondaryColor"),
    accentColor: text(formData, "accentColor"),
    // Favicon / email branding are future-ready placeholders; persisted but
    // not applied anywhere yet.
    faviconUrl: text(formData, "faviconUrl"),
    emailLogoUrl: text(formData, "emailLogoUrl"),
  };

  await db.company.update({
    where: { id: session.company.id },
    data,
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "company.branding_updated",
    entityType: "Company",
    entityId: session.company.id,
    description: "Company branding was updated.",
    metadata: { primaryColor: data.primaryColor },
  });

  revalidatePath("/", "layout");
}

export async function upsertCompanyAddress(formData: FormData) {
  const session = await getCurrentSession();
  const type = String(formData.get("type") ?? "");
  if (!ADDRESS_TYPES.some((t) => t.id === type)) {
    throw new Error(`Unknown address type: ${type}`);
  }

  const data = {
    companyLine: text(formData, "companyLine"),
    addressLine1: text(formData, "addressLine1"),
    addressLine2: text(formData, "addressLine2"),
    city: text(formData, "city"),
    state: text(formData, "state"),
    postalCode: text(formData, "postalCode"),
    country: text(formData, "country") ?? "USA",
  };

  await db.companyAddress.upsert({
    where: { companyId_type: { companyId: session.company.id, type } },
    update: data,
    create: { companyId: session.company.id, type, ...data },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "company.address_updated",
    entityType: "CompanyAddress",
    entityId: type,
    description: `Company ${type} address was updated.`,
    metadata: { type },
  });

  revalidatePath("/company/addresses");
}

export async function updateServiceTerritory(formData: FormData) {
  const session = await getCurrentSession();
  const data = {
    states: csvToJsonList(String(formData.get("states") ?? "")),
    counties: csvToJsonList(String(formData.get("counties") ?? "")),
    description: text(formData, "description"),
  };

  await db.companyServiceTerritory.upsert({
    where: { companyId: session.company.id },
    update: data,
    create: { companyId: session.company.id, ...data },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "company.service_territory_updated",
    entityType: "CompanyServiceTerritory",
    entityId: session.company.id,
    description: "Company service territory was updated.",
  });

  revalidatePath("/company/territory");
}

export async function toggleCompanyFlag(formData: FormData) {
  const session = await getCurrentSession();
  const key = String(formData.get("key") ?? "");
  const definition = flagDefinition(key);
  if (!definition) throw new Error(`Unknown feature flag: ${key}`);
  const enabled = String(formData.get("enabled")) === "true";

  await db.companyFeatureFlag.upsert({
    where: { companyId_key: { companyId: session.company.id, key } },
    update: { enabled },
    create: { companyId: session.company.id, key, enabled },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: enabled ? "company.flag_enabled" : "company.flag_disabled",
    entityType: "CompanyFeatureFlag",
    entityId: key,
    description: `Feature flag "${definition.label}" was ${enabled ? "enabled" : "disabled"}.`,
    metadata: { key, enabled },
  });

  revalidatePath("/company/flags");
}
