"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type TabPage = {
  label: string;
  href: string;
  /** Active only on an exact path match (index tabs). */
  exact?: boolean;
};

/**
 * Shared secondary tab navigation used by area shells (Organization,
 * Platform Administration, Locate module).
 */
export function TabNav({
  pages,
  ariaLabel,
}: {
  pages: TabPage[];
  ariaLabel: string;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={ariaLabel}
      className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
    >
      {pages.map((page) => {
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
