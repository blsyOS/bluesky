import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PASSWORD_POLICY,
  describePolicy,
  validatePassword,
} from "../src/lib/auth/password-policy";
import {
  ACTIVITY_TOUCH_MINUTES,
  REMEMBER_ME_DAYS,
  SESSION_HOURS,
  generateSessionToken,
  hashSessionToken,
  sessionExpiry,
} from "../src/lib/auth/tokens";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";

// ── Password policy ──────────────────────────────────────────────────────

test("default policy requires length, upper, lower, number, special", () => {
  assert.equal(DEFAULT_PASSWORD_POLICY.minLength, 8);
  assert.deepEqual(validatePassword("Str0ng!Pass"), []);
});

test("policy reports every unmet requirement", () => {
  const failures = validatePassword("short");
  assert.equal(failures.length, 4); // length, uppercase, number, special
  assert.ok(failures.some((f) => f.includes("8 characters")));
  assert.ok(failures.some((f) => f.includes("uppercase")));
  assert.ok(failures.some((f) => f.includes("number")));
  assert.ok(failures.some((f) => f.includes("special")));
});

test("policy is configurable", () => {
  const relaxed = {
    minLength: 4,
    requireUppercase: false,
    requireLowercase: true,
    requireNumber: false,
    requireSpecial: false,
  };
  assert.deepEqual(validatePassword("abcd", relaxed), []);
  assert.equal(validatePassword("ab", relaxed).length, 1);
});

test("policy description is human-readable", () => {
  const text = describePolicy();
  assert.ok(text.includes("at least 8 characters"));
  assert.ok(text.includes("special character"));
});

// ── Session tokens ───────────────────────────────────────────────────────

test("session tokens are unique, opaque, and hashed for storage", () => {
  const a = generateSessionToken();
  const b = generateSessionToken();
  assert.notEqual(a, b);
  assert.ok(a.length >= 40); // 256 bits base64url
  const hash = hashSessionToken(a);
  assert.equal(hash.length, 64); // sha-256 hex
  assert.notEqual(hash, a);
  assert.equal(hashSessionToken(a), hash); // deterministic
});

test("session expiry: 12h standard, 30d remember-me", () => {
  const from = new Date("2026-01-01T00:00:00Z");
  assert.equal(
    sessionExpiry(false, from).getTime() - from.getTime(),
    SESSION_HOURS * 60 * 60 * 1000
  );
  assert.equal(
    sessionExpiry(true, from).getTime() - from.getTime(),
    REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000
  );
  assert.ok(ACTIVITY_TOUCH_MINUTES > 0);
});

// ── Password hashing (Argon2id) ──────────────────────────────────────────

test("passwords hash with argon2id and verify round-trip", async () => {
  const hash = await hashPassword("Str0ng!Pass");
  assert.ok(hash.startsWith("$argon2id$"));
  assert.ok(!hash.includes("Str0ng!Pass"));
  assert.equal(await verifyPassword(hash, "Str0ng!Pass"), true);
  assert.equal(await verifyPassword(hash, "wrong-password"), false);
  assert.equal(await verifyPassword("not-a-hash", "whatever"), false);
});
