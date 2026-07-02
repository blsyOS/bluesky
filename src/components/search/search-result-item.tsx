"use client";

import { Badge } from "@/components/ui/badge";
import type { SearchIconComponent, SearchResultBadge } from "@/lib/search/types";
import { cn } from "@/lib/cn";

/**
 * One selectable row in the palette (search result, quick action, recent
 * search). Selection is managed by the palette via aria-activedescendant,
 * so rows are options — not tab stops.
 */
export function SearchResultItem({
  id,
  icon: IconComponent,
  title,
  description,
  categoryLabel,
  badge,
  trailing,
  active,
  onActivate,
  onHover,
}: {
  id: string;
  icon?: SearchIconComponent;
  title: string;
  description?: string;
  categoryLabel?: string;
  badge?: SearchResultBadge;
  /** Right-aligned hint, e.g. a shortcut key. */
  trailing?: React.ReactNode;
  active: boolean;
  onActivate: () => void;
  onHover: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      // Options are activated via Enter or click; the input keeps focus.
      onClick={onActivate}
      onMouseMove={onHover}
      className={cn(
        "relative flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        active ? "bg-surface-muted" : "hover:bg-surface-muted/60"
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute inset-y-2 left-0 w-0.75 rounded-full bg-accent"
        />
      ) : null}
      {IconComponent ? (
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
            active
              ? "bg-accent/10 text-accent"
              : "bg-surface-muted text-muted-foreground"
          )}
        >
          <IconComponent className="size-4" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{title}</span>
          {badge ? <Badge tone={badge.tone ?? "neutral"}>{badge.label}</Badge> : null}
        </span>
        {description ? (
          <span className="block truncate text-caption">{description}</span>
        ) : null}
      </span>
      {categoryLabel ? (
        <span className="hidden shrink-0 text-meta sm:block">{categoryLabel}</span>
      ) : null}
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </div>
  );
}
