import { cn } from "@/lib/cn";

/** BlueSky OS mark: a sky-gradient rounded square with a cloud silhouette. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M17.5 18h-10a4 4 0 01-.6-7.95 5.5 5.5 0 0110.66-1.1A4.5 4.5 0 0117.5 18z" />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-base font-semibold tracking-tight">
        BlueSky <span className="font-light opacity-80">OS</span>
      </span>
    </span>
  );
}
