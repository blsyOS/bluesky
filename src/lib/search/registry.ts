import type {
  QuickAction,
  SearchCategory,
  SearchProvider,
  SearchQuery,
  SearchResult,
  SearchResultGroup,
} from "./types";

const DEFAULT_PROVIDER_LIMIT = 8;

function matchesText(haystack: string[], needle: string) {
  const q = needle.toLowerCase();
  return haystack.some((h) => h.toLowerCase().includes(q));
}

/**
 * Central registration point for search. Providers, categories, and quick
 * actions register independently; nothing here knows about specific modules.
 */
export class SearchRegistry {
  private providers = new Map<string, SearchProvider>();
  private categories = new Map<string, SearchCategory>();
  private quickActions = new Map<string, QuickAction>();

  registerCategory(category: SearchCategory): void {
    if (!this.categories.has(category.id)) {
      this.categories.set(category.id, category);
    }
  }

  registerProvider(provider: SearchProvider): void {
    this.providers.set(provider.id, provider);
    provider.categories?.forEach((c) => this.registerCategory(c));
  }

  registerQuickAction(action: QuickAction): void {
    this.quickActions.set(action.id, action);
  }

  hasProviders(): boolean {
    return this.providers.size > 0;
  }

  getProviders(): SearchProvider[] {
    return [...this.providers.values()];
  }

  getCategory(id: string): SearchCategory | undefined {
    return this.categories.get(id);
  }

  /** Quick actions, optionally filtered by label/description/keywords. */
  getQuickActions(filterText = ""): QuickAction[] {
    const actions = [...this.quickActions.values()];
    const text = filterText.trim();
    if (!text) return actions;
    return actions.filter((a) =>
      matchesText(
        [a.label, a.description ?? "", ...(a.keywords ?? [])],
        text
      )
    );
  }

  /**
   * Fans a query out to every provider and groups results by category in
   * category order. A failing provider is skipped rather than failing the
   * whole search.
   */
  async search(query: SearchQuery): Promise<SearchResultGroup[]> {
    const text = query.text.trim();
    if (!text) return [];

    const limit = query.limit ?? DEFAULT_PROVIDER_LIMIT;
    const settled = await Promise.allSettled(
      this.getProviders().map((p) => p.search({ text, limit }))
    );

    const byCategory = new Map<string, SearchResult[]>();
    for (const outcome of settled) {
      if (outcome.status !== "fulfilled") continue;
      for (const result of outcome.value) {
        const bucket = byCategory.get(result.categoryId) ?? [];
        bucket.push(result);
        byCategory.set(result.categoryId, bucket);
      }
    }

    const groups: SearchResultGroup[] = [];
    for (const [categoryId, results] of byCategory) {
      const category = this.categories.get(categoryId) ?? {
        id: categoryId,
        label: categoryId,
      };
      results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      groups.push({ category, results });
    }
    groups.sort(
      (a, b) => (a.category.order ?? 100) - (b.category.order ?? 100)
    );
    return groups;
  }
}

/** The single app-wide registry. Modules import this and register into it. */
export const searchRegistry = new SearchRegistry();
