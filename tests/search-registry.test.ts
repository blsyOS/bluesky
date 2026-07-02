import { test } from "node:test";
import assert from "node:assert/strict";
import { SearchRegistry } from "../src/lib/search/registry";
import type { QuickActionContext, SearchProvider } from "../src/lib/search/types";

const pagesCategory = { id: "pages", label: "Pages", order: 10 };
const ticketsCategory = { id: "tickets", label: "Tickets", order: 60 };

function pagesProvider(): SearchProvider {
  return {
    id: "platform",
    label: "Platform",
    categories: [pagesCategory],
    search: ({ text }) =>
      "users".includes(text.toLowerCase())
        ? [{ id: "p1", categoryId: "pages", title: "Users", score: 0.8 }]
        : [],
  };
}

test("registry with no providers reports empty", async () => {
  const registry = new SearchRegistry();
  assert.equal(registry.hasProviders(), false);
  assert.deepEqual(await registry.search({ text: "anything" }), []);
});

test("providers register their categories and results group by them", async () => {
  const registry = new SearchRegistry();
  registry.registerProvider(pagesProvider());
  assert.equal(registry.hasProviders(), true);
  assert.equal(registry.getCategory("pages")?.label, "Pages");

  const groups = await registry.search({ text: "users" });
  assert.equal(groups.length, 1);
  assert.equal(groups[0].category.id, "pages");
  assert.equal(groups[0].results[0].title, "Users");
});

test("multiple providers fan out without knowing each other; groups follow category order", async () => {
  const registry = new SearchRegistry();
  registry.registerProvider({
    id: "tickets-module",
    label: "Tickets",
    categories: [ticketsCategory],
    search: async () => [
      { id: "t1", categoryId: "tickets", title: "Ticket 42", score: 0.5 },
    ],
  });
  registry.registerProvider(pagesProvider());

  const groups = await registry.search({ text: "users" });
  assert.deepEqual(
    groups.map((g) => g.category.id),
    ["pages", "tickets"] // order 10 before order 60, regardless of registration order
  );
});

test("a failing provider is skipped, not fatal", async () => {
  const registry = new SearchRegistry();
  registry.registerProvider(pagesProvider());
  registry.registerProvider({
    id: "broken",
    label: "Broken",
    search: () => Promise.reject(new Error("provider exploded")),
  });

  const groups = await registry.search({ text: "users" });
  assert.equal(groups.length, 1);
  assert.equal(groups[0].results[0].id, "p1");
});

test("results within a group sort by score descending", async () => {
  const registry = new SearchRegistry();
  registry.registerProvider({
    id: "p",
    label: "P",
    categories: [pagesCategory],
    search: () => [
      { id: "weak", categoryId: "pages", title: "Weak", score: 0.2 },
      { id: "strong", categoryId: "pages", title: "Strong", score: 0.9 },
    ],
  });
  const [group] = await registry.search({ text: "x" });
  assert.deepEqual(
    group.results.map((r) => r.id),
    ["strong", "weak"]
  );
});

test("unknown categories fall back to an id-labeled group", async () => {
  const registry = new SearchRegistry();
  registry.registerProvider({
    id: "p",
    label: "P",
    search: () => [{ id: "r", categoryId: "mystery", title: "R" }],
  });
  const [group] = await registry.search({ text: "x" });
  assert.equal(group.category.label, "mystery");
});

test("quick actions register and filter by label/keywords", () => {
  const registry = new SearchRegistry();
  let navigatedTo = "";
  const ctx: QuickActionContext = {
    navigate: (href) => {
      navigatedTo = href;
    },
    toggleTheme: () => {},
    notify: () => {},
    close: () => {},
  };
  registry.registerQuickAction({
    id: "go-users",
    label: "Open Users",
    keywords: ["people"],
    perform: (c) => c.navigate("/users"),
  });
  registry.registerQuickAction({
    id: "toggle-theme",
    label: "Toggle Theme",
    perform: () => {},
  });

  assert.equal(registry.getQuickActions().length, 2);
  assert.deepEqual(
    registry.getQuickActions("people").map((a) => a.id),
    ["go-users"]
  );
  registry.getQuickActions("people")[0].perform(ctx);
  assert.equal(navigatedTo, "/users");
});

test("blank queries return no groups", async () => {
  const registry = new SearchRegistry();
  registry.registerProvider(pagesProvider());
  assert.deepEqual(await registry.search({ text: "   " }), []);
});
