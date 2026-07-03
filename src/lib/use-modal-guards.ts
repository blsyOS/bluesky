"use client";

import { useEffect, type RefObject } from "react";
import { focusEscaped } from "@/lib/focus-trap";

/**
 * Shared behavior for full-screen modal layers (command palette,
 * notification drawer): locks body scroll, closes on Escape from any
 * focus state, and pulls focus back inside if the focused element was
 * removed (Tab from <body> re-enters the layer).
 */
export function useModalGuards({
  onClose,
  containerRef,
  initialFocusRef,
}: {
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && focusEscaped(containerRef.current)) {
        e.preventDefault();
        initialFocusRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, containerRef, initialFocusRef]);
}
