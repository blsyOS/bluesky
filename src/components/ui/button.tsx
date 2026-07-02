import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline" | "subtle";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-card",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-surface-muted",
  ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  destructive:
    "border border-danger/30 bg-surface text-danger hover:bg-danger/10",
  outline:
    "border border-border-strong bg-transparent text-foreground hover:bg-surface-muted",
  subtle: "bg-surface-muted text-foreground hover:bg-border",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors cursor-pointer",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
