"use client";

import { useRouter } from "next/navigation";
import { usePopover } from "@/components/shell/use-popover";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";
import { productRegistry, PRODUCT_COOKIE } from "@/lib/products";
import { setPreferenceCookie } from "@/lib/cookies";
import { accentStyle } from "@/lib/accents";
import { cn } from "@/lib/cn";

/**
 * True product-context selector. Switching the active product persists the
 * choice (cookie, so SSR renders the right sidebar), notifies the shell to
 * rebuild its sidebar, and navigates to the product's default landing.
 */
export function ProductContextSelector({
  activeProductId,
  onProductChange,
}: {
  activeProductId: string;
  onProductChange: (id: string) => void;
}) {
  const { open, setOpen, containerRef, triggerRef } =
    usePopover<HTMLDivElement>();
  const router = useRouter();

  const products = productRegistry.list();
  const active =
    productRegistry.get(activeProductId) ?? products[0];
  if (!active) return null;

  const ActiveIcon = active.icon;

  function select(id: string) {
    const config = productRegistry.get(id);
    if (!config) return;
    setOpen(false);
    setPreferenceCookie(PRODUCT_COOKIE, id);
    onProductChange(id);
    router.push(config.defaultLanding);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Active product: ${active.name}. Switch product.`}
        className="inline-flex h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted cursor-pointer sm:px-3"
      >
        <span
          style={active.accentKey ? accentStyle(active.accentKey) : undefined}
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-white",
            active.accentKey ? "bg-accent" : "bg-primary"
          )}
        >
          <ActiveIcon className="size-4" />
        </span>
        <span className="hidden max-w-40 truncate md:inline">{active.name}</span>
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Products"
          className="absolute left-0 z-50 mt-2 w-64 rounded-xl border border-border bg-surface p-2 shadow-overlay"
        >
          <p className="px-3 pb-1 pt-2 text-meta">Switch product</p>
          <ul>
            {products.map((product) => {
              const Icon = product.icon;
              const isActive = product.id === active.id;
              return (
                <li key={product.id} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => select(product.id)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-muted"
                  >
                    <span
                      style={
                        product.accentKey
                          ? accentStyle(product.accentKey)
                          : undefined
                      }
                      className={cn(
                        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-white",
                        product.accentKey ? "bg-accent" : "bg-primary"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {product.name}
                    </span>
                    {isActive ? (
                      <CheckIcon className="size-4 shrink-0 text-primary" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
