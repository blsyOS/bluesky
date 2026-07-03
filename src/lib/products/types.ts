import type { ComponentType, SVGProps } from "react";

/**
 * Product navigation configuration.
 *
 * Each product in BlueSky OS is an independent application that shares the
 * platform shell. A product declares its own sidebar; the shell renders
 * whatever the active product's config specifies, so new products register
 * themselves without editing shared sidebar code.
 *
 * Icons are React components, so configs are a client-side registry — the
 * server layout only passes the active product id (a string) across the
 * RSC boundary.
 */

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavEntry = {
  label: string;
  href: string;
  icon: NavIcon;
  /** Active only on an exact path match (used for a product's Dashboard). */
  exact?: boolean;
  /** Shown only when the product config enables this feature flag. */
  featureFlag?: string;
};

export type NavSection = {
  label: string;
  items: NavEntry[];
};

export type ProductNavConfig = {
  /** Stable identifier, e.g. "platform", "locate". */
  id: string;
  /** Display name, e.g. "BlueSky Locate". */
  name: string;
  icon: NavIcon;
  /** Product accent key for tinting (see src/lib/accents.ts). */
  accentKey?: string;
  /** Where the selector lands when this product becomes active. */
  defaultLanding: string;
  /** Product-owned sidebar sections (Administration is appended globally). */
  sidebar: NavSection[];
  /** Feature toggles gating optional nav entries / modules. */
  featureFlags: Record<string, boolean>;
};
