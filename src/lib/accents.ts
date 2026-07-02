import type { CSSProperties } from "react";
import type { ProductKey } from "@/lib/constants";

/**
 * Product accent system. Each product maps to a CSS variable defined in
 * globals.css (light + dark values). Components stay neutral by default and
 * pick up a product's accent by rendering with `style={accentStyle(key)}`,
 * which overrides the generic `--accent` slot that accent-aware utilities
 * (bg-accent, text-accent, ring-accent/…) read from.
 */
export const PRODUCT_ACCENT_VARS: Record<ProductKey, string> = {
  LOCATE_OS: "var(--accent-locate)",
  LEAK_OS: "var(--accent-leak)",
  FIBER_OS: "var(--accent-fiber)",
  SITE_VIEW: "var(--accent-site)",
  COMMAND_CENTER: "var(--accent-command)",
};

export function accentVar(key: string): string {
  return PRODUCT_ACCENT_VARS[key as ProductKey] ?? "var(--primary)";
}

/** Inline style that scopes a product's accent to a component subtree. */
export function accentStyle(key: string): CSSProperties {
  return { "--accent": accentVar(key) } as CSSProperties;
}
