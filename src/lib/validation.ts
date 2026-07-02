/**
 * Pure form-input parsing, kept free of database and framework imports so it
 * can be unit-tested directly.
 */

export const DUPLICATE_EMAIL_ERROR =
  "That email is already assigned to a user.";

export type NewUserValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type ParseResult =
  | { ok: true; data: NewUserValues }
  | { ok: false; error: string; values: NewUserValues };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseNewUserInput(formData: FormData): ParseResult {
  const values: NewUserValues = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
  };

  if (!values.firstName || !values.lastName || !values.email) {
    return {
      ok: false,
      error: "First name, last name, and email are required.",
      values,
    };
  }
  if (!EMAIL_PATTERN.test(values.email)) {
    return {
      ok: false,
      error: "Enter a valid email address.",
      values,
    };
  }

  return { ok: true, data: values };
}
