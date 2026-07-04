import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { ToastForm } from "@/components/ui/toast-form";
import {
  updateCompanyContactInfo,
  updateCompanyProfile,
} from "@/lib/actions/company-admin";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { COMPANY_STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "Company Profile" };

export default async function CompanyProfilePage() {
  const session = await getCurrentSession();
  const company = session.company;
  const contactInfo = await db.companyContactInfo.findUnique({
    where: { companyId: company.id },
  });

  const founded = company.foundedDate
    ? company.foundedDate.toISOString().slice(0, 10)
    : "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SettingsPanel
        title="General"
        description="Legal identity and public profile."
      >
        <ToastForm
          action={updateCompanyProfile}
          successMessage="Company profile saved."
          className="space-y-4"
        >
          <Field label="Company name" htmlFor="name">
            <Input id="name" name="name" defaultValue={company.name} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Legal company name" htmlFor="legalName">
              <Input
                id="legalName"
                name="legalName"
                defaultValue={company.legalName ?? ""}
              />
            </Field>
            <Field label="DBA" htmlFor="dba" helper="Doing business as.">
              <Input id="dba" name="dba" defaultValue={company.dba ?? ""} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" defaultValue={company.status}>
                {COMPANY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Founded" htmlFor="foundedDate">
              <Input
                id="foundedDate"
                name="foundedDate"
                type="date"
                defaultValue={founded}
              />
            </Field>
          </div>
          <Field label="Website" htmlFor="website">
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://…"
              defaultValue={company.website ?? ""}
            />
          </Field>
          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              placeholder="What this company does…"
              defaultValue={company.description ?? ""}
            />
          </Field>
          <Button type="submit">Save profile</Button>
        </ToastForm>
      </SettingsPanel>

      <SettingsPanel
        title="Contact information"
        description="Company-level contact channels."
      >
        <ToastForm
          action={updateCompanyContactInfo}
          successMessage="Contact information saved."
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Main office phone" htmlFor="mainPhone">
              <Input
                id="mainPhone"
                name="mainPhone"
                type="tel"
                defaultValue={contactInfo?.mainPhone ?? ""}
              />
            </Field>
            <Field label="Main email" htmlFor="mainEmail">
              <Input
                id="mainEmail"
                name="mainEmail"
                type="email"
                defaultValue={contactInfo?.mainEmail ?? ""}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Emergency phone" htmlFor="emergencyPhone">
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                defaultValue={contactInfo?.emergencyPhone ?? ""}
              />
            </Field>
            <Field label="After hours phone" htmlFor="afterHoursPhone">
              <Input
                id="afterHoursPhone"
                name="afterHoursPhone"
                type="tel"
                defaultValue={contactInfo?.afterHoursPhone ?? ""}
              />
            </Field>
          </div>
          <Field label="Billing email" htmlFor="billingEmail">
            <Input
              id="billingEmail"
              name="billingEmail"
              type="email"
              defaultValue={contactInfo?.billingEmail ?? ""}
            />
          </Field>
          <Button type="submit">Save contact info</Button>
        </ToastForm>
      </SettingsPanel>
    </div>
  );
}
