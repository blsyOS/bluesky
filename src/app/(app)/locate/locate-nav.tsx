"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

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
  const pathname = usePathname();
  return (
    <nav
      aria-label="Locate module"
      className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
    >
      {LOCATE_PAGES.map((page) => {
        const active = page.exact
          ? pathname === page.href
          : pathname === page.href || pathname.startsWith(`${page.href}/`);
        return (
          <Link
            key={page.href}
            href={page.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {page.label}
          </Link>
        );
      })}
    </nav>
  );
}
