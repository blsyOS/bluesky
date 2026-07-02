"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { getCurrentSession } from "@/lib/session";
import { USER_STATUSES } from "@/lib/constants";

export async function createUser(formData: FormData) {
  const session = await getCurrentSession();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!firstName || !lastName || !email) {
    throw new Error("First name, last name, and email are required.");
  }

  const user = await db.user.create({
    data: {
      companyId: session.company.id,
      firstName,
      lastName,
      email,
      phone: String(formData.get("phone") ?? "").trim() || null,
      status: "invited",
    },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "user.created",
    entityType: "User",
    entityId: user.id,
    description: `User ${user.firstName} ${user.lastName} (${user.email}) was invited.`,
    metadata: { email: user.email },
  });

  revalidatePath("/users");
}

export async function updateUser(formData: FormData) {
  const session = await getCurrentSession();
  const userId = String(formData.get("userId") ?? "");
  const user = await db.user.findFirst({
    where: { id: userId, companyId: session.company.id },
  });
  if (!user) throw new Error("User not found in this company.");

  const status = String(formData.get("status") ?? user.status);
  if (!USER_STATUSES.includes(status as (typeof USER_STATUSES)[number])) {
    throw new Error(`Invalid user status: ${status}`);
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      firstName: String(formData.get("firstName") ?? user.firstName).trim(),
      lastName: String(formData.get("lastName") ?? user.lastName).trim(),
      phone: String(formData.get("phone") ?? "").trim() || null,
      status,
    },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "user.updated",
    entityType: "User",
    entityId: updated.id,
    description: `User ${updated.firstName} ${updated.lastName} was updated.`,
    metadata: { status: updated.status },
  });

  revalidatePath("/users");
}

export async function listUsersByCompany() {
  const session = await getCurrentSession();
  return db.user.findMany({
    where: { companyId: session.company.id },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    include: {
      productRoles: { include: { product: true, role: true } },
    },
  });
}

/** Grants a user access to a product under a specific role. */
export async function assignProductAccess(formData: FormData) {
  const session = await getCurrentSession();
  const userId = String(formData.get("userId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const roleId = String(formData.get("roleId") ?? "");
  if (!userId || !productId || !roleId) {
    throw new Error("User, product, and role are required.");
  }

  const [user, product, role, license] = await Promise.all([
    db.user.findFirst({ where: { id: userId, companyId: session.company.id } }),
    db.product.findUnique({ where: { id: productId } }),
    db.role.findFirst({
      where: {
        id: roleId,
        OR: [{ companyId: session.company.id }, { isSystemRole: true }],
      },
    }),
    db.companyProduct.findUnique({
      where: {
        companyId_productId: { companyId: session.company.id, productId },
      },
    }),
  ]);
  if (!user) throw new Error("User not found in this company.");
  if (!product) throw new Error("Product not found.");
  if (!role) throw new Error("Role not found.");
  if (!license || license.status === "disabled") {
    throw new Error(`${product.name} is not enabled for ${session.company.name}.`);
  }

  await db.userProductRole.upsert({
    where: { userId_productId_roleId: { userId, productId, roleId } },
    update: {},
    create: { userId, productId, roleId },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "user.product_access_granted",
    entityType: "UserProductRole",
    entityId: userId,
    description: `${user.firstName} ${user.lastName} was granted ${role.name} on ${product.name}.`,
    metadata: { productKey: product.key, roleKey: role.key },
  });

  revalidatePath("/users");
}

/** Removes a user's access to a product (all roles on that product). */
export async function removeProductAccess(formData: FormData) {
  const session = await getCurrentSession();
  const userId = String(formData.get("userId") ?? "");
  const productId = String(formData.get("productId") ?? "");

  const [user, product] = await Promise.all([
    db.user.findFirst({ where: { id: userId, companyId: session.company.id } }),
    db.product.findUnique({ where: { id: productId } }),
  ]);
  if (!user) throw new Error("User not found in this company.");
  if (!product) throw new Error("Product not found.");

  await db.userProductRole.deleteMany({ where: { userId, productId } });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "user.product_access_revoked",
    entityType: "UserProductRole",
    entityId: userId,
    description: `${user.firstName} ${user.lastName}'s access to ${product.name} was removed.`,
    metadata: { productKey: product.key },
  });

  revalidatePath("/users");
}
