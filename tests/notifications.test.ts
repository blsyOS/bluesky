import { test } from "node:test";
import assert from "node:assert/strict";
import { NotificationRegistry } from "../src/lib/notifications/registry";
import {
  applyNotificationFilter,
  sectionNotifications,
  sortByPriority,
  summarizeNotifications,
} from "../src/lib/notifications/filters";
import { groupActivityByDay } from "../src/lib/notifications/activity";
import { PRIORITY_META } from "../src/lib/notifications/priorities";
import {
  NOTIFICATION_PRIORITIES,
  type AppNotification,
} from "../src/lib/notifications/types";
import { formatRelativeTime } from "../src/lib/format";

function n(partial: Partial<AppNotification> & { id: string }): AppNotification {
  return {
    categoryId: "general",
    priority: "normal",
    title: partial.id,
    createdAt: new Date().toISOString(),
    read: false,
    pinned: false,
    archived: false,
    ...partial,
  };
}

test("every priority has display metadata", () => {
  for (const p of NOTIFICATION_PRIORITIES) {
    assert.ok(PRIORITY_META[p].label, `${p} has a label`);
    assert.ok(PRIORITY_META[p].tone, `${p} has a tone`);
  }
});

test("registry fans out providers and sorts newest first; failures are skipped", async () => {
  const registry = new NotificationRegistry();
  registry.registerProvider({
    id: "a",
    label: "A",
    categories: [{ id: "safety", label: "Safety", order: 10 }],
    list: () => [n({ id: "old", createdAt: "2026-01-01T00:00:00Z" })],
  });
  registry.registerProvider({
    id: "b",
    label: "B",
    list: async () => [n({ id: "new", createdAt: "2026-06-01T00:00:00Z" })],
  });
  registry.registerProvider({
    id: "broken",
    label: "Broken",
    list: () => Promise.reject(new Error("boom")),
  });

  assert.equal(registry.hasProviders(), true);
  assert.equal(registry.getCategory("safety")?.label, "Safety");
  const loaded = await registry.load();
  assert.deepEqual(
    loaded.map((x) => x.id),
    ["new", "old"]
  );
});

test("activity providers load independently of notification providers", async () => {
  const registry = new NotificationRegistry();
  registry.registerActivityProvider({
    id: "a",
    label: "A",
    list: () => [
      { id: "e1", title: "First", timestamp: "2026-06-01T10:00:00Z" },
      { id: "e2", title: "Second", timestamp: "2026-06-02T10:00:00Z" },
    ],
  });
  const entries = await registry.loadActivity();
  assert.deepEqual(
    entries.map((e) => e.id),
    ["e2", "e1"]
  );
});

test("filter views: unread/pinned/archived/all behave as documented", () => {
  const list = [
    n({ id: "unread" }),
    n({ id: "read", read: true }),
    n({ id: "pinned", read: true, pinned: true }),
    n({ id: "archived", read: true, archived: true }),
  ];
  const ids = (view: "all" | "unread" | "pinned" | "archived") =>
    applyNotificationFilter(list, { view }).map((x) => x.id);

  assert.deepEqual(ids("all"), ["unread", "read", "pinned"]); // archived hidden
  assert.deepEqual(ids("unread"), ["unread"]);
  assert.deepEqual(ids("pinned"), ["pinned"]);
  assert.deepEqual(ids("archived"), ["archived"]);
});

test("category and priority filters compose with views", () => {
  const list = [
    n({ id: "a", categoryId: "safety", priority: "critical" }),
    n({ id: "b", categoryId: "safety", priority: "low" }),
    n({ id: "c", categoryId: "system", priority: "critical" }),
  ];
  assert.deepEqual(
    applyNotificationFilter(list, {
      view: "all",
      categoryId: "safety",
      priority: "critical",
    }).map((x) => x.id),
    ["a"]
  );
});

test("sections split pinned/unread/recent with no overlap", () => {
  const list = [
    n({ id: "p", pinned: true, read: false }),
    n({ id: "u" }),
    n({ id: "r", read: true }),
  ];
  const sections = sectionNotifications(list);
  assert.deepEqual(sections.pinned.map((x) => x.id), ["p"]);
  assert.deepEqual(sections.unread.map((x) => x.id), ["u"]);
  assert.deepEqual(sections.recent.map((x) => x.id), ["r"]);
});

test("summary counts unread and flags critical; archived never counts", () => {
  const summary = summarizeNotifications([
    n({ id: "a", priority: "critical" }),
    n({ id: "b" }),
    n({ id: "c", read: true }),
    n({ id: "d", priority: "critical", archived: true }),
  ]);
  assert.equal(summary.unreadCount, 2);
  assert.equal(summary.hasUnreadCritical, true);

  const calm = summarizeNotifications([n({ id: "x", read: true })]);
  assert.equal(calm.unreadCount, 0);
  assert.equal(calm.hasUnreadCritical, false);
});

test("sortByPriority ranks critical first, then newest", () => {
  const sorted = sortByPriority([
    n({ id: "low", priority: "low", createdAt: "2026-06-03T00:00:00Z" }),
    n({ id: "crit-old", priority: "critical", createdAt: "2026-06-01T00:00:00Z" }),
    n({ id: "crit-new", priority: "critical", createdAt: "2026-06-02T00:00:00Z" }),
  ]);
  assert.deepEqual(
    sorted.map((x) => x.id),
    ["crit-new", "crit-old", "low"]
  );
});

test("activity groups by day with Today/Yesterday labels, newest day first", () => {
  const now = new Date("2026-07-02T12:00:00");
  const groups = groupActivityByDay(
    [
      { id: "1", title: "morning", timestamp: "2026-07-02T08:00:00" },
      { id: "2", title: "later", timestamp: "2026-07-02T11:00:00" },
      { id: "3", title: "yesterday", timestamp: "2026-07-01T09:00:00" },
      { id: "4", title: "old", timestamp: "2026-06-20T09:00:00" },
    ],
    now
  );
  assert.deepEqual(
    groups.map((g) => g.label),
    ["Today", "Yesterday", "Sat, Jun 20"]
  );
  assert.deepEqual(
    groups[0].entries.map((e) => e.id),
    ["2", "1"] // newest first within the day
  );
});

test("formatRelativeTime buckets", () => {
  const now = new Date("2026-07-02T12:00:00Z");
  const at = (ms: number) => new Date(now.getTime() - ms);
  assert.equal(formatRelativeTime(at(20_000), now), "just now");
  assert.equal(formatRelativeTime(at(5 * 60_000), now), "5m ago");
  assert.equal(formatRelativeTime(at(3 * 3_600_000), now), "3h ago");
  assert.equal(formatRelativeTime(at(2 * 86_400_000), now), "2d ago");
  assert.match(formatRelativeTime(at(30 * 86_400_000), now), /Jun \d+, 2026/);
});
