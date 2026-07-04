import { test } from "node:test";
import assert from "node:assert/strict";
import { COMPANY_STATUSES } from "../src/lib/constants";
import {
  ADDRESS_TYPES,
  COMPANY_DISPLAY_STATUSES,
  KNOWN_COMPANY_FLAGS,
  addressTypeLabel,
  flagDefinition,
} from "../src/lib/company";
import { csvToJsonList, jsonListToCsv } from "../src/lib/lists";

test("settable company statuses are trial/active/suspended/archived", () => {
  assert.deepEqual([...COMPANY_STATUSES], [
    "trial",
    "active",
    "suspended",
    "archived",
  ]);
});

test("display statuses add derived 'expired' on top of settable ones", () => {
  for (const s of COMPANY_STATUSES) {
    assert.ok(
      (COMPANY_DISPLAY_STATUSES as readonly string[]).includes(s),
      `${s} is displayable`
    );
  }
  assert.ok((COMPANY_DISPLAY_STATUSES as readonly string[]).includes("expired"));
});

test("initial address types exist and resolve labels; unknown ids pass through", () => {
  assert.deepEqual(
    ADDRESS_TYPES.map((t) => t.id),
    ["headquarters", "mailing", "billing"]
  );
  assert.equal(addressTypeLabel("mailing"), "Mailing");
  assert.equal(addressTypeLabel("warehouse"), "warehouse"); // future type, no crash
});

test("known feature flags have labels/descriptions; lookup works", () => {
  assert.ok(KNOWN_COMPANY_FLAGS.length >= 3);
  for (const flag of KNOWN_COMPANY_FLAGS) {
    assert.ok(flag.label && flag.description, `${flag.key} documented`);
  }
  assert.equal(flagDefinition("beta_features")?.label, "Beta features");
  assert.equal(flagDefinition("nope"), undefined);
});

test("csv/json list helpers round-trip and handle edge cases", () => {
  assert.equal(csvToJsonList("TX, OK , ,LA"), JSON.stringify(["TX", "OK", "LA"]));
  assert.equal(csvToJsonList("   "), null);
  assert.equal(jsonListToCsv(csvToJsonList("TX, OK")), "TX, OK");
  assert.equal(jsonListToCsv(null), "");
  assert.equal(jsonListToCsv("not-json"), "");
  assert.equal(jsonListToCsv('"a string"'), "");
});
