"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { getCurrentSession } from "@/lib/session";

/** System roles plus any roles defined by the current company. */
export async function listRoles() {
  const session = await getCurrentSession();
  return db.role.findMany({
    where: {
      OR: [{ isSystemRole: true }, { companyId: session.company.id }],
    },
    include: {
      product: true,
      permissions: { include: { permission: true } },
      _count: { select: { userProductRoles: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function listPermissions() {
  return db.permission.findMany({
    include: { product: true },
    orderBy: { key: "asc" },
  });
}

/** Replaces a role's permission set with the submitted one. */
export async function setRolePermissions(formData: FormData) {
  const session = await getCurrentSession();
  const roleId = String(formData.get("roleId") ?? "");
  const permissionIds = formData.getAll("permissionIds").map(String);

  const role = await db.role.findFirst({
    where: {
      id: roleId,
      OR: [{ isSystemRole: true }, { companyId: session.company.id }],
    },
  });
  if (!role) throw new Error("Role not found.");

  const permissions = await db.permission.findMany({
    where: { id: { in: permissionIds } },
  });

  await db.$transaction([
    db.rolePermission.deleteMany({ where: { roleId } }),
    ...(permissions.length
      ? [
          db.rolePermission.createMany({
            data: permissions.map((p) => ({ roleId, permissionId: p.id })),
          }),
        ]
      : []),
  ]);

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "role.permissions_updated",
    entityType: "Role",
    entityId: role.id,
    description: `Permissions for role "${role.name}" were updated.`,
    metadata: { permissionKeys: permissions.map((p) => p.key) },
  });

  revalidatePath("/roles");
}
