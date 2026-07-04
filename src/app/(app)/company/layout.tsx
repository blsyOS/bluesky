import { PageHeader } from "@/components/page-header";
import { CompanyStatusBadge } from "@/components/company/company-status";
import { getCurrentSession } from "@/lib/session";
import { CompanyNav } from "./company-nav";

/**
 * Company Administration — the shared Company Profile every BlueSky
 * product operates against. Not employees, users, or locations: the
 * company itself.
 */
export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  return (
    <>
      <PageHeader
        title={session.company.name}
        description="The company record shared by every BlueSky product."
        actions={<CompanyStatusBadge status={session.company.status} />}
      />
      <CompanyNav />
      {children}
    </>
  );
}
