"use client";

/**
 * Shared modal focus helpers, used by the command palette and the
 * notification drawer so trap behavior stays identical everywhere.
 */

const FOCUSABLE_SELECTOR =
  "input, select, textarea, button, a[href], [tabindex]:not([tabindex='-1'])";

function focusables(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
  );
}

/**
 * Call from a container's Tab keydown: wraps focus at the edges so it
 * cycles inside `container`.
 */
export function trapTabKey(container: HTMLElement, e: { shiftKey: boolean; preventDefault: () => void }) {
  const items = focusables(container);
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/** True when focus is currently outside `container` (or on <body>). */
export function focusEscaped(container: HTMLElement | null): boolean {
  return !container?.contains(document.activeElement);
}
