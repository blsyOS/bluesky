"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SearchIcon, ClockIcon, XIcon } from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { SearchResultItem } from "@/components/search/search-result-item";
import {
  AiPlaceholder,
  NoProvidersState,
  NoRecentSearchesState,
  NoResultsState,
  SearchingState,
} from "@/components/search/search-states";
import { searchRegistry } from "@/lib/search/registry";
import { recentSearches } from "@/lib/search/recent";
import { SUGGESTED_PAGES } from "@/lib/search/providers/platform";
import type {
  QuickActionContext,
  SearchResultBadge,
  SearchIconComponent,
  SearchResultGroup,
} from "@/lib/search/types";

const SEARCH_DEBOUNCE_MS = 180;
const LISTBOX_ID = "bsky-search-listbox";

type PaletteItem = {
  key: string;
  icon?: SearchIconComponent;
  title: string;
  description?: string;
  categoryLabel?: string;
  badge?: SearchResultBadge;
  run: () => void;
};

type PaletteSection = {
  id: string;
  label: string;
  headerAction?: React.ReactNode;
  items: PaletteItem[];
  emptyState?: React.ReactNode;
};

/**
 * The single global command palette (mounted once by SearchLauncher).
 * Combobox pattern: focus stays in the input; options are selected with
 * arrows + Enter via aria-activedescendant.
 */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "searching" | "done">("idle");
  const [groups, setGroups] = useState<SearchResultGroup[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentVersion, setRecentVersion] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const actionContext: QuickActionContext = useMemo(
    () => ({
      navigate: (href) => {
        router.push(href);
        onClose();
      },
      toggleTheme: () =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      notify: (message) => toast("info", message),
      close: onClose,
    }),
    [router, onClose, setTheme, resolvedTheme, toast]
  );

  // Debounced provider fan-out; stale responses are dropped.
  useEffect(() => {
    const text = query.trim();
    if (!text) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const resultGroups = await searchRegistry.search({ text });
      if (cancelled) return;
      setGroups(resultGroups);
      setStatus("done");
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Lock body scroll while the palette is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Document-level guards: Escape always closes, and if focus ever escapes
  // the dialog (e.g. the focused element was removed), Tab re-enters it.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && !dialogRef.current?.contains(document.activeElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const sections = useMemo<PaletteSection[]>(() => {
    if (status === "searching") return [];

    if (status === "done") {
      const trimmed = query.trim();
      const actionItems = searchRegistry
        .getQuickActions(trimmed)
        .map((action) => ({
          key: `action-${action.id}`,
          icon: action.icon,
          title: action.label,
          description: action.description,
          categoryLabel: "Action",
          run: () => action.perform(actionContext),
        }));
      const resultSections = groups.map((group) => ({
        id: `group-${group.category.id}`,
        label: group.category.label,
        items: group.results.map((result) => ({
          key: `result-${result.id}`,
          icon: result.icon,
          title: result.title,
          description: result.description,
          categoryLabel: group.category.label,
          badge: result.badge,
          run: () => {
            recentSearches.add(trimmed);
            if (result.href) {
              router.push(result.href);
            }
            onClose();
          },
        })),
      }));
      return [
        ...(actionItems.length
          ? [{ id: "actions", label: "Actions", items: actionItems }]
          : []),
        ...resultSections,
      ];
    }

    // Idle: recent searches, quick actions, suggested pages.
    void recentVersion; // re-derive after add/clear
    const recents = recentSearches.list();
    return [
      {
        id: "recent",
        label: "Recent searches",
        headerAction: recents.length ? (
          <button
            type="button"
            onClick={() => {
              recentSearches.clear();
              setRecentVersion((v) => v + 1);
              // This button disappears with the list; keep focus in the dialog.
              inputRef.current?.focus();
            }}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        ) : undefined,
        items: recents.map((recent) => ({
          key: `recent-${recent.id}`,
          icon: ClockIcon,
          title: recent.query,
          categoryLabel: "Recent",
          run: () => {
            setQuery(recent.query);
            setStatus("searching");
            setActiveIndex(0);
            inputRef.current?.focus();
          },
        })),
        emptyState: <NoRecentSearchesState />,
      },
      {
        id: "quick-actions",
        label: "Quick actions",
        items: searchRegistry.getQuickActions().map((action) => ({
          key: `action-${action.id}`,
          icon: action.icon,
          title: action.label,
          description: action.description,
          run: () => action.perform(actionContext),
        })),
      },
      {
        id: "suggested",
        label: "Suggested pages",
        items: SUGGESTED_PAGES.map((page) => ({
          key: `suggested-${page.id}`,
          icon: page.icon,
          title: page.title,
          description: page.description,
          run: () => {
            if (page.href) router.push(page.href);
            onClose();
          },
        })),
      },
    ];
  }, [status, query, groups, recentVersion, actionContext, router, onClose]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const activeItem = flatItems[activeIndex];
  const activeId = activeItem ? `bsky-opt-${activeItem.key}` : undefined;

  function moveActive(delta: number) {
    if (flatItems.length === 0) return;
    const next =
      (activeIndex + delta + flatItems.length) % flatItems.length;
    setActiveIndex(next);
    document
      .getElementById(`bsky-opt-${flatItems[next].key}`)
      ?.scrollIntoView({ block: "nearest" });
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      activeItem?.run();
    }
  }

  // Focus trap: Tab cycles the dialog's focusable controls.
  // (Escape is handled at the document level so it works from any focus state.)
  function onDialogKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = [
      ...dialog.querySelectorAll<HTMLElement>(
        "input, button, a[href], [tabindex]:not([tabindex='-1'])"
      ),
    ].filter((el) => !el.hasAttribute("disabled"));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const trimmedQuery = query.trim();
  // Flat index assignment for aria-activedescendant across sections.
  let itemCursor = 0;

  // Portaled to <body>: the topbar's backdrop-blur creates a containing
  // block that would otherwise trap this fixed overlay inside the header.
  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-start justify-center px-3 pt-[12vh] sm:px-6"
      onKeyDown={onDialogKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-overlay"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <SearchIcon className="size-4.5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeId}
            aria-label="Search BlueSky OS"
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              setStatus(value.trim() ? "searching" : "idle");
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search pages and actions…"
            className="h-13 w-full bg-transparent text-sm outline-none placeholder:text-faint-foreground"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("idle");
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          ) : null}
        </div>

        <div
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Search results"
          className="max-h-[55vh] overflow-y-auto overscroll-contain p-2"
        >
          {!searchRegistry.hasProviders() ? (
            <NoProvidersState />
          ) : status === "searching" ? (
            <SearchingState />
          ) : status === "done" && flatItems.length === 0 ? (
            <NoResultsState query={trimmedQuery} />
          ) : (
            sections.map((section) => {
              if (section.items.length === 0 && !section.emptyState) return null;
              return (
                <div key={section.id} className="mb-1">
                  <div className="flex items-center justify-between px-3 pb-1 pt-2">
                    <p className="text-meta">{section.label}</p>
                    {section.headerAction}
                  </div>
                  {section.items.length === 0
                    ? section.emptyState
                    : section.items.map((item) => {
                        const index = itemCursor++;
                        return (
                          <SearchResultItem
                            key={item.key}
                            id={`bsky-opt-${item.key}`}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                            categoryLabel={item.categoryLabel}
                            badge={item.badge}
                            active={index === activeIndex}
                            onActivate={item.run}
                            onHover={() => setActiveIndex(index)}
                          />
                        );
                      })}
                </div>
              );
            })
          )}
        </div>

        {status === "idle" ? <AiPlaceholder /> : null}

        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-caption">
          <span>
            <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px]">↑↓</kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px]">↵</kbd>{" "}
            open
          </span>
          <span>
            <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px]">esc</kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
