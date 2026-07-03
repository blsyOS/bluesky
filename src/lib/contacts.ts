/**
 * Operational contact directory taxonomy for BlueSky Locate. Contact types
 * are groups (Utility Owners, Municipalities, …), each with subtypes. These
 * are typed constants — the source of truth for the Contact model's
 * `contactType`/`subtype` string fields and the Contacts UI.
 */

export type ContactTypeGroup = {
  id: string;
  label: string;
  /** Short description of who belongs in this group. */
  description: string;
  subtypes: { id: string; label: string }[];
};

function sub(id: string, label: string) {
  return { id, label };
}

export const CONTACT_TYPES: ContactTypeGroup[] = [
  {
    id: "utility_owner",
    label: "Utility Owners",
    description: "Facility owners whose lines are located.",
    subtypes: [
      sub("electric", "Electric"),
      sub("gas", "Gas"),
      sub("water", "Water"),
      sub("sewer", "Sewer"),
      sub("fiber", "Fiber"),
      sub("communications", "Communications"),
    ],
  },
  {
    id: "municipality",
    label: "Municipalities",
    description: "Cities, counties, and public agencies.",
    subtypes: [
      sub("city", "City"),
      sub("county", "County"),
      sub("dot", "DOT"),
      sub("public_works", "Public Works"),
      sub("engineering_dept", "Engineering Department"),
    ],
  },
  {
    id: "contractor",
    label: "Contractors",
    description: "Firms performing excavation and construction.",
    subtypes: [
      sub("general", "General Contractor"),
      sub("excavator", "Excavator"),
      sub("directional_drilling", "Directional Drilling"),
      sub("boring", "Boring Contractor"),
      sub("utility", "Utility Contractor"),
    ],
  },
  {
    id: "engineering_firm",
    label: "Engineering Firms",
    description: "Design, civil, and survey firms.",
    subtypes: [
      sub("civil", "Civil Engineering"),
      sub("surveying", "Surveying"),
      sub("design", "Design Firm"),
    ],
  },
  {
    id: "property_owner",
    label: "Property Owners",
    description: "Owners of affected property.",
    subtypes: [
      sub("commercial", "Commercial"),
      sub("residential", "Residential"),
      sub("industrial", "Industrial"),
    ],
  },
  {
    id: "emergency",
    label: "Emergency Contacts",
    description: "Dispatch, after-hours, and one-call centers.",
    subtypes: [
      sub("utility_dispatch", "Utility Dispatch"),
      sub("after_hours", "After Hours"),
      sub("one_call", "One Call Center"),
      sub("emergency_ops", "Emergency Operations"),
    ],
  },
  {
    id: "internal",
    label: "Internal Contacts",
    description: "Your own team and leadership.",
    subtypes: [
      sub("employee", "Employee"),
      sub("supervisor", "Supervisor"),
      sub("dispatcher", "Dispatcher"),
      sub("storm_lead", "Storm Lead"),
      sub("manager", "Manager"),
    ],
  },
];

const GROUP_BY_ID = new Map(CONTACT_TYPES.map((g) => [g.id, g]));

export function contactTypeLabel(id: string): string {
  return GROUP_BY_ID.get(id)?.label ?? id;
}

export function contactSubtypeLabel(
  groupId: string,
  subtypeId?: string | null
): string | undefined {
  if (!subtypeId) return undefined;
  return GROUP_BY_ID.get(groupId)?.subtypes.find((s) => s.id === subtypeId)
    ?.label;
}

export function isContactType(id: string): boolean {
  return GROUP_BY_ID.has(id);
}

export const CONTACT_STATUSES = ["active", "inactive"] as const;
