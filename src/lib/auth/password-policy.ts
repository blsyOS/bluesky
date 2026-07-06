/**
 * Configurable password policy (BO-AUTH-01). The platform ships one
 * default policy; per-organization overrides, password expiration,
 * password history, and MFA are future build orders — the validate
 * function already accepts a policy object so those slot in without
 * changing call sites.
 *
 * Db-free by design so client components and tests can import it.
 */

export type PasswordPolicy = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
};

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

/** Human-readable requirements, for helper text under password fields. */
export function describePolicy(
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): string {
  const parts = [`at least ${policy.minLength} characters`];
  if (policy.requireUppercase) parts.push("an uppercase letter");
  if (policy.requireLowercase) parts.push("a lowercase letter");
  if (policy.requireNumber) parts.push("a number");
  if (policy.requireSpecial) parts.push("a special character");
  return `Must contain ${parts.join(", ")}.`;
}

/** Returns the list of unmet requirements; empty means the password passes. */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): string[] {
  const failures: string[] = [];
  if (password.length < policy.minLength) {
    failures.push(`Use at least ${policy.minLength} characters.`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    failures.push("Include an uppercase letter.");
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    failures.push("Include a lowercase letter.");
  }
  if (policy.requireNumber && !/[0-9]/.test(password)) {
    failures.push("Include a number.");
  }
  if (policy.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    failures.push("Include a special character.");
  }
  return failures;
}
