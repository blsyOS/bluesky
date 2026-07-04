/**
 * Company administration domain constants (BO-02.01A).
 *
 * Address types and feature-flag keys are open strings in the schema;
 * these constants are the platform's known set. Adding an address type or
 * flag here is all future build orders need to do — no schema or UI-logic
 * changes.
 */

export type AddressType = {
  id: string;
  label: string;
  description: string;
};

export const ADDRESS_TYPES: AddressType[] = [
  {
    id: "headquarters",
    label: "Headquarters",
    description: "Primary physical office.",
  },
  {
    id: "mailing",
    label: "Mailing",
    description: "Where the company receives mail.",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Address used on invoices and billing documents.",
  },
];

export function addressTypeLabel(id: string): string {
  return ADDRESS_TYPES.find((t) => t.id === id)?.label ?? id;
}

export type CompanyFlagDefinition = {
  key: string;
  label: string;
  description: string;
};

/**
 * Known company feature flags. Foundation only — none of these gate
 * behavior yet; modules will read them as they come online.
 */
export const KNOWN_COMPANY_FLAGS: CompanyFlagDefinition[] = [
  {
    key: "custom_branding",
    label: "Custom branding",
    description:
      "Apply this company's branding (logo, colors) across the workspace.",
  },
  {
    key: "beta_features",
    label: "Beta features",
    description: "Early access to features still in preview.",
  },
  {
    key: "api_access",
    label: "API access",
    description: "Programmatic platform access (arrives in a later phase).",
  },
];

export function flagDefinition(key: string): CompanyFlagDefinition | undefined {
  return KNOWN_COMPANY_FLAGS.find((f) => f.key === key);
}

/** Display statuses for the CompanyStatusBadge (settable set + derived). */
export const COMPANY_DISPLAY_STATUSES = [
  "trial",
  "active",
  "suspended",
  "archived",
  "expired",
] as const;
export type CompanyDisplayStatus = (typeof COMPANY_DISPLAY_STATUSES)[number];
