const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDateTime(value: Date | string) {
  return dateTimeFormat.format(new Date(value));
}

export function formatDate(value: Date | string) {
  return dateFormat.format(new Date(value));
}

export function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

/**
 * Compact relative time for feeds: "just now", "5m ago", "3h ago",
 * "2d ago", then a short date. `now` is injectable for tests.
 */
export function formatRelativeTime(
  value: Date | string,
  now: Date = new Date()
): string {
  const then = new Date(value).getTime();
  const seconds = Math.round((now.getTime() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return dateFormat.format(new Date(value));
}

/** "company_product.enabled" -> "Company Product Enabled" */
export function humanizeAction(action: string) {
  return action
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
