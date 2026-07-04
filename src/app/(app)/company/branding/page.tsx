import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Field, HelperText, Input } from "@/components/ui/form";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { ToastForm } from "@/components/ui/toast-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { updateCompanyBranding } from "@/lib/actions/company-admin";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = { title: "Company Branding" };

function Swatch({ label, color }: { label: string; color: string | null }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="size-8 rounded-lg border border-border"
        style={{ backgroundColor: color ?? "transparent" }}
      />
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-faint-foreground">{color ?? "Not set"}</p>
      </div>
    </div>
  );
}

export default async function CompanyBrandingPage() {
  const session = await getCurrentSession();
  const company = session.company;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SettingsPanel
        title="Brand identity"
        description="Logo and colors used where company branding appears."
      >
        <ToastForm
          action={updateCompanyBranding}
          successMessage="Branding saved."
          className="space-y-4"
        >
          <Field
            label="Logo URL"
            htmlFor="logoUrl"
            helper="Shown in the sidebar company card."
          >
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              placeholder="https://…"
              defaultValue={company.logoUrl ?? ""}
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Primary color" htmlFor="primaryColor">
              <Input
                id="primaryColor"
                name="primaryColor"
                placeholder="#2b62f0"
                defaultValue={company.primaryColor ?? ""}
              />
            </Field>
            <Field label="Secondary color" htmlFor="secondaryColor">
              <Input
                id="secondaryColor"
                name="secondaryColor"
                placeholder="#0c1a2e"
                defaultValue={company.secondaryColor ?? ""}
              />
            </Field>
            <Field label="Accent color" htmlFor="accentColor">
              <Input
                id="accentColor"
                name="accentColor"
                placeholder="#16a34a"
                defaultValue={company.accentColor ?? ""}
              />
            </Field>
          </div>

          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="text-title-card">Future-ready</p>
            <HelperText>
              Stored now, applied in later build orders (favicon swapping and
              branded email templates).
            </HelperText>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <Field label="Favicon URL (placeholder)" htmlFor="faviconUrl">
                <Input
                  id="faviconUrl"
                  name="faviconUrl"
                  type="url"
                  defaultValue={company.faviconUrl ?? ""}
                />
              </Field>
              <Field label="Email logo URL (placeholder)" htmlFor="emailLogoUrl">
                <Input
                  id="emailLogoUrl"
                  name="emailLogoUrl"
                  type="url"
                  defaultValue={company.emailLogoUrl ?? ""}
                />
              </Field>
            </div>
          </div>

          <Button type="submit">Save branding</Button>
        </ToastForm>
      </SettingsPanel>

      <Card>
        <CardHeader
          title="Brand preview"
          description="How this company's branding presents today."
        />
        <CardBody className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-border p-4">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- external, user-provided logo URL
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="size-10 rounded-lg object-contain"
              />
            ) : (
              <span
                className="inline-flex size-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: company.primaryColor ?? "var(--primary)" }}
              >
                {company.name.slice(0, 2)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{company.name}</p>
              <p className="truncate text-caption">
                {company.dba ? `dba ${company.dba}` : company.legalName ?? ""}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Swatch label="Primary" color={company.primaryColor} />
            <Swatch label="Secondary" color={company.secondaryColor} />
            <Swatch label="Accent" color={company.accentColor} />
          </div>
          <p className="text-caption">
            The logo appears in the sidebar company card. Deeper theming
            (favicon, emails, full workspace theming) arrives with later
            build orders.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
