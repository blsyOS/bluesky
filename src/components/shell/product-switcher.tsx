"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductAccess } from "@/lib/access";
import { ChevronDownIcon, GridIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/**
 * Topbar product switcher. Products the user holds no role on are hidden;
 * products that are licensed and live are launchable; the rest render
 * dimmed with the reason they are unavailable.
 */
export function ProductSwitcher({ products }: { products: ProductAccess[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const visible = products.filter((p) => p.userHasAccess);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground cursor-pointer"
      >
        <GridIcon className="size-4.5" />
        <span className="hidden sm:inline">Products</span>
        <ChevronDownIcon
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-80 rounded-xl border border-border bg-surface p-2 shadow-lg">
          <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your products
          </p>
          <ul>
            {visible.map((item) => {
              const unavailableReason = !item.enabledForCompany
                ? "Not enabled"
                : item.product.status === "coming_soon"
                  ? "Coming soon"
                  : null;
              const content = (
                <>
                  <span
                    className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: item.product.accentColor ?? "#64748b" }}
                  >
                    {item.product.name.slice(0, 2)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {item.product.name}
                      {unavailableReason ? (
                        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {unavailableReason}
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.product.description}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={item.product.id}>
                  {item.launchable ? (
                    <Link
                      href={`/launch/${item.product.key.toLowerCase()}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-muted"
                    >
                      {content}
                    </Link>
                  ) : (
                    <span className="flex cursor-not-allowed items-start gap-3 rounded-lg px-3 py-2.5 opacity-50">
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
