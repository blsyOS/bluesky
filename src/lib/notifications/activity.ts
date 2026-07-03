import type { ActivityEntry } from "./types";

export type ActivityDayGroup = {
  /** "Today", "Yesterday", or a formatted date. */
  label: string;
  /** ISO date (yyyy-mm-dd) the group covers. */
  day: string;
  entries: ActivityEntry[];
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const DAY_LABEL_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

/**
 * Groups activity entries by calendar day, newest day first. `now` is
 * injectable for tests.
 */
export function groupActivityByDay(
  entries: ActivityEntry[],
  now: Date = new Date()
): ActivityDayGroup[] {
  const todayKey = dayKey(now);
  const yesterdayKey = dayKey(new Date(now.getTime() - 86_400_000));

  const groups = new Map<string, ActivityDayGroup>();
  const sorted = [...entries].sort(
    (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)
  );

  for (const entry of sorted) {
    const date = new Date(entry.timestamp);
    const key = dayKey(date);
    let group = groups.get(key);
    if (!group) {
      const label =
        key === todayKey
          ? "Today"
          : key === yesterdayKey
            ? "Yesterday"
            : DAY_LABEL_FORMAT.format(date);
      group = { label, day: key, entries: [] };
      groups.set(key, group);
    }
    group.entries.push(entry);
  }

  return [...groups.values()];
}
