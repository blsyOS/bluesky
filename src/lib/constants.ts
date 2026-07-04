/**
 * Platform-wide constants. SQLite has no native enums, so these typed
 * string constants are the source of truth for status/key fields.
 */

export const PRODUCT_KEYS = [
  "LOCATE_OS",
  "LEAK_OS",
  "FIBER_OS",
  "SITE_VIEW",
  "COMMAND_CENTER",
] as const;
export type ProductKey = (typeof PRODUCT_KEYS)[number];

// Lifecycle statuses a company can be set to (BO-02.01A). "expired" exists
// as a display status (see CompanyStatusBadge) but is derived, not settable.
export const COMPANY_STATUSES = [
  "trial",
  "active",
  "suspended",
  "archived",
] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const PRODUCT_STATUSES = ["active", "coming_soon", "hidden"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const COMPANY_PRODUCT_STATUSES = ["active", "trial", "disabled"] as const;
export type CompanyProductStatus = (typeof COMPANY_PRODUCT_STATUSES)[number];

export const USER_STATUSES = ["active", "inactive", "invited", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const SYSTEM_ROLE_KEYS = [
  "platform_admin",
  "company_admin",
  "manager",
  "supervisor",
  "tech",
  "viewer",
] as const;
export type SystemRoleKey = (typeof SYSTEM_ROLE_KEYS)[number];

export const PERMISSION_KEYS = [
  "platform.manage",
  "company.manage",
  "products.manage",
  "users.manage",
  "roles.manage",
  "audit.view",
  "settings.manage",
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
