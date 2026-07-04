/**
 * Comma-separated text ⇄ JSON string-array helpers, used for list fields
 * stored as JSON strings in SQLite (contact counties/states, company
 * service territory).
 */

export function csvToJsonList(value: string): string | null {
  const items = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? JSON.stringify(items) : null;
}

export function jsonListToCsv(value: string | null | undefined): string {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(", ") : "";
  } catch {
    return "";
  }
}
