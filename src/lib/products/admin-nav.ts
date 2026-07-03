import {
  BoxesIcon,
  ScrollIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";
import type { NavSection } from "./types";

/**
 * Global Administration section. Appended to every product's sidebar so
 * platform administration is always reachable regardless of active product.
 */
export const ADMIN_SECTION: NavSection = {
  label: "Administration",
  items: [
    { label: "Products", href: "/products", icon: BoxesIcon },
    { label: "Users", href: "/users", icon: UsersIcon },
    { label: "Roles & Permissions", href: "/roles", icon: ShieldIcon },
    { label: "Audit Logs", href: "/audit-logs", icon: ScrollIcon },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
  ],
};
