import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/form";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { ToastForm } from "@/components/ui/toast-form";
import { updateCompanySettings } from "@/lib/actions/companies";
import { THEMES } from "@/lib/constants";
import { TIMEZONES } from "@/lib/organization";

export type PreferencesData = {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  defaultTheme: string;
} | null;

/**
 * Workspace preferences panel, shared by /settings and Company
 * Administration → Preferences so the form exists once.
 */
export function PreferencesPanel({ settings }: { settings: PreferencesData }) {
  return (
    <SettingsPanel
      title="Workspace preferences"
      description="Defaults applied across your company's workspace."
    >
      <ToastForm
        action={updateCompanySettings}
        successMessage="Workspace preferences saved."
        className="space-y-4"
      >
        <Field label="Timezone" htmlFor="timezone">
          <Select
            id="timezone"
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
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date format" htmlFor="dateFormat">
            <Select
              id="dateFormat"
              name="dateFormat"
              defaultValue={settings?.dateFormat ?? "MM/DD/YYYY"}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </Select>
          </Field>
          <Field label="Time format" htmlFor="timeFormat">
            <Select
              id="timeFormat"
              name="timeFormat"
              defaultValue={settings?.timeFormat ?? "12h"}
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </Select>
          </Field>
        </div>
        <Field
          label="Default theme"
          htmlFor="defaultTheme"
          helper="Users can still toggle their own theme."
        >
          <Select
            id="defaultTheme"
            name="defaultTheme"
            defaultValue={settings?.defaultTheme ?? "system"}
          >
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit">Save preferences</Button>
      </ToastForm>
    </SettingsPanel>
  );
}
