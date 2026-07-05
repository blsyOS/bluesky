import { TabNav } from "@/components/tab-nav";

/**
 * Secondary navigation for the Locate module application. Sits inside the
 * product shell; the main sidebar navigates between products/modules while
 * this tabs between the Locate module's pages.
 */
const LOCATE_PAGES = [
  { label: "Dashboard", href: "/dashboard/locate", exact: true },
  { label: "Tickets", href: "/locate", exact: true },
  { label: "Assignments", href: "/locate/assignments" },
  { label: "Maps", href: "/locate/maps" },
  { label: "Damage Investigations", href: "/locate/damage-investigations" },
  { label: "Reports", href: "/locate/reports" },
];

export function LocateNav() {
  return <TabNav pages={LOCATE_PAGES} ariaLabel="Locate module" />;
}
