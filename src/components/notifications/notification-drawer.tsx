"use client";

import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BellIcon, InboxIcon, PinIcon, XIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/form";
import { SkeletonList } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ActivityCenter } from "@/components/notifications/activity-center";
import { NotificationCard } from "@/components/notifications/notification-card";
import type { NotificationCenter } from "@/components/notifications/use-notification-center";
import { notificationRegistry } from "@/lib/notifications/registry";
import {
  applyNotificationFilter,
  sectionNotifications,
} from "@/lib/notifications/filters";
import { PRIORITY_META } from "@/lib/notifications/priorities";
import {
  NOTIFICATION_PRIORITIES,
  type AppNotification,
  type NotificationFilter,
} from "@/lib/notifications/types";
import { trapTabKey } from "@/lib/focus-trap";
import { useModalGuards } from "@/lib/use-modal-guards";
import { cn } from "@/lib/cn";

const VIEWS: Array<{ id: NotificationFilter["view"]; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "pinned", label: "Pinned" },
  { id: "archived", label: "Archived" },
];

const VIEW_EMPTY: Record<
  NotificationFilter["view"],
  { title: string; description: string }
> = {
  all: {
    title: "No notifications",
    description: "You're all caught up. New notifications will appear here.",
  },
  unread: {
    title: "You're all caught up",
    description: "No unread notifications match the current filters.",
  },
  pinned: {
    title: "Nothing pinned",
    description: "Pin important notifications to keep them at the top.",
  },
  archived: {
    title: "Archive is empty",
    description: "Archived notifications are kept out of your way here.",
  },
};

/**
 * The slide-out notification center. Mounted lazily by
 * NotificationLauncher; state (including read/pin/archive mutations)
 * lives in useNotificationCenter so the topbar badge stays in sync.
 */
export function NotificationDrawer({
  center,
  onClose,
}: {
  center: NotificationCenter;
  onClose: () => void;
}) {
  const toast = useToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [tab, setTab] = useState<"notifications" | "activity">("notifications");
  const [filter, setFilter] = useState<NotificationFilter>({ view: "all" });

  useModalGuards({
    onClose,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
  });

  const filtered = useMemo(
    () => applyNotificationFilter(center.notifications, filter),
    [center.notifications, filter]
  );
  const sections = useMemo(() => sectionNotifications(filtered), [filtered]);
  const categories = notificationRegistry.getCategories();

  function categoryLabel(n: AppNotification) {
    return notificationRegistry.getCategory(n.categoryId)?.label ?? n.categoryId;
  }

  function renderCard(n: AppNotification) {
    return (
      <NotificationCard
        key={n.id}
        notification={n}
        categoryLabel={categoryLabel(n)}
        onMarkRead={(read) => center.markRead(n.id, read)}
        onTogglePin={() => center.togglePin(n.id)}
        onToggleArchive={() => center.toggleArchive(n.id)}
        onAction={() =>
          toast("info", "Notification actions arrive with module build orders.")
        }
      />
    );
  }

  function renderSection(
    title: string,
    items: AppNotification[],
    icon?: React.ReactNode
  ) {
    if (items.length === 0) return null;
    return (
      <section aria-label={title}>
        <h3 className="mb-2 flex items-center gap-1.5 text-meta">
          {icon}
          {title}
          <span className="text-faint-foreground">({items.length})</span>
        </h3>
        <div className="space-y-2">{items.map(renderCard)}</div>
      </section>
    );
  }

  const body = (() => {
    if (tab === "activity") {
      return (
        <ActivityCenter entries={center.activity} loading={center.loading} />
      );
    }
    if (!notificationRegistry.hasProviders()) {
      return (
        <EmptyState
          icon={<BellIcon />}
          title="No notification providers registered"
          description="Modules register their notifications with the registry as they come online."
          className="py-10"
        />
      );
    }
    if (center.loading) return <SkeletonList rows={4} />;
    if (filtered.length === 0) {
      const empty = VIEW_EMPTY[filter.view];
      return (
        <EmptyState
          icon={<InboxIcon />}
          title={empty.title}
          description={empty.description}
          className="py-10"
        />
      );
    }
    if (filter.view !== "all") {
      return <div className="space-y-2">{filtered.map(renderCard)}</div>;
    }
    return (
      <div className="space-y-5">
        {renderSection(
          "Pinned",
          sections.pinned,
          <PinIcon className="size-3.5" aria-hidden />
        )}
        {renderSection(
          "Unread",
          sections.unread,
          <BellIcon className="size-3.5" aria-hidden />
        )}
        {renderSection("Recent", sections.recent)}
      </div>
    );
  })();

  return createPortal(
    <div
      className="fixed inset-0 z-100"
      onKeyDown={(e) => {
        if (e.key === "Tab" && panelRef.current) trapTabKey(panelRef.current, e);
      }}
    >
      <div
        className="absolute inset-0 animate-fade-in bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notification center"
        className="absolute inset-y-0 right-0 flex w-full max-w-full animate-drawer-in flex-col border-l border-border bg-surface shadow-overlay sm:max-w-md"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5 sm:px-5">
          <h2 className="text-title-section">Notifications</h2>
          {center.summary.unreadCount > 0 ? (
            <Badge tone={center.summary.hasUnreadCritical ? "danger" : "accent"}>
              {center.summary.unreadCount} unread
            </Badge>
          ) : null}
          <span className="flex-1" />
          <button
            type="button"
            onClick={center.markAllRead}
            className="rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            Mark all read
          </button>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Notification center tabs"
          className="flex gap-1 border-b border-border px-4 pt-2 sm:px-5"
        >
          {(
            [
              { id: "notifications", label: "Notifications" },
              { id: "activity", label: "Activity" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "notifications" ? (
          <div className="space-y-2 border-b border-border px-4 py-3 sm:px-5">
            <div
              role="group"
              aria-label="Filter notifications"
              className="flex flex-wrap gap-1"
            >
              {VIEWS.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  aria-pressed={filter.view === view.id}
                  onClick={() => setFilter((f) => ({ ...f, view: view.id }))}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    filter.view === view.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {view.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                aria-label="Filter by category"
                className="h-8 text-xs"
                value={filter.categoryId ?? ""}
                onChange={(e) =>
                  setFilter((f) => ({
                    ...f,
                    categoryId: e.target.value || undefined,
                  }))
                }
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="Filter by priority"
                className="h-8 text-xs"
                value={filter.priority ?? ""}
                onChange={(e) =>
                  setFilter((f) => ({
                    ...f,
                    priority:
                      (e.target.value as NotificationFilter["priority"]) ||
                      undefined,
                  }))
                }
              >
                <option value="">All priorities</option>
                {NOTIFICATION_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {body}
        </div>
      </div>
    </div>,
    document.body
  );
}
