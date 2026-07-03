import type {
  ActivityEntry,
  ActivityProvider,
  AppNotification,
  NotificationCategory,
  NotificationProvider,
} from "./types";

/**
 * Central registration point for notifications and activity. Providers,
 * categories, and activity feeds register independently; nothing here
 * knows about specific modules. Mirrors the SearchRegistry pattern.
 */
export class NotificationRegistry {
  private providers = new Map<string, NotificationProvider>();
  private activityProviders = new Map<string, ActivityProvider>();
  private categories = new Map<string, NotificationCategory>();

  registerCategory(category: NotificationCategory): void {
    if (!this.categories.has(category.id)) {
      this.categories.set(category.id, category);
    }
  }

  registerProvider(provider: NotificationProvider): void {
    this.providers.set(provider.id, provider);
    provider.categories?.forEach((c) => this.registerCategory(c));
  }

  registerActivityProvider(provider: ActivityProvider): void {
    this.activityProviders.set(provider.id, provider);
  }

  hasProviders(): boolean {
    return this.providers.size > 0;
  }

  getCategory(id: string): NotificationCategory | undefined {
    return this.categories.get(id);
  }

  /** Registered categories in display order. */
  getCategories(): NotificationCategory[] {
    return [...this.categories.values()].sort(
      (a, b) => (a.order ?? 100) - (b.order ?? 100)
    );
  }

  /**
   * Collects notifications from every provider, newest first. A failing
   * provider is skipped rather than failing the whole center.
   */
  async load(): Promise<AppNotification[]> {
    const settled = await Promise.allSettled(
      [...this.providers.values()].map((p) => p.list())
    );
    const notifications = settled
      .filter(
        (o): o is PromiseFulfilledResult<AppNotification[]> =>
          o.status === "fulfilled"
      )
      .flatMap((o) => o.value);
    notifications.sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
    return notifications;
  }

  /** Collects activity entries from every activity provider, newest first. */
  async loadActivity(): Promise<ActivityEntry[]> {
    const settled = await Promise.allSettled(
      [...this.activityProviders.values()].map((p) => p.list())
    );
    const entries = settled
      .filter(
        (o): o is PromiseFulfilledResult<ActivityEntry[]> =>
          o.status === "fulfilled"
      )
      .flatMap((o) => o.value);
    entries.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    return entries;
  }
}

/** The single app-wide registry. Modules import this and register into it. */
export const notificationRegistry = new NotificationRegistry();
