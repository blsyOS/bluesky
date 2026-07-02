import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "elevated" | "interactive" | "dashboard" | "muted";
};

const variants = {
  default: "border-border bg-surface shadow-card",
  elevated: "border-border bg-surface shadow-raised",
  interactive:
    "border-border bg-surface shadow-card transition-all hover:-translate-y-0.5 hover:shadow-raised",
  dashboard: "border-border bg-surface shadow-card",
  muted: "border-border bg-surface-muted shadow-none",
};

export function Card({ variant = "default", className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl border", variants[variant], className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div>
        <h2 className="text-title-card">{title}</h2>
        {description ? <p className="mt-0.5 text-caption">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}
