"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArchiveIcon, BellIcon, PinIcon } from "@/components/icons";
import { PRIORITY_META } from "@/lib/notifications/priorities";
import type { AppNotification } from "@/lib/notifications/types";
import { accentStyle } from "@/lib/accents";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Priority chip rendered consistently everywhere notifications appear. */
export function PriorityBadge({
  priority,
}: {
  priority: AppNotification["priority"];
}) {
  const meta = PRIORITY_META[priority];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/**
 * Reusable notification card (drawer, future dashboards/widgets).
 * Read/pin/archive are controlled; the action button is a placeholder
 * until module build orders attach real handlers.
 */
export function NotificationCard({
  notification,
  categoryLabel,
  onMarkRead,
  onTogglePin,
  onToggleArchive,
  onAction,
}: {
  notification: AppNotification;
  categoryLabel: string;
  onMarkRead: (read: boolean) => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onAction?: () => void;
}) {
  const n = notification;
  const IconComponent = n.icon ?? BellIcon;

  return (
    <article
      aria-label={`${n.read ? "" : "Unread: "}${n.title}`}
      style={n.accentKey ? accentStyle(n.accentKey) : undefined}
      className={cn(
        "group relative rounded-xl border px-4 py-3 transition-colors",
        n.read
          ? "border-border bg-surface"
          : "border-border bg-accent/[0.04] hover:bg-accent/[0.07]"
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
            n.read
              ? "bg-surface-muted text-muted-foreground"
              : "bg-accent/10 text-accent"
          )}
        >
          <IconComponent className="size-4.5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p
              className={cn(
                "min-w-0 flex-1 text-sm",
                n.read ? "font-medium" : "font-semibold"
              )}
            >
              {!n.read ? (
                <span
                  className="mr-1.5 inline-block size-2 rounded-full bg-accent align-middle"
                  aria-hidden
                />
              ) : null}
              {n.title}
            </p>
            <time
              dateTime={n.createdAt}
              className="shrink-0 text-xs text-faint-foreground"
            >
              {formatRelativeTime(n.createdAt)}
            </time>
          </div>

          {n.description ? (
            <p className="mt-0.5 text-caption">{n.description}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={n.priority} />
            <Badge tone="neutral">{categoryLabel}</Badge>
            {n.pinned ? (
              <Badge tone="accent">
                <PinIcon className="size-3" aria-hidden /> Pinned
              </Badge>
            ) : null}
            {n.archived ? (
              <Badge tone="neutral">
                <ArchiveIcon className="size-3" aria-hidden /> Archived
              </Badge>
            ) : null}
            <span className="flex-1" />
            {n.action ? (
              <Button size="sm" variant="secondary" onClick={onAction}>
                {n.action.label}
              </Button>
            ) : null}
          </div>

          <div className="mt-2 flex items-center gap-1 border-t border-border/70 pt-2">
            <CardControl
              label={n.read ? "Mark as unread" : "Mark as read"}
              onClick={() => onMarkRead(!n.read)}
            >
              {n.read ? "Mark unread" : "Mark read"}
            </CardControl>
            <CardControl
              label={n.pinned ? "Unpin notification" : "Pin notification"}
              onClick={onTogglePin}
            >
              {n.pinned ? "Unpin" : "Pin"}
            </CardControl>
            <CardControl
              label={n.archived ? "Restore from archive" : "Archive notification"}
              onClick={onToggleArchive}
            >
              {n.archived ? "Restore" : "Archive"}
            </CardControl>
          </div>
        </div>
      </div>
    </article>
  );
}

function CardControl({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
