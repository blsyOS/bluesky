import { TabNav } from "@/components/tab-nav";

/** Secondary navigation for Organization Administration. */
const ORGANIZATION_PAGES = [
  { label: "Profile", href: "/company", exact: true },
  { label: "Branding", href: "/company/branding" },
  { label: "Addresses", href: "/company/addresses" },
  { label: "Preferences", href: "/company/preferences" },
  { label: "Service Territory", href: "/company/territory" },
  { label: "Feature Flags", href: "/company/flags" },
];

export function CompanyNav() {
  return (
    <TabNav pages={ORGANIZATION_PAGES} ariaLabel="Organization administration" />
  );
}
