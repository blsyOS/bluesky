"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { BellIcon } from "@/components/icons";
import { useNotificationCenter } from "@/components/notifications/use-notification-center";
import { cn } from "@/lib/cn";

// The drawer is code-split and only fetched on first open, keeping it out
// of the initial page load.
const NotificationDrawer = dynamic(
  () =>
    import("@/components/notifications/notification-drawer").then(
      (m) => m.NotificationDrawer
    ),
  { ssr: false }
);

/**
 * Topbar bell: unread-count badge with a critical indicator, owning the
 * single global notification drawer instance. Center state lives here so
 * the badge updates as notifications are read/archived in the drawer.
 */
export function NotificationLauncher() {
  const [open, setOpen] = useState(false);
  const center = useNotificationCenter();
  const { unreadCount, hasUnreadCritical } = center.summary;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread${hasUnreadCritical ? ", includes critical" : ""}`
            : "Notifications"
        }
        className="relative inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground cursor-pointer sm:size-10"
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 ? (
          <span
            aria-hidden
            className={cn(
              "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white",
              hasUnreadCritical ? "bg-danger" : "bg-primary"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <NotificationDrawer center={center} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
