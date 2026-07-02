"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { usePopover } from "@/components/shell/use-popover";
import { useToast } from "@/components/ui/toast";
import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export type MenuUser = {
  name: string;
  email: string;
  initials: string;
  role: string;
  companyName: string;
};

const PLACEHOLDER_ITEMS = [
  "My Profile",
  "Preferences",
  "Keyboard Shortcuts",
  "Help",
] as const;

const THEME_OPTIONS = ["light", "dark", "system"] as const;

export function UserMenu({ user }: { user: MenuUser }) {
  const { open, setOpen, containerRef, triggerRef } =
    usePopover<HTMLDivElement>();
  const toast = useToast();
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.name}`}
        className="inline-flex h-11 min-w-11 items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-surface-muted cursor-pointer sm:pr-2"
      >
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          {user.initials}
        </span>
        <ChevronDownIcon
          className={cn(
            "hidden size-4 text-muted-foreground transition-transform sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-overlay"
        >
          <div className="flex items-center gap-3 border-b border-border px-3 pb-3 pt-2">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {user.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-caption">{user.companyName}</p>
              <p className="mt-0.5 text-meta">{user.role}</p>
            </div>
          </div>

          <div className="py-1.5">
            {PLACEHOLDER_ITEMS.map((label) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  toast("info", `${label} is coming in a future release.`);
                }}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-muted"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="border-t border-border px-3 py-2.5">
            <p className="mb-1.5 text-meta">Theme</p>
            <div
              role="radiogroup"
              aria-label="Theme"
              className="grid grid-cols-3 gap-1 rounded-lg bg-surface-muted p-1"
            >
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={theme === option}
                  onClick={() => setTheme(option)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors",
                    theme === option
                      ? "bg-surface text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-1.5">
            <Link
              href="/login"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              Log out
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
