import { cn } from "@/lib/cn";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-label", className)} {...props} />;
}

const fieldClasses =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground " +
  "placeholder:text-faint-foreground transition-colors hover:border-border-strong " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(fieldClasses, "min-h-24", className)} {...props} />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClasses, "h-9", className)} {...props} />;
}

export function Checkbox({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn("size-4 shrink-0 accent-(--primary)", className)}
      {...props}
    />
  );
}

/**
 * Form-friendly switch: a visually-styled native checkbox, so it submits
 * with plain <form> posts and stays keyboard accessible.
 */
export function Switch({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5 text-sm",
        className
      )}
    >
      <span className="relative inline-flex h-5 w-9">
        {/* The input itself is the (invisible) hit area covering the track,
            so the whole switch is directly clickable/tappable. */}
        <input
          type="checkbox"
          role="switch"
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-border-strong transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-card transition-transform peer-checked:translate-x-4"
        />
      </span>
      {label}
    </label>
  );
}

export function InlineError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-xs font-medium text-danger">
      {children}
    </p>
  );
}

export function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-caption">{children}</p>;
}

export function Field({
  label,
  htmlFor,
  error,
  helper,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <InlineError>{error}</InlineError> : null}
      {helper && !error ? <HelperText>{helper}</HelperText> : null}
    </div>
  );
}
