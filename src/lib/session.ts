import { cache } from "react";
import { db } from "@/lib/db";

/**
 * Placeholder session until real authentication lands.
 *
 * The "signed-in" user is the seeded platform admin, and the current tenant
 * is that user's company. Everything downstream (actions, pages, product
 * switcher) resolves user + company through this module only, so swapping in
 * real auth later is a one-file change.
 */
export const getCurrentSession = cache(async () => {
  const user = await db.user.findUnique({
    where: { email: "admin@blueskyos.app" },
    include: {
      company: { include: { settings: true } },
      productRoles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
          product: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error(
      "No session user found. Run `npm run db:seed` to provision the platform."
    );
  }

  const permissionKeys = new Set(
    user.productRoles.flatMap((pr) =>
      pr.role.permissions.map((rp) => rp.permission.key)
    )
  );

  return {
    user,
    company: user.company,
    permissionKeys,
    hasPermission: (key: string) => permissionKeys.has(key),
  };
});

export type Session = Awaited<ReturnType<typeof getCurrentSession>>;
