import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form";
import { ToastForm } from "@/components/ui/toast-form";
import { setRolePermissions } from "@/lib/actions/roles";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = { title: "Roles & Permissions" };

export default async function RolesPage() {
  const session = await getCurrentSession();

  const [roles, permissions] = await Promise.all([
    db.role.findMany({
      where: { OR: [{ isSystemRole: true }, { companyId: session.company.id }] },
      include: {
        product: true,
        permissions: true,
        _count: { select: { userProductRoles: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.permission.findMany({
      include: { product: true },
      orderBy: { key: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Roles & permissions"
        description="Roles control what users can do inside each product. Permission changes are audited."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {roles.map((role) => {
          const granted = new Set(role.permissions.map((rp) => rp.permissionId));
          return (
            <Card key={role.id}>
              <CardHeader
                title={role.name}
                description={role.description ?? undefined}
                actions={
                  <div className="flex items-center gap-2">
                    {role.isSystemRole ? (
                      <Badge tone="info">System</Badge>
                    ) : (
                      <Badge tone="accent">Custom</Badge>
                    )}
                    <Badge tone="neutral">
                      {role.product ? role.product.name : "Platform-wide"}
                    </Badge>
                  </div>
                }
              />
              <CardBody>
                <ToastForm
                  action={setRolePermissions}
                  successMessage={`Permissions saved for ${role.name}.`}
                  className="space-y-3"
                >
                  <input type="hidden" name="roleId" value={role.id} />
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-muted"
                      >
                        <Checkbox
                          name="permissionIds"
                          value={permission.id}
                          defaultChecked={granted.has(permission.id)}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="block text-sm font-medium">
                            {permission.name}
                            <code className="ml-2 rounded bg-surface-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                              {permission.key}
                            </code>
                          </span>
                          {permission.description ? (
                            <span className="block text-caption">
                              {permission.description}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-caption">
                      {role._count.userProductRoles} assignment
                      {role._count.userProductRoles === 1 ? "" : "s"}
                    </p>
                    <Button type="submit" size="sm" variant="secondary">
                      Save permissions
                    </Button>
                  </div>
                </ToastForm>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
