"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendIndicator } from "@/components/ui/kpi-card";
import { usePopover } from "@/components/shell/use-popover";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  InboxIcon,
  SettingsIcon,
} from "@/components/icons";
import type {
  DashboardWidget,
  WidgetAction,
  WidgetActionContext,
} from "@/lib/dashboards/types";
import { accentStyle } from "@/lib/accents";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Standard actions every widget gets; widget-defined actions append. */
const STANDARD_ACTIONS: WidgetAction[] = [
  {
    id: "view-details",
    label: "View details",
    perform: (ctx) => ctx.notify("Widget detail views arrive with module build orders."),
  },
  { id: "refresh", label: "Refresh", perform: (ctx) => ctx.refresh() },
  { id: "configure", label: "Configure", perform: (ctx) => ctx.configure() },
  { id: "hide", label: "Hide widget", perform: (ctx) => ctx.hide() },
];

function WidgetActionMenu({
  widget,
  context,
}: {
  widget: DashboardWidget;
  context: WidgetActionContext;
}) {
  const { open, setOpen, containerRef, triggerRef } =
    usePopover<HTMLDivElement>();
  const actions = [...(widget.actions ?? []), ...STANDARD_ACTIONS];

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Actions for ${widget.title}`}
        className="flex size-8 items-center justify-center rounded-lg text-faint-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <ChevronDownIcon className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={`${widget.title} actions`}
          className="absolute right-0 z-40 mt-1 w-44 rounded-xl border border-border bg-surface p-1.5 shadow-overlay"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                action.perform(context);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-muted"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Future-ready configuration placeholder shown in place of the body. */
function WidgetConfigPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
        <SettingsIcon className="size-5" />
      </span>
      <p className="mt-3 text-sm font-medium">Widget configuration</p>
      <p className="mt-1 max-w-55 text-caption">
        Sizing, thresholds, and data options arrive with user dashboard
        preferences in a later build order.
      </p>
      <Button size="sm" variant="secondary" className="mt-4" onClick={onBack}>
        Back to widget
      </Button>
    </div>
  );
}

function WidgetBody({ widget }: { widget: DashboardWidget }) {
  const state = widget.state ?? "ready";

  if (widget.status === "coming_soon") {
    return (
      <EmptyState
        icon={widget.icon ? <widget.icon /> : <InboxIcon />}
        title="Coming soon"
        description={widget.description ?? "This widget arrives with a later build order."}
        className="py-6"
      />
    );
  }
  if (state === "loading") {
    return (
      <div aria-busy="true" className="space-y-2 py-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    );
  }
  if (state === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-3 text-sm"
      >
        <p className="font-medium text-danger">Something went wrong</p>
        <p className="mt-0.5 text-caption">
          {widget.errorMessage ?? "This widget couldn't load. Try refreshing."}
        </p>
      </div>
    );
  }
  if (state === "empty") {
    return (
      <EmptyState
        icon={<InboxIcon />}
        title={widget.emptyMessage ?? "Nothing to show yet"}
        className="py-6"
      />
    );
  }

  return (
    <>
      {widget.metric ? (
        <div>
          <p className="text-3xl font-semibold tracking-tight">
            {widget.metric.value}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {widget.metric.trend ? (
              <TrendIndicator trend={widget.metric.trend} />
            ) : null}
            {widget.metric.helper ? (
              <span className="text-caption">{widget.metric.helper}</span>
            ) : null}
          </div>
        </div>
      ) : null}
      {widget.description && !widget.metric ? (
        <p className="text-caption">{widget.description}</p>
      ) : null}
      {widget.render ? (
        <div className={cn(widget.metric && "mt-3")}>{widget.render()}</div>
      ) : null}
    </>
  );
}

/**
 * The reusable dashboard widget card. Everything a module widget needs:
 * accent-aware icon tile, status badge, action menu, all body states, a
 * configuration placeholder, footer, and an "updated … ago" timestamp.
 */
export function WidgetCard({
  widget,
  context,
}: {
  widget: DashboardWidget;
  context: WidgetActionContext;
}) {
  const [configuring, setConfiguring] = useState(false);
  const comingSoon = widget.status === "coming_soon";

  return (
    <Card
      variant="dashboard"
      style={widget.accentKey ? accentStyle(widget.accentKey) : undefined}
      className={cn("flex h-full flex-col", comingSoon && "opacity-70")}
      aria-label={widget.title}
    >
      <div className="flex items-start gap-3 px-4 pb-2 pt-4 sm:px-5">
        {widget.icon ? (
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <widget.icon className="size-4" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-title-card">{widget.title}</h3>
          {widget.subtitle ? (
            <p className="truncate text-caption">{widget.subtitle}</p>
          ) : null}
        </div>
        {comingSoon ? <Badge tone="warning">Coming soon</Badge> : null}
        <WidgetActionMenu
          widget={widget}
          context={{ ...context, configure: () => setConfiguring(true) }}
        />
      </div>

      <div className="flex-1 px-4 pb-3 sm:px-5">
        {configuring ? (
          <WidgetConfigPlaceholder onBack={() => setConfiguring(false)} />
        ) : (
          <WidgetBody widget={widget} />
        )}
      </div>

      {widget.footer || widget.timestamp || widget.href ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-4 py-2.5 text-xs text-faint-foreground sm:px-5">
          {widget.footer ? <span className="min-w-0">{widget.footer}</span> : null}
          <span className="flex-1" />
          {widget.timestamp ? (
            <time dateTime={widget.timestamp}>
              Updated {formatRelativeTime(widget.timestamp)}
            </time>
          ) : null}
          {widget.href ? (
            <Link
              href={widget.href}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Open <ArrowRightIcon className="size-3.5" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
