import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { ToastForm } from "@/components/ui/toast-form";
import { updateCompany, updateCompanySettings } from "@/lib/actions/companies";
import { getCurrentSession } from "@/lib/session";
import { COMPANY_STATUSES, THEMES } from "@/lib/constants";

export const metadata: Metadata = { title: "Settings" };

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
];

export default async function SettingsPage() {
  const session = await getCurrentSession();
  const company = session.company;
  const settings = company.settings;

  return (
    <>
      <PageHeader
        title="Company settings"
        description="Your company profile and workspace preferences."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsPanel
          title="Company profile"
          description="How your company appears across BlueSky OS."
        >
          <ToastForm
            action={updateCompany}
            successMessage="Company profile saved."
            className="space-y-4"
          >
            <Field label="Company name" htmlFor="name">
              <Input id="name" name="name" defaultValue={company.name} required />
            </Field>
            <Field label="Legal name" htmlFor="legalName">
              <Input
                id="legalName"
                name="legalName"
                defaultValue={company.legalName ?? ""}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Subdomain"
                htmlFor="subdomain-display"
                helper="Subdomains can't be changed yet."
              >
                <Input
                  id="subdomain-display"
                  value={company.subdomain}
                  disabled
                />
              </Field>
              <Field label="Status" htmlFor="status">
                <Select id="status" name="status" defaultValue={company.status}>
                  {COMPANY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Logo URL" htmlFor="logoUrl">
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  placeholder="https://…"
                  defaultValue={company.logoUrl ?? ""}
                />
              </Field>
              <Field label="Primary color" htmlFor="primaryColor">
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  placeholder="#2563eb"
                  defaultValue={company.primaryColor ?? ""}
                />
              </Field>
            </div>
            <Button type="submit">Save profile</Button>
          </ToastForm>
        </SettingsPanel>

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
      </div>
    </>
  );
}
