import {
  BoxesIcon,
  DashboardIcon,
  GridIcon,
  MoonIcon,
  ScrollIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";
import { CORE_CATEGORIES } from "../categories";
import { searchRegistry } from "../registry";
import type { SearchResult } from "../types";

/**
 * Built-in provider: platform navigation only. It demonstrates the provider
 * contract future modules implement — no business data is queried.
 * Registration happens on import (see SearchLauncher).
 */

const PAGE_ENTRIES: Array<Omit<SearchResult, "categoryId" | "score">> = [
  {
    id: "page-dashboard",
    title: "Dashboard",
    description: "Company overview and recent activity",
    href: "/dashboard",
    icon: DashboardIcon,
    keywords: ["home", "overview", "kpi"],
  },
  {
    id: "page-products",
    title: "Products",
    description: "Product licenses for your company",
    href: "/products",
    icon: BoxesIcon,
    keywords: ["licenses", "enable", "disable"],
  },
  {
    id: "page-switcher",
    title: "Product Switcher",
    description: "Jump into a product workspace",
    href: "/switcher",
    icon: GridIcon,
    keywords: ["launch", "apps", "workspaces"],
  },
  {
    id: "page-users",
    title: "Users",
    description: "Invite teammates and manage product access",
    href: "/users",
    icon: UsersIcon,
    keywords: ["people", "invite", "teammates", "access"],
  },
  {
    id: "page-roles",
    title: "Roles & Permissions",
    description: "What users can do inside each product",
    href: "/roles",
    icon: ShieldIcon,
    keywords: ["rbac", "permissions", "security"],
  },
  {
    id: "page-audit-logs",
    title: "Audit Logs",
    description: "Chronological record of admin actions",
    href: "/audit-logs",
    icon: ScrollIcon,
    keywords: ["history", "activity", "trail", "compliance"],
  },
  {
    id: "page-settings",
    title: "Company Settings",
    description: "Company profile and workspace preferences",
    href: "/settings",
    icon: SettingsIcon,
    keywords: ["preferences", "timezone", "theme", "profile"],
  },
];

function scoreEntry(
  entry: (typeof PAGE_ENTRIES)[number],
  text: string
): number | null {
  const q = text.toLowerCase();
  const title = entry.title.toLowerCase();
  if (title === q) return 1;
  if (title.startsWith(q)) return 0.8;
  if (title.includes(q)) return 0.6;
  if (entry.keywords?.some((k) => k.toLowerCase().includes(q))) return 0.4;
  if (entry.description?.toLowerCase().includes(q)) return 0.3;
  return null;
}

searchRegistry.registerProvider({
  id: "platform",
  label: "Platform",
  categories: [CORE_CATEGORIES.PAGES],
  search({ text, limit = 8 }) {
    const results: SearchResult[] = [];
    for (const entry of PAGE_ENTRIES) {
      const score = scoreEntry(entry, text);
      if (score !== null) {
        results.push({ ...entry, categoryId: CORE_CATEGORIES.PAGES.id, score });
      }
    }
    return results.slice(0, limit);
  },
});

/** Pages suggested in the palette's idle state. */
export const SUGGESTED_PAGES: SearchResult[] = PAGE_ENTRIES.slice(0, 4).map(
  (entry) => ({ ...entry, categoryId: CORE_CATEGORIES.PAGES.id })
);

searchRegistry.registerCategory(CORE_CATEGORIES.ACTIONS);

const QUICK_ACTIONS = [
  {
    id: "go-dashboard",
    label: "Go to Dashboard",
    icon: DashboardIcon,
    keywords: ["home", "overview"],
    href: "/dashboard",
  },
  {
    id: "open-users",
    label: "Open Users",
    icon: UsersIcon,
    keywords: ["people", "invite"],
    href: "/users",
  },
  {
    id: "open-products",
    label: "Open Products",
    icon: BoxesIcon,
    keywords: ["licenses"],
    href: "/products",
  },
  {
    id: "open-settings",
    label: "Open Settings",
    icon: SettingsIcon,
    keywords: ["preferences", "company"],
    href: "/settings",
  },
  {
    id: "switch-product",
    label: "Switch Product",
    icon: GridIcon,
    keywords: ["launch", "workspace", "apps"],
    href: "/switcher",
  },
] as const;

for (const action of QUICK_ACTIONS) {
  searchRegistry.registerQuickAction({
    id: action.id,
    label: action.label,
    icon: action.icon,
    keywords: [...action.keywords],
    perform: (ctx) => ctx.navigate(action.href),
  });
}

searchRegistry.registerQuickAction({
  id: "toggle-theme",
  label: "Toggle Theme",
  icon: MoonIcon,
  keywords: ["dark", "light", "appearance", "mode"],
  perform: (ctx) => {
    ctx.toggleTheme();
    ctx.close();
  },
});

searchRegistry.registerQuickAction({
  id: "open-profile",
  label: "Open Profile",
  icon: UsersIcon,
  keywords: ["account", "me", "avatar"],
  perform: (ctx) => {
    ctx.notify("My Profile is coming in a future release.");
    ctx.close();
  },
});
