"use client";

// Registers the built-in platform provider + quick actions on import.
// Future modules add their own side-effect import here or in their entry.
import "@/lib/search/providers/platform";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { useGlobalShortcut, modKeyLabel } from "@/lib/shortcuts";

// The palette is code-split and only fetched on first open, keeping it out
// of the initial page load.
const CommandPalette = dynamic(
  () =>
    import("@/components/search/command-palette").then(
      (m) => m.CommandPalette
    ),
  { ssr: false }
);

/**
 * The app's single search entry point: renders the topbar trigger, owns the
 * open state, and binds ⌘K / Ctrl+K. Mounted once in the shell so there is
 * exactly one global palette.
 */
export function SearchLauncher() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  useGlobalShortcut("mod+k", toggle, { enableInInputs: true });

  return (
    <>
      {/* Icon button below sm; search pill on larger screens */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Search"
        aria-haspopup="dialog"
        className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground cursor-pointer sm:hidden"
      >
        <SearchIcon className="size-5" />
      </button>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        className="hidden h-10 w-full max-w-sm items-center gap-2.5 rounded-full border border-border bg-surface px-4 text-sm text-muted-foreground shadow-card transition-colors hover:border-border-strong cursor-pointer sm:flex"
      >
        <SearchIcon className="size-4" aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium">
          {modKeyLabel()} K
        </kbd>
      </button>

      {open ? <CommandPalette onClose={close} /> : null}
    </>
  );
}
