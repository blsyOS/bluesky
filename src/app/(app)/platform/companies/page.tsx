import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { CompanyStatusBadge } from "@/components/company/company-status";
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PlaceholderActions } from "./placeholder-actions";

export const metadata: Metadata = { title: "Platform · Companies" };

/**
 * All tenants in this BlueSky OS installation. BlueSky Locating appears
 * here as a normal tenant — it is not special (see BO-02.01B docs).
 */
export default async function PlatformCompaniesPage() {
  const companies = await db.company.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: {
          products: { where: { status: { in: ["active", "trial"] } } },
          users: true,
        },
      },
    },
  });

  return (
    <Card>
      <CardHeader
        title={`Tenants (${companies.length})`}
        description="Every organization running on BlueSky OS, including BlueSky Locating as a normal tenant."
      />
      <Table>
        <THead>
          <tr>
            <TH>Company</TH>
            <TH>Subdomain</TH>
            <TH>Status</TH>
            <TH>Products enabled</TH>
            <TH>Created</TH>
            <TH className="text-right">Actions</TH>
          </tr>
        </THead>
        <TBody>
          {companies.map((company) => (
            <TR key={company.id}>
              <TD>
                <p className="font-medium">{company.name}</p>
                <p className="text-caption">{company.slug}</p>
              </TD>
              <TD className="text-muted-foreground">
                {company.subdomain}.blueskyos.app
              </TD>
              <TD>
                <CompanyStatusBadge status={company.status} />
              </TD>
              <TD>
                <span className="font-medium">{company._count.products}</span>
                <span className="text-caption">
                  {" "}
                  · {company._count.users}{" "}
                  {company._count.users === 1 ? "user" : "users"}
                </span>
              </TD>
              <TD className="text-muted-foreground">
                {formatDate(company.createdAt)}
              </TD>
              <TD>
                <PlaceholderActions companyName={company.name} />
              </TD>
            </TR>
          ))}
          {companies.length === 0 ? (
            <TableEmpty
              colSpan={6}
              title="No tenants yet"
              description="Companies appear here as they are provisioned."
            />
          ) : null}
        </TBody>
      </Table>
    </Card>
  );
}
