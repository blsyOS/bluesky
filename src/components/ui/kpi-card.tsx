import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type Trend = { direction: "up" | "down" | "flat"; label: string };

function TrendIndicator({ trend }: { trend: Trend }) {
  const arrow =
    trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        trend.direction === "up" && "text-success",
        trend.direction === "down" && "text-danger",
        trend.direction === "flat" && "text-muted-foreground"
      )}
    >
      <span aria-hidden>{arrow}</span>
      {trend.label}
    </span>
  );
}

/**
 * Dashboard metric card. `accented` paints the icon slot with the current
 * `--accent` (scope one via accentStyle(productKey) on a parent, or leave
 * it on the neutral brand color).
 */
export function KpiCard({
  title,
  value,
  helper,
  trend,
  icon,
  accented = false,
  href,
  className,
}: {
  title: string;
  value: React.ReactNode;
  helper?: string;
  trend?: Trend;
  icon?: React.ReactNode;
  accented?: boolean;
  href?: string;
  className?: string;
}) {
  const body = (
    <Card
      variant={href ? "interactive" : "dashboard"}
      className={cn("h-full px-5 py-4", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-meta">{title}</p>
        {icon ? (
          <span
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-lg [&>svg]:size-4.5",
              accented
                ? "bg-accent/10 text-accent"
                : "bg-surface-muted text-muted-foreground"
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-3xl font-semibold tracking-tight">{value}</p>
      {helper || trend ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {trend ? <TrendIndicator trend={trend} /> : null}
          {helper ? <span className="text-caption">{helper}</span> : null}
        </div>
      ) : null}
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
