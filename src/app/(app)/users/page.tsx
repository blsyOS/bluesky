import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { UsersTable } from "./users-table";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const session = await getCurrentSession();
  const companyId = session.company.id;

  const [users, enabledProducts, roles] = await Promise.all([
    db.user.findMany({
      where: { companyId },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: {
        productRoles: { include: { product: true, role: true } },
      },
    }),
    db.companyProduct.findMany({
      where: { companyId, status: { in: ["active", "trial"] } },
      include: { product: true },
      orderBy: { product: { createdAt: "asc" } },
    }),
    db.role.findMany({
      where: { OR: [{ isSystemRole: true }, { companyId }] },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Users"
        description={`People in ${session.company.name} and their product access.`}
      />
      <UsersTable
        users={users.map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          status: u.status,
          createdAt: u.createdAt.toISOString(),
          access: u.productRoles.map((pr) => ({
            id: pr.id,
            productId: pr.productId,
            productName: pr.product.name,
            accentColor: pr.product.accentColor,
            roleName: pr.role.name,
          })),
        }))}
        products={enabledProducts.map((cp) => ({
          id: cp.product.id,
          name: cp.product.name,
        }))}
        roles={roles.map((r) => ({ id: r.id, name: r.name }))}
      />
    </>
  );
}
