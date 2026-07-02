import { test } from "node:test";
import assert from "node:assert/strict";
import { humanizeAction, initials } from "../src/lib/format";

test("humanizeAction turns audit action keys into titles", () => {
  assert.equal(humanizeAction("user.created"), "User Created");
  assert.equal(
    humanizeAction("company_product.enabled"),
    "Company Product Enabled"
  );
  assert.equal(
    humanizeAction("user.product_access_granted"),
    "User Product Access Granted"
  );
});

test("initials uses first letters, uppercased", () => {
  assert.equal(initials("BlueSky", "Admin"), "BA");
  assert.equal(initials("dana", "fields"), "DF");
  assert.equal(initials("", ""), "");
});
