import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { ToastForm } from "@/components/ui/toast-form";
import { updateOrganizationOperations } from "@/lib/actions/organization";
import { SHIFT_LENGTHS_HOURS, TIMEZONES, WORK_WEEKS } from "@/lib/organization";

export type OperationsData = {
  timezone: string;
  workWeek: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  defaultShiftHours: number;
} | null;

/**
 * Business & operations defaults (BO-02.01C). Holidays, scheduling
 * rules, and dispatch defaults extend this panel when their modules
 * arrive.
 */
export function OperationsPanel({ settings }: { settings: OperationsData }) {
  return (
    <SettingsPanel
      title="Business & operations"
      description="Operating defaults future scheduling and dispatch modules build on."
    >
      <ToastForm
        action={updateOrganizationOperations}
        successMessage="Business and operations settings saved."
        className="space-y-4"
      >
        <Field label="Default time zone" htmlFor="op-timezone">
          <Select
            id="op-timezone"
            name="timezone"
            defaultValue={settings?.timezone ?? "America/Chicago"}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Work week" htmlFor="op-workweek">
          <Select
            id="op-workweek"
            name="workWeek"
            defaultValue={settings?.workWeek ?? "monday_friday"}
          >
            {WORK_WEEKS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Business hours open" htmlFor="op-open">
            <Input
              id="op-open"
              name="businessHoursStart"
              type="time"
              defaultValue={settings?.businessHoursStart ?? "08:00"}
            />
          </Field>
          <Field label="Business hours close" htmlFor="op-close">
            <Input
              id="op-close"
              name="businessHoursEnd"
              type="time"
              defaultValue={settings?.businessHoursEnd ?? "17:00"}
            />
          </Field>
        </div>
        <Field
          label="Default shift length"
          htmlFor="op-shift"
          helper="Scheduling rules, holidays, and dispatch defaults arrive with their modules."
        >
          <Select
            id="op-shift"
            name="defaultShiftHours"
            defaultValue={String(settings?.defaultShiftHours ?? 8)}
          >
            {SHIFT_LENGTHS_HOURS.map((h) => (
              <option key={h} value={h}>
                {h} hours
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit">Save operations settings</Button>
      </ToastForm>
    </SettingsPanel>
  );
}
