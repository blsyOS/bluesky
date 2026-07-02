"use client";

import { useEffect } from "react";

/**
 * Keyboard shortcut manager. One document-level listener dispatches to
 * registered combos, so bindings never stack duplicate listeners and later
 * modules can register shortcuts without touching existing code.
 *
 * Combo syntax: "+"-separated, e.g. "mod+k", "shift+/". "mod" is ⌘ on
 * macOS and Ctrl elsewhere.
 */

type Binding = {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
  handler: (e: KeyboardEvent) => void;
  /** Fire even while typing in an input/textarea/select. */
  enableInInputs: boolean;
};

function parseCombo(combo: string) {
  const parts = combo.toLowerCase().split("+");
  return {
    key: parts[parts.length - 1],
    mod: parts.includes("mod"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
  };
}

function isEditingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

class ShortcutManager {
  private bindings = new Set<Binding>();
  private listening = false;

  private onKeyDown = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    for (const b of this.bindings) {
      if (
        e.key.toLowerCase() === b.key &&
        mod === b.mod &&
        e.shiftKey === b.shift &&
        e.altKey === b.alt &&
        (b.enableInInputs || !isEditingTarget(e.target))
      ) {
        e.preventDefault();
        b.handler(e);
        return;
      }
    }
  };

  bind(
    combo: string,
    handler: (e: KeyboardEvent) => void,
    options?: { enableInInputs?: boolean }
  ): () => void {
    const binding: Binding = {
      ...parseCombo(combo),
      handler,
      enableInInputs: options?.enableInInputs ?? false,
    };
    this.bindings.add(binding);
    if (!this.listening && typeof document !== "undefined") {
      document.addEventListener("keydown", this.onKeyDown);
      this.listening = true;
    }
    return () => {
      this.bindings.delete(binding);
      if (this.bindings.size === 0 && this.listening) {
        document.removeEventListener("keydown", this.onKeyDown);
        this.listening = false;
      }
    };
  }
}

export const shortcutManager = new ShortcutManager();

/** React binding for a global shortcut; unbinds on unmount. */
export function useGlobalShortcut(
  combo: string,
  handler: (e: KeyboardEvent) => void,
  options?: { enableInInputs?: boolean }
) {
  useEffect(
    () => shortcutManager.bind(combo, handler, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handler identity is allowed to change; rebinding on each render is intentional and cheap
    [combo, handler, options?.enableInInputs]
  );
}

/** Platform-aware display hint for the palette trigger ("⌘K" / "Ctrl K"). */
export function modKeyLabel(): string {
  if (typeof navigator !== "undefined" && /Mac|iP(hone|ad|od)/.test(navigator.platform)) {
    return "⌘";
  }
  return "Ctrl";
}
