import type { NavEntry, NavSection, ProductNavConfig } from "./types";

/**
 * Registry of product navigation configs. Products register themselves via
 * side-effect import (see ./index); the shell resolves the active product's
 * config by id. Mirrors the search/notification/dashboard registry pattern.
 */
export class ProductRegistry {
  private products = new Map<string, ProductNavConfig>();
  private order: string[] = [];

  register(config: ProductNavConfig): void {
    if (!this.products.has(config.id)) this.order.push(config.id);
    this.products.set(config.id, config);
  }

  get(id: string): ProductNavConfig | undefined {
    return this.products.get(id);
  }

  /** All registered products, in registration order. */
  list(): ProductNavConfig[] {
    return this.order
      .map((id) => this.products.get(id))
      .filter((c): c is ProductNavConfig => Boolean(c));
  }

  has(id: string): boolean {
    return this.products.has(id);
  }
}

export const productRegistry = new ProductRegistry();

/**
 * Resolves a product's sidebar: its own sections (feature-flag-gated) plus
 * the globally-appended admin sections the user may see (Organization
 * and/or Platform — see admin-nav.ts).
 */
export function resolveSidebar(
  config: ProductNavConfig,
  adminSections: NavSection[]
): NavSection[] {
  const gate = (items: NavEntry[]) =>
    items.filter((item) => !item.featureFlag || config.featureFlags[item.featureFlag]);

  const sections = config.sidebar
    .map((section) => ({ ...section, items: gate(section.items) }))
    .filter((section) => section.items.length > 0);

  return [...sections, ...adminSections];
}
