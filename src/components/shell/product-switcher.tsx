"use client";

import Link from "next/link";
import type { ProductAccess } from "@/lib/access";
import { describeAvailability } from "@/lib/availability";
import { usePopover } from "@/components/shell/use-popover";
import { ChevronDownIcon, GridIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ProductGlyph } from "@/components/ui/product-card";
import { cn } from "@/lib/cn";

/**
 * Topbar product switcher. Products the user holds no role on are hidden;
 * products that are licensed and live are launchable; the rest render
 * dimmed with their licensing status (Trial / Disabled / Coming soon).
 */
export function ProductSwitcher({ products }: { products: ProductAccess[] }) {
  const { open, setOpen, containerRef, triggerRef } =
    usePopover<HTMLDivElement>();

  const visible = products.filter((p) => p.userHasAccess);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Products"
        className="inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground cursor-pointer"
      >
        <GridIcon className="size-4.5" />
        <span className="hidden sm:inline">Products</span>
        <ChevronDownIcon
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Products"
          className="fixed inset-x-4 top-16 z-50 mt-1 rounded-xl border border-border bg-surface p-2 shadow-overlay sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-85"
        >
          <p className="px-3 pb-1 pt-2 text-meta">Your products</p>
          <ul>
            {visible.map((item) => {
              const availability = describeAvailability(item);
              const content = (
                <>
                  <ProductGlyph
                    name={item.product.name}
                    productKey={item.product.key}
                    size="sm"
                    className="mt-0.5"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-sm font-medium">
                      {item.product.name}
                      <Badge tone={availability.tone}>{availability.label}</Badge>
                    </span>
                    <span className="block truncate text-caption">
                      {item.product.description}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={item.product.id} role="none">
                  {item.launchable ? (
                    <Link
                      role="menuitem"
                      href={`/launch/${item.product.key.toLowerCase()}`}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-muted"
                    >
                      {content}
                    </Link>
                  ) : (
                    <span
                      role="menuitem"
                      aria-disabled="true"
                      className="flex min-h-11 cursor-not-allowed items-start gap-3 rounded-lg px-3 py-2.5 opacity-55"
                    >
                      {content}
                    </span>
                  )}
                </li>
              );
            })}
            {visible.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted-foreground">
                You don&apos;t have access to any products yet.
              </li>
            ) : null}
          </ul>
          <div className="mt-1 border-t border-border p-2">
            <Link
              href="/switcher"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-muted"
            >
              View all products →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
