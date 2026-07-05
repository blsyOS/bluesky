/**
 * Organization structure constants (BO-02.01C).
 *
 * The shared organizational skeleton every product operates against:
 * Locations → Departments → Teams. Like address types and feature flags
 * (src/lib/company.ts), these are typed string constants — SQLite has no
 * enums, and a future type/department is a one-line addition here with
 * no schema or UI-logic changes.
 *
 * Db-free by design so client components can import it.
 */

// ── Locations ────────────────────────────────────────────────────────────

export type LocationTypeDefinition = { id: string; label: string };

/** Physical operating location types. */
export const LOCATION_TYPES: readonly LocationTypeDefinition[] = [
  { id: "headquarters", label: "Headquarters" },
  { id: "branch_office", label: "Branch Office" },
  { id: "service_center", label: "Service Center" },
  { id: "operations_center", label: "Operations Center" },
  { id: "utility_yard", label: "Utility Yard" },
  { id: "warehouse", label: "Warehouse" },
  { id: "storm_office", label: "Temporary Storm Office" },
  { id: "remote_office", label: "Remote Office" },
  { id: "other", label: "Other" },
] as const;

export const LOCATION_STATUSES = ["active", "inactive"] as const;
export type LocationStatus = (typeof LOCATION_STATUSES)[number];

export function locationTypeLabel(id: string): string {
  return LOCATION_TYPES.find((t) => t.id === id)?.label ?? id;
}

// ── Departments ──────────────────────────────────────────────────────────

/**
 * Default departments the platform offers every organization. They are
 * created only when an organization asks for them (no silent seeding);
 * organizations also create their own custom departments.
 */
export const DEFAULT_DEPARTMENTS: readonly { name: string; description: string }[] = [
  { name: "Operations", description: "Day-to-day operational management." },
  { name: "Dispatch", description: "Work assignment and routing." },
  { name: "Field Operations", description: "Crews and technicians in the field." },
  { name: "Damage Prevention", description: "Damage prevention and locating programs." },
  { name: "Leak Survey", description: "Gas leak survey programs." },
  { name: "Fiber Construction", description: "Fiber build and construction programs." },
  { name: "Fleet", description: "Vehicles and fleet management." },
  { name: "Safety", description: "Safety programs and compliance." },
  { name: "Administration", description: "Administrative staff and office management." },
  { name: "Accounting", description: "Billing, invoicing, and finance." },
  { name: "Human Resources", description: "Hiring, onboarding, and personnel." },
] as const;

// ── Organization settings ────────────────────────────────────────────────

export type WorkWeekDefinition = { id: string; label: string };

/** Common operating work weeks; scheduling rules refine this later. */
export const WORK_WEEKS: readonly WorkWeekDefinition[] = [
  { id: "monday_friday", label: "Monday – Friday" },
  { id: "monday_saturday", label: "Monday – Saturday" },
  { id: "seven_day", label: "7-day operation" },
] as const;

export function workWeekLabel(id: string): string {
  return WORK_WEEKS.find((w) => w.id === id)?.label ?? id;
}

/** Default shift lengths in hours (scheduling arrives later). */
export const SHIFT_LENGTHS_HOURS = [8, 10, 12] as const;

/** US-centric timezone set shared by workspace preferences and locations. */
export const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
] as const;
