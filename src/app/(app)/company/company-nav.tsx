"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** Secondary navigation for Company Administration. */
const COMPANY_PAGES = [
  { label: "Profile", href: "/company", exact: true },
  { label: "Branding", href: "/company/branding" },
  { label: "Addresses", href: "/company/addresses" },
  { label: "Preferences", href: "/company/preferences" },
  { label: "Service Territory", href: "/company/territory" },
  { label: "Feature Flags", href: "/company/flags" },
];

export function CompanyNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Company administration"
      className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
    >
      {COMPANY_PAGES.map((page) => {
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
