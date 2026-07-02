import type { RecentSearch, RecentSearchStore } from "./types";

const MAX_RECENT = 5;

/** Placeholder history shown until real persistence exists. */
const PLACEHOLDER_RECENT: RecentSearch[] = [
  { id: "ph-1", query: "users", searchedAt: new Date().toISOString() },
  { id: "ph-2", query: "audit logs", searchedAt: new Date().toISOString() },
  { id: "ph-3", query: "dark mode", searchedAt: new Date().toISOString() },
];

/**
 * Session-only recent searches. Deliberately NOT persisted — persistence
 * arrives with authenticated user preferences in a later build order; the
 * palette depends only on the RecentSearchStore interface.
 */
class InMemoryRecentSearchStore implements RecentSearchStore {
  private items: RecentSearch[] = [...PLACEHOLDER_RECENT];

  list(): RecentSearch[] {
    return [...this.items];
  }

  add(query: string): void {
    const text = query.trim();
    if (!text) return;
    this.items = [
      { id: `rs-${Date.now()}`, query: text, searchedAt: new Date().toISOString() },
      ...this.items.filter((r) => r.query.toLowerCase() !== text.toLowerCase()),
    ].slice(0, MAX_RECENT);
  }

  clear(): void {
    this.items = [];
  }
}

export const recentSearches: RecentSearchStore = new InMemoryRecentSearchStore();
