import argon2 from "argon2";

/**
 * Password hashing (BO-AUTH-01). Argon2id with the library's vetted
 * defaults (64 MiB memory, 3 iterations). Passwords are never stored or
 * logged in plain text; hashes are self-describing so parameters can be
 * strengthened later without invalidating existing credentials.
 */

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    // Malformed/legacy hash — treat as non-matching rather than throwing.
    return false;
  }
}
