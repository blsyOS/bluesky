"use client";

// Registers the built-in placeholder provider on import. Future modules
// add their own side-effect import here or in their module entry.
import "@/lib/notifications/providers/platform";

import { useEffect, useState } from "react";
import { notificationRegistry } from "@/lib/notifications/registry";
import { summarizeNotifications } from "@/lib/notifications/filters";
import type { ActivityEntry, AppNotification } from "@/lib/notifications/types";

/**
 * Session state for the notification center. Loads once from the registry;
 * read/pin/archive mutations update local state only — persistence arrives
 * with authenticated user preferences in a later build order.
 */
export function useNotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      notificationRegistry.load(),
      notificationRegistry.loadActivity(),
    ]).then(([loadedNotifications, loadedActivity]) => {
      if (cancelled) return;
      setNotifications(loadedNotifications);
      setActivity(loadedActivity);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function update(id: string, patch: Partial<AppNotification>) {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, ...patch } : n))
    );
  }

  return {
    notifications,
    activity,
    loading,
    summary: summarizeNotifications(notifications),
    markRead: (id: string, read = true) => update(id, { read }),
    markAllRead: () =>
      setNotifications((current) =>
        current.map((n) => (n.archived ? n : { ...n, read: true }))
      ),
    togglePin: (id: string) =>
      setNotifications((current) =>
        current.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
      ),
    toggleArchive: (id: string) =>
      setNotifications((current) =>
        current.map((n) =>
          n.id === id
            ? { ...n, archived: !n.archived, pinned: n.archived ? n.pinned : false }
            : n
        )
      ),
  };
}

export type NotificationCenter = ReturnType<typeof useNotificationCenter>;
