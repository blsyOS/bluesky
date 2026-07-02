import { cn } from "@/lib/cn";

type Tone = "green" | "gray" | "blue" | "amber" | "red" | "purple";

const tones: Record<Tone, string> = {
  green:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-500/30",
  gray: "bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-400/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-400 dark:ring-blue-500/30",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-500/30",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-500/30",
  purple:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/50 dark:text-violet-400 dark:ring-violet-500/30",
};

/** Maps entity statuses to a badge tone. */
export function statusTone(status: string): Tone {
  switch (status) {
    case "active":
      return "green";
    case "trial":
    case "invited":
      return "blue";
    case "coming_soon":
      return "amber";
    case "suspended":
      return "red";
    default:
      return "gray";
  }
}

export function Badge({
  tone = "gray",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{status.replace(/_/g, " ")}</Badge>;
}
