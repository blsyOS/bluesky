import { cn } from "@/lib/cn";

export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "accent";

const tones: Record<BadgeTone, string> = {
  success: "bg-success/10 text-success ring-success/25",
  warning: "bg-warning/10 text-warning ring-warning/25",
  danger: "bg-danger/10 text-danger ring-danger/25",
  info: "bg-info/10 text-info ring-info/25",
  neutral: "bg-surface-muted text-muted-foreground ring-border-strong/60",
  accent: "bg-accent/10 text-accent ring-accent/25",
};

/** Entity status → badge tone. Statuses also render their text, never color alone. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "active":
    case "success":
      return "success";
    case "trial":
    case "invited":
    case "info":
      return "info";
    case "coming_soon":
    case "warning":
      return "warning";
    case "suspended":
    case "danger":
      return "danger";
    case "inactive":
    case "disabled":
    default:
      return "neutral";
  }
}

export function Badge({
  tone = "neutral",
  className,
  style,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTone(status)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
