import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { TabNav } from "@/components/tab-nav";
import { requirePermission } from "@/lib/authz";

/**
 * Platform Administration — BlueSky platform administrators only
 * (`platform.manage`). Manages companies/tenants, the product catalog,
 * licensing, billing, and platform-level settings. Distinct from
 * Organization Administration (/company), which each tenant uses to manage
 * only their own organization. Renders 404 for anyone else.
 */
const PLATFORM_PAGES = [
  { label: "Companies", href: "/platform/companies" },
  { label: "Product Catalog", href: "/platform/catalog" },
  { label: "Licensing", href: "/platform/licensing" },
  { label: "Billing", href: "/platform/billing" },
  { label: "Feature Management", href: "/platform/features" },
  { label: "System Health", href: "/platform/health" },
  { label: "Support Tools", href: "/platform/support" },
];

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("platform.manage");

  return (
    <>
      <PageHeader
        title="Platform Administration"
        description="Manage BlueSky OS itself: tenants, catalog, licensing, and platform settings."
        actions={<Badge tone="accent">Platform admins only</Badge>}
      />
      <TabNav pages={PLATFORM_PAGES} ariaLabel="Platform administration" />
      {children}
    </>
  );
}
