"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: string };

/**
 * Presentational breadcrumb trail. Long trails collapse responsively:
 * intermediate crumbs are replaced with an ellipsis on narrow screens.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1.5 text-caption">
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          const isFirst = i === 0;
          // On narrow screens keep only the first and last crumbs.
          const collapsible = !isFirst && !isLast;
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              {i > 0 ? (
                <li
                  aria-hidden
                  className={cn("text-faint-foreground", collapsible && "hidden sm:block")}
                >
                  /
                </li>
              ) : null}
              {collapsible && i === 1 ? (
                <li aria-hidden className="text-faint-foreground sm:hidden">
                  /&hairsp;…&hairsp;/
                </li>
              ) : null}
              <li
                className={cn("min-w-0", collapsible && "hidden sm:block")}
              >
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="block max-w-40 truncate hover:text-foreground hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className="block max-w-48 truncate font-medium text-foreground"
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/** Labels for platform routes; product routes resolve via productNames. */
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  users: "Users",
  roles: "Roles & Permissions",
  "audit-logs": "Audit Logs",
  settings: "Settings",
  switcher: "Product Switcher",
  launch: "Launch",
};

/**
 * Derives the breadcrumb trail from the current route. Platform pages map
 * through ROUTE_LABELS; /launch/<key> resolves the product's display name
 * so future product routes read naturally (Dashboard / LeakOS / …).
 */
export function AutoBreadcrumbs({
  productNames,
  className,
}: {
  /** lowercase product key -> display name */
  productNames: Record<string, string>;
  className?: string;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const items: Crumb[] = [{ label: "Dashboard", href: "/dashboard" }];
  if (segments[0] === "launch" && segments[1]) {
    items.push({ label: productNames[segments[1]] ?? segments[1] });
  } else if (segments[0] && segments[0] !== "dashboard") {
    const label =
      ROUTE_LABELS[segments[0]] ??
      segments[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({ label, href: `/${segments[0]}` });
    // Deeper platform routes (future): /users/<id> etc.
    for (let i = 1; i < segments.length; i++) {
      items.push({ label: segments[i] });
    }
  }

  // De-emphasize: on the dashboard itself, show a single crumb.
  const finalItems =
    items.length > 1 ? items : [{ label: "Dashboard" } as Crumb];

  return <Breadcrumbs items={finalItems} className={className} />;
}
