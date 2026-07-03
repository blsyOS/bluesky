import type { ComponentType, SVGProps } from "react";

/**
 * BlueSky OS notification framework contracts.
 *
 * Future modules (LocateOS, LeakOS, FiberOS, Administration, Training,
 * Reports, AI, …) register a NotificationProvider — and optionally an
 * ActivityProvider and extra categories — with the NotificationRegistry.
 * The notification center never knows which providers exist and providers
 * never reference each other.
 *
 * This build order ships the framework only: no delivery engine, no
 * persistence. Read/pin/archive state lives in the UI session; a
 * persistence-backed store replaces it in a later build order.
 */

export type NotificationIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const NOTIFICATION_PRIORITIES = [
  "critical",
  "high",
  "normal",
  "low",
  "information",
] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export type NotificationCategory = {
  /** Stable identifier, e.g. "system", "dispatch". */
  id: string;
  label: string;
  /** Lower numbers render earlier when grouped. */
  order?: number;
};

export type NotificationAction = {
  /** Placeholder only — real handlers arrive with module build orders. */
  label: string;
};

export type AppNotification = {
  /** Unique within the provider. */
  id: string;
  categoryId: string;
  priority: NotificationPriority;
  title: string;
  description?: string;
  icon?: NotificationIconComponent;
  /** ISO timestamp. */
  createdAt: string;
  read: boolean;
  pinned: boolean;
  archived: boolean;
  /** Optional destination when the card is opened. */
  href?: string;
  action?: NotificationAction;
  /** Product key for accent tinting (see src/lib/accents.ts). */
  accentKey?: string;
};

export interface NotificationProvider {
  /** Stable identifier, e.g. "platform", "locate-os". */
  id: string;
  label: string;
  /** Categories this provider emits; auto-registered with the registry. */
  categories?: NotificationCategory[];
  /** Current notifications. Sync or async; no pagination yet. */
  list(): Promise<AppNotification[]> | AppNotification[];
}

export type ActivityEntry = {
  id: string;
  title: string;
  description?: string;
  /** ISO timestamp; entries group by calendar day. */
  timestamp: string;
  icon?: NotificationIconComponent;
  categoryId?: string;
};

export interface ActivityProvider {
  id: string;
  label: string;
  list(): Promise<ActivityEntry[]> | ActivityEntry[];
}

/** Drawer filter state. Framework only — never persisted. */
export type NotificationFilter = {
  view: "all" | "unread" | "pinned" | "archived";
  categoryId?: string;
  priority?: NotificationPriority;
};
