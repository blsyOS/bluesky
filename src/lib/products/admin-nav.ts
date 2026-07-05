import {
  BoxesIcon,
  BuildingIcon,
  ChartBarIcon,
  ContactIcon,
  ScrollIcon,
  SettingsIcon,
  ShieldIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";
import type { NavSection } from "./types";

/**
 * BlueSky OS has two admin scopes (BO-02.01B):
 *
 * - Organization Administration — each tenant manages its own organization
 *   (requires `company.manage`).
 * - Platform Administration — BlueSky platform administrators manage
 *   companies, catalog, licensing, billing, and platform settings
 *   (requires `platform.manage`). Never shown to normal company admins.
 *
 * Both are appended globally after the active product's sections.
 */
export const ORG_SECTION: NavSection = {
  label: "Organization",
  items: [
    { label: "Organization", href: "/company", icon: BuildingIcon },
    { label: "Products", href: "/products", icon: BoxesIcon },
    { label: "Users", href: "/users", icon: UsersIcon },
    { label: "Roles & Permissions", href: "/roles", icon: ShieldIcon },
    { label: "Audit Logs", href: "/audit-logs", icon: ScrollIcon },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
  ],
};

export const PLATFORM_SECTION: NavSection = {
  label: "Platform",
  items: [
    { label: "Companies", href: "/platform/companies", icon: BuildingIcon },
    { label: "Product Catalog", href: "/platform/catalog", icon: BoxesIcon },
    { label: "Licensing", href: "/platform/licensing", icon: ShieldIcon },
    { label: "Billing", href: "/platform/billing", icon: ChartBarIcon },
    { label: "Feature Management", href: "/platform/features", icon: SettingsIcon },
    { label: "System Health", href: "/platform/health", icon: SparkleIcon },
    { label: "Support Tools", href: "/platform/support", icon: ContactIcon },
  ],
};

export type AdminAccess = {
  /** Holds `company.manage` — may administer their own organization. */
  organization: boolean;
  /** Holds `platform.manage` — BlueSky platform administrator. */
  platform: boolean;
};

/** Admin sections visible for a user's permissions, in display order. */
export function adminSectionsFor(access: AdminAccess): NavSection[] {
  const sections: NavSection[] = [];
  if (access.organization) sections.push(ORG_SECTION);
  if (access.platform) sections.push(PLATFORM_SECTION);
  return sections;
}
