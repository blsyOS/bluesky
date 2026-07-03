import type {
  DashboardContext,
  DashboardLayout,
  DashboardProvider,
  DashboardSectionData,
  DashboardWidget,
  DashboardWidgetCategory,
  WidgetProvider,
} from "./types";

/**
 * Central registration point for dashboards and widgets. Providers and
 * categories register independently; nothing here knows about specific
 * modules. Mirrors the search/notification registry pattern.
 */
export class DashboardRegistry {
  private dashboardProviders = new Map<string, DashboardProvider>();
  private widgetProviders = new Map<string, WidgetProvider>();
  private categories = new Map<string, DashboardWidgetCategory>();

  registerCategory(category: DashboardWidgetCategory): void {
    if (!this.categories.has(category.id)) {
      this.categories.set(category.id, category);
    }
  }

  registerDashboardProvider(provider: DashboardProvider): void {
    this.dashboardProviders.set(provider.id, provider);
  }

  registerWidgetProvider(provider: WidgetProvider): void {
    this.widgetProviders.set(provider.id, provider);
    provider.categories?.forEach((c) => this.registerCategory(c));
  }

  hasWidgetProviders(): boolean {
    return this.widgetProviders.size > 0;
  }

  getCategory(id: string): DashboardWidgetCategory | undefined {
    return this.categories.get(id);
  }

  /** Finds a dashboard definition across all dashboard providers. */
  getDashboard(id: string): DashboardLayout | undefined {
    for (const provider of this.dashboardProviders.values()) {
      const match = provider.getDashboards().find((d) => d.id === id);
      if (match) return match;
    }
    return undefined;
  }

  /**
   * Loads widgets for a dashboard from every widget provider
   * (Promise.allSettled — a failing provider is skipped), drops disabled
   * widgets, and groups the rest into sections ordered by category then
   * widget order.
   */
  async loadSections(
    context: DashboardContext
  ): Promise<DashboardSectionData[]> {
    const settled = await Promise.allSettled(
      [...this.widgetProviders.values()].map((p) => p.getWidgets(context))
    );

    const byCategory = new Map<string, DashboardWidget[]>();
    for (const outcome of settled) {
      if (outcome.status !== "fulfilled") continue;
      for (const widget of outcome.value) {
        if (widget.status === "disabled") continue;
        const bucket = byCategory.get(widget.categoryId) ?? [];
        bucket.push(widget);
        byCategory.set(widget.categoryId, bucket);
      }
    }

    const sections: DashboardSectionData[] = [];
    for (const [categoryId, widgets] of byCategory) {
      const category = this.categories.get(categoryId) ?? {
        id: categoryId,
        label: categoryId,
      };
      widgets.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
      sections.push({ category, widgets });
    }
    sections.sort(
      (a, b) => (a.category.order ?? 100) - (b.category.order ?? 100)
    );
    return sections;
  }
}

/** The single app-wide registry. Modules import this and register into it. */
export const dashboardRegistry = new DashboardRegistry();
