"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { getCurrentSession } from "@/lib/session";
import { COMPANY_STATUSES, THEMES } from "@/lib/constants";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCompany(formData: FormData) {
  const session = await getCurrentSession();
  const name = String(formData.get("name") ?? "").trim();
  const subdomain = slugify(String(formData.get("subdomain") ?? ""));
  if (!name || !subdomain) throw new Error("Name and subdomain are required.");

  const company = await db.company.create({
    data: {
      name,
      legalName: String(formData.get("legalName") ?? "").trim() || null,
      slug: slugify(name),
      subdomain,
      status: "active",
      primaryColor: String(formData.get("primaryColor") ?? "").trim() || null,
      settings: { create: {} },
    },
  });

  await recordAudit({
    companyId: company.id,
    userId: session.user.id,
    action: "company.created",
    entityType: "Company",
    entityId: company.id,
    description: `Company "${company.name}" was created.`,
    metadata: { subdomain: company.subdomain },
  });

  revalidatePath("/", "layout");
  return company;
}

export async function updateCompany(formData: FormData) {
  const session = await getCurrentSession();
  const company = session.company;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Company name is required.");
  const status = String(formData.get("status") ?? company.status);
  if (!COMPANY_STATUSES.includes(status as (typeof COMPANY_STATUSES)[number])) {
    throw new Error(`Invalid company status: ${status}`);
  }

  const updated = await db.company.update({
    where: { id: company.id },
    data: {
      name,
      legalName: String(formData.get("legalName") ?? "").trim() || null,
      status,
      logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
      primaryColor: String(formData.get("primaryColor") ?? "").trim() || null,
    },
  });

  await recordAudit({
    companyId: company.id,
    userId: session.user.id,
    action: "company.updated",
    entityType: "Company",
    entityId: company.id,
    description: `Company profile for "${updated.name}" was updated.`,
    metadata: { name, status },
  });

  revalidatePath("/", "layout");
}

export async function updateCompanySettings(formData: FormData) {
  const session = await getCurrentSession();
  const company = session.company;

  const defaultTheme = String(formData.get("defaultTheme") ?? "system");
  if (!THEMES.includes(defaultTheme as (typeof THEMES)[number])) {
    throw new Error(`Invalid theme: ${defaultTheme}`);
  }

  const data = {
    timezone: String(formData.get("timezone") ?? "America/Chicago"),
    dateFormat: String(formData.get("dateFormat") ?? "MM/DD/YYYY"),
    timeFormat: String(formData.get("timeFormat") ?? "12h"),
    defaultTheme,
  };

  await db.companySettings.upsert({
    where: { companyId: company.id },
    update: data,
    create: { companyId: company.id, ...data },
  });

  await recordAudit({
    companyId: company.id,
    userId: session.user.id,
    action: "settings.updated",
    entityType: "CompanySettings",
    entityId: company.id,
    description: "Company settings were updated.",
    metadata: data,
  });

  revalidatePath("/settings");
}

export async function getCurrentCompany() {
  const session = await getCurrentSession();
  return session.company;
}

export async function listCompanyProducts() {
  const session = await getCurrentSession();
  return db.companyProduct.findMany({
    where: { companyId: session.company.id },
    include: { product: true },
    orderBy: { product: { createdAt: "asc" } },
  });
}

export async function setCompanyProductStatus(formData: FormData) {
  const session = await getCurrentSession();
  const productId = String(formData.get("productId") ?? "");
  const enable = String(formData.get("enable")) === "true";
  if (!productId) throw new Error("productId is required.");

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found.");

  const now = new Date();
  await db.companyProduct.upsert({
    where: {
      companyId_productId: { companyId: session.company.id, productId },
    },
    update: enable
      ? { status: "active", enabledAt: now, disabledAt: null }
      : { status: "disabled", disabledAt: now },
    create: {
      companyId: session.company.id,
      productId,
      status: enable ? "active" : "disabled",
      enabledAt: enable ? now : null,
      disabledAt: enable ? null : now,
    },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: enable ? "company_product.enabled" : "company_product.disabled",
    entityType: "CompanyProduct",
    entityId: productId,
    description: `${product.name} was ${enable ? "enabled" : "disabled"} for ${session.company.name}.`,
    metadata: { productKey: product.key },
  });

  revalidatePath("/", "layout");
}
