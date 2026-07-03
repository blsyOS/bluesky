import {
  BoxesIcon,
  ScrollIcon,
  SettingsIcon,
  ShieldIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";
import { CORE_NOTIFICATION_CATEGORIES } from "../categories";
import { notificationRegistry } from "../registry";
import type { ActivityEntry, AppNotification } from "../types";

/**
 * Built-in placeholder provider. It exists to prove the provider contract
 * and exercise every state the framework supports (priorities, read,
 * pinned, archived, actions, product accents). Real modules replace this
 * pattern with their own providers; none of this touches business data.
 */

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

function at(offsetMs: number): string {
  return new Date(Date.now() - offsetMs).toISOString();
}

const C = CORE_NOTIFICATION_CATEGORIES;

function placeholderNotifications(): AppNotification[] {
  return [
    {
      id: "ph-safety-critical",
      categoryId: C.SAFETY.id,
      priority: "critical",
      title: "Emergency locate request flagged",
      description:
        "A demo critical alert — this is placeholder content until modules register real notifications.",
      icon: ShieldIcon,
      createdAt: at(12 * MINUTE),
      read: false,
      pinned: false,
      archived: false,
      action: { label: "Review" },
    },
    {
      id: "ph-dispatch-high",
      categoryId: C.DISPATCH.id,
      priority: "high",
      title: "Unassigned work approaching due date",
      description: "4 placeholder items are due within 24 hours.",
      icon: BoxesIcon,
      createdAt: at(2 * HOUR),
      read: false,
      pinned: false,
      archived: false,
      accentKey: "LOCATE_OS",
      action: { label: "Open queue" },
    },
    {
      id: "ph-products-normal",
      categoryId: C.PRODUCTS.id,
      priority: "normal",
      title: "SiteView workspace provisioned",
      description: "The SiteView workspace is ready for your company.",
      icon: BoxesIcon,
      createdAt: at(5 * HOUR),
      read: false,
      pinned: false,
      archived: false,
      accentKey: "SITE_VIEW",
      href: "/switcher",
    },
    {
      id: "ph-system-pinned",
      categoryId: C.SYSTEM.id,
      priority: "information",
      title: "Welcome to BlueSky OS",
      description:
        "Pinned notifications stay at the top of the center until unpinned.",
      icon: SparkleIcon,
      createdAt: at(2 * DAY),
      read: true,
      pinned: true,
      archived: false,
    },
    {
      id: "ph-training-low",
      categoryId: C.TRAINING.id,
      priority: "low",
      title: "New training module available",
      description: "Placeholder: Utility Locating Fundamentals refresher.",
      icon: UsersIcon,
      createdAt: at(26 * HOUR),
      read: true,
      pinned: false,
      archived: false,
    },
    {
      id: "ph-updates-normal",
      categoryId: C.UPDATES.id,
      priority: "normal",
      title: "Platform update deployed",
      description: "Navigation, search, and notifications shipped this week.",
      icon: SettingsIcon,
      createdAt: at(3 * DAY),
      read: true,
      pinned: false,
      archived: false,
    },
    {
      id: "ph-general-archived",
      categoryId: C.GENERAL.id,
      priority: "information",
      title: "Archived example notification",
      description: "Archived items live under the Archived filter.",
      icon: ScrollIcon,
      createdAt: at(6 * DAY),
      read: true,
      pinned: false,
      archived: true,
    },
  ];
}

notificationRegistry.registerProvider({
  id: "platform",
  label: "Platform",
  categories: Object.values(C),
  list: placeholderNotifications,
});

function placeholderActivity(): ActivityEntry[] {
  return [
    {
      id: "act-1",
      title: "SiteView enabled for BlueSky Locating",
      description: "Product license activated.",
      timestamp: at(35 * MINUTE),
      icon: BoxesIcon,
      categoryId: C.PRODUCTS.id,
    },
    {
      id: "act-2",
      title: "Dana Fields invited",
      description: "Placeholder teammate invitation.",
      timestamp: at(4 * HOUR),
      icon: UsersIcon,
      categoryId: C.GENERAL.id,
    },
    {
      id: "act-3",
      title: "Viewer role permissions updated",
      description: "audit.view granted.",
      timestamp: at(27 * HOUR),
      icon: ShieldIcon,
      categoryId: C.SYSTEM.id,
    },
    {
      id: "act-4",
      title: "Workspace preferences saved",
      description: "Timezone changed to America/Chicago.",
      timestamp: at(30 * HOUR),
      icon: SettingsIcon,
      categoryId: C.SYSTEM.id,
    },
    {
      id: "act-5",
      title: "Company provisioned",
      description: "BlueSky Locating tenant created with all products.",
      timestamp: at(4 * DAY),
      icon: SparkleIcon,
      categoryId: C.SYSTEM.id,
    },
  ];
}

notificationRegistry.registerActivityProvider({
  id: "platform",
  label: "Platform",
  list: placeholderActivity,
});
