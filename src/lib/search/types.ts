import type { ComponentType, SVGProps } from "react";

/**
 * BlueSky OS global search contracts.
 *
 * Future modules (LocateOS, LeakOS, FiberOS, Administration, Reports, AI, …)
 * register a SearchProvider and optional QuickActions/SearchCategories with
 * the SearchRegistry. Providers never know about each other; the registry
 * fans queries out and groups results by category.
 *
 * These are interfaces only — no business data is searched in this build
 * order. The platform provider returns navigation entries.
 */

export type SearchIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type SearchCategory = {
  /** Stable identifier, e.g. "pages", "tickets". */
  id: string;
  label: string;
  /** Lower numbers render earlier in grouped results. */
  order?: number;
};

export type SearchResultBadge = {
  label: string;
  tone?: "success" | "warning" | "danger" | "info" | "neutral" | "accent";
};

export type SearchResult = {
  /** Unique within the provider. */
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  icon?: SearchIconComponent;
  badge?: SearchResultBadge;
  /** Destination when activated. Providers may instead rely on future action hooks. */
  href?: string;
  /** Extra match terms beyond title/description. */
  keywords?: string[];
  /** Ranking hint, 0 (weak) – 1 (exact). Defaults to insertion order. */
  score?: number;
};

export type SearchQuery = {
  text: string;
  /** Per-provider result cap; providers should respect it. */
  limit?: number;
};

export interface SearchProvider {
  /** Stable identifier, e.g. "platform", "locate-os". */
  id: string;
  label: string;
  /** Categories this provider emits; auto-registered with the registry. */
  categories?: SearchCategory[];
  search(query: SearchQuery): Promise<SearchResult[]> | SearchResult[];
}

/** Capabilities handed to a quick action when it runs. UI-agnostic. */
export type QuickActionContext = {
  navigate: (href: string) => void;
  toggleTheme: () => void;
  /** Surface a lightweight informational message. */
  notify: (message: string) => void;
  /** Close the palette without doing anything else. */
  close: () => void;
};

export type QuickAction = {
  id: string;
  label: string;
  description?: string;
  icon?: SearchIconComponent;
  keywords?: string[];
  /** Display-only hint, e.g. "G D". Bindings come from the shortcut manager. */
  shortcutHint?: string;
  perform: (ctx: QuickActionContext) => void;
};

export type RecentSearch = {
  id: string;
  query: string;
  searchedAt: string; // ISO timestamp
};

/**
 * Recent-search persistence seam. The in-memory implementation ships now;
 * a user-preferences-backed one replaces it once authentication lands.
 */
export interface RecentSearchStore {
  list(): RecentSearch[];
  add(query: string): void;
  clear(): void;
}

export type SearchResultGroup = {
  category: SearchCategory;
  results: SearchResult[];
};
