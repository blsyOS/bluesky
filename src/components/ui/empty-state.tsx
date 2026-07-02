import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      {icon ? (
        <span className="mb-3 inline-flex size-11 items-center justify-center rounded-full bg-surface-muted text-muted-foreground [&>svg]:size-5">
          {icon}
        </span>
      ) : null}
      <h3 className="text-title-card">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-caption">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
