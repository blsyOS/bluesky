import { PRIORITY_META } from "./priorities";
import type { AppNotification, NotificationFilter } from "./types";

/**
 * Pure filtering/sectioning helpers for the notification center. Kept
 * framework-only (no persistence, no React) so they are unit-testable and
 * reusable by future dashboard widgets.
 */

export function applyNotificationFilter(
  notifications: AppNotification[],
  filter: NotificationFilter
): AppNotification[] {
  return notifications.filter((n) => {
    if (filter.view === "unread" && (n.read || n.archived)) return false;
    if (filter.view === "pinned" && (!n.pinned || n.archived)) return false;
    if (filter.view === "archived" && !n.archived) return false;
    // "all" hides archived items; they live under the Archived view.
    if (filter.view === "all" && n.archived) return false;
    if (filter.categoryId && n.categoryId !== filter.categoryId) return false;
    if (filter.priority && n.priority !== filter.priority) return false;
    return true;
  });
}

export type NotificationSections = {
  pinned: AppNotification[];
  unread: AppNotification[];
  recent: AppNotification[];
};

/**
 * Sections for the default "all" view: pinned first, then unread, then the
 * read remainder. A notification appears in exactly one section.
 */
export function sectionNotifications(
  notifications: AppNotification[]
): NotificationSections {
  const pinned: AppNotification[] = [];
  const unread: AppNotification[] = [];
  const recent: AppNotification[] = [];
  for (const n of notifications) {
    if (n.pinned) pinned.push(n);
    else if (!n.read) unread.push(n);
    else recent.push(n);
  }
  return { pinned, unread, recent };
}

export type NotificationSummary = {
  unreadCount: number;
  hasUnreadCritical: boolean;
};

/** Badge inputs for the topbar bell. Archived items never count. */
export function summarizeNotifications(
  notifications: AppNotification[]
): NotificationSummary {
  let unreadCount = 0;
  let hasUnreadCritical = false;
  for (const n of notifications) {
    if (n.archived || n.read) continue;
    unreadCount += 1;
    if (n.priority === "critical") hasUnreadCritical = true;
  }
  return { unreadCount, hasUnreadCritical };
}

/** Sorts by priority rank (critical first), then newest first. */
export function sortByPriority(
  notifications: AppNotification[]
): AppNotification[] {
  return [...notifications].sort((a, b) => {
    const rank = PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank;
    if (rank !== 0) return rank;
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}
