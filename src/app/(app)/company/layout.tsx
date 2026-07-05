import { PageHeader } from "@/components/page-header";
import { CompanyStatusBadge } from "@/components/company/company-status";
import { requirePermission } from "@/lib/authz";
import { CompanyNav } from "./company-nav";

/**
 * Organization Administration — each tenant manages its own organization
 * here (requires `company.manage`). The backend tenant model remains
 * `Company`; only the UI wording says "organization". Platform-wide
 * administration lives separately under /platform for BlueSky platform
 * admins.
 */
export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePermission("company.manage");

  return (
    <>
      <PageHeader
        title={session.company.name}
        description="Your organization's shared record across every BlueSky product."
        actions={<CompanyStatusBadge status={session.company.status} />}
      />
      <CompanyNav />
      {children}
    </>
  );
}
