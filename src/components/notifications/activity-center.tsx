"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { ScrollIcon } from "@/components/icons";
import { groupActivityByDay } from "@/lib/notifications/activity";
import type { ActivityEntry } from "@/lib/notifications/types";
import { formatRelativeTime } from "@/lib/format";

/**
 * Reusable activity feed grouped by day. Built for the notification
 * drawer today and future dashboard/manager/employee widgets — pass any
 * ActivityEntry list (typically from notificationRegistry.loadActivity()).
 */
export function ActivityCenter({
  entries,
  loading = false,
  emptyTitle = "No activity yet",
  emptyDescription = "Activity from your modules will appear here.",
}: {
  entries: ActivityEntry[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (loading) return <SkeletonList rows={5} />;

  const groups = groupActivityByDay(entries);
  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<ScrollIcon />}
        title={emptyTitle}
        description={emptyDescription}
        className="py-10"
      />
    );
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.day} aria-label={group.label}>
          <h3 className="mb-2 text-meta">{group.label}</h3>
          <ol className="space-y-3 border-l border-border pl-4">
            {group.entries.map((entry) => {
              const IconComponent = entry.icon ?? ScrollIcon;
              return (
                <li key={entry.id} className="relative flex gap-3">
                  <span
                    aria-hidden
                    className="absolute -left-[21.5px] top-1.5 size-2.5 rounded-full border-2 border-surface bg-primary"
                  />
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                    <IconComponent className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{entry.title}</p>
                    {entry.description ? (
                      <p className="text-caption">{entry.description}</p>
                    ) : null}
                    <time
                      dateTime={entry.timestamp}
                      className="text-xs text-faint-foreground"
                    >
                      {formatRelativeTime(entry.timestamp)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
