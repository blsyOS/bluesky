import { test } from "node:test";
import assert from "node:assert/strict";
import { parseNewUserInput } from "../src/lib/validation";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

test("accepts a valid new user and normalizes the email", () => {
  const result = parseNewUserInput(
    form({
      firstName: "  Dana ",
      lastName: "Fields",
      email: "  Dana.Fields@BlueSkyOS.App ",
      phone: "555-0100",
    })
  );
  assert.equal(result.ok, true);
  assert.ok(result.ok);
  assert.deepEqual(result.data, {
    firstName: "Dana",
    lastName: "Fields",
    email: "dana.fields@blueskyos.app",
    phone: "555-0100",
  });
});

test("phone is optional", () => {
  const result = parseNewUserInput(
    form({ firstName: "A", lastName: "B", email: "a@b.co" })
  );
  assert.ok(result.ok);
  assert.equal(result.data.phone, "");
});

test("rejects missing required fields and echoes values back", () => {
  const result = parseNewUserInput(form({ firstName: "OnlyFirst" }));
  assert.ok(!result.ok);
  assert.match(result.error, /required/);
  assert.equal(result.values.firstName, "OnlyFirst");
  assert.equal(result.values.lastName, "");
});

test("rejects whitespace-only names", () => {
  const result = parseNewUserInput(
    form({ firstName: "   ", lastName: "B", email: "a@b.co" })
  );
  assert.ok(!result.ok);
  assert.match(result.error, /required/);
});

test("rejects malformed emails", () => {
  for (const bad of ["not-an-email", "a@b", "a b@c.com", "@x.com"]) {
    const result = parseNewUserInput(
      form({ firstName: "A", lastName: "B", email: bad })
    );
    assert.ok(!result.ok, `expected ${bad} to be rejected`);
    assert.match(result.error, /valid email/);
  }
});
