import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { setCompanyProductStatus } from "@/lib/actions/companies";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const session = await getCurrentSession();

  const products = await db.product.findMany({
    where: { status: { not: "hidden" } },
    orderBy: { createdAt: "asc" },
    include: { companies: { where: { companyId: session.company.id } } },
  });

  return (
    <>
      <PageHeader
        title="Products"
        description={`Products licensed to ${session.company.name}.`}
      />

      <Card>
        <CardHeader
          title="Product licenses"
          description="Enable or disable products for your company. Changes are audited."
        />
        <Table>
          <THead>
            <tr>
              <TH>Product</TH>
              <TH>Availability</TH>
              <TH>License</TH>
              <TH>Enabled</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {products.map((product) => {
              const license = product.companies[0] ?? null;
              const enabled =
                license?.status === "active" || license?.status === "trial";
              return (
                <tr key={product.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{
                          backgroundColor: product.accentColor ?? "#64748b",
                        }}
                      >
                        {product.name.slice(0, 2)}
                      </span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <StatusBadge status={product.status} />
                  </TD>
                  <TD>
                    {license ? (
                      <StatusBadge status={license.status} />
                    ) : (
                      <Badge tone="gray">not licensed</Badge>
                    )}
                  </TD>
                  <TD className="text-muted-foreground">
                    {license?.enabledAt ? formatDate(license.enabledAt) : "—"}
                  </TD>
                  <TD className="text-right">
                    <form action={setCompanyProductStatus} className="inline">
                      <input type="hidden" name="productId" value={product.id} />
                      <input
                        type="hidden"
                        name="enable"
                        value={enabled ? "false" : "true"}
                      />
                      {enabled ? (
                        <Button variant="danger" size="sm" type="submit">
                          Disable
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" type="submit">
                          Enable
                        </Button>
                      )}
                    </form>
                  </TD>
                </tr>
              );
            })}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
