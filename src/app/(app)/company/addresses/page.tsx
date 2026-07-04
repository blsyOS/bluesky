import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { ToastForm } from "@/components/ui/toast-form";
import { upsertCompanyAddress } from "@/lib/actions/company-admin";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { ADDRESS_TYPES } from "@/lib/company";

export const metadata: Metadata = { title: "Company Addresses" };

/**
 * One panel per address type, driven entirely by ADDRESS_TYPES — adding a
 * type in src/lib/company.ts adds a panel here with no UI changes.
 */
export default async function CompanyAddressesPage() {
  const session = await getCurrentSession();
  const addresses = await db.companyAddress.findMany({
    where: { companyId: session.company.id },
  });
  const byType = new Map(addresses.map((a) => [a.type, a]));

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {ADDRESS_TYPES.map((type) => {
        const address = byType.get(type.id);
        const prefix = `${type.id}`;
        return (
          <SettingsPanel
            key={type.id}
            title={type.label}
            description={type.description}
          >
            <ToastForm
              action={upsertCompanyAddress}
              successMessage={`${type.label} address saved.`}
              className="space-y-3"
            >
              <input type="hidden" name="type" value={type.id} />
              <Field label="Company" htmlFor={`${prefix}-companyLine`}>
                <Input
                  id={`${prefix}-companyLine`}
                  name="companyLine"
                  placeholder={session.company.name}
                  defaultValue={address?.companyLine ?? ""}
                />
              </Field>
              <Field label="Address line 1" htmlFor={`${prefix}-line1`}>
                <Input
                  id={`${prefix}-line1`}
                  name="addressLine1"
                  defaultValue={address?.addressLine1 ?? ""}
                />
              </Field>
              <Field label="Address line 2" htmlFor={`${prefix}-line2`}>
                <Input
                  id={`${prefix}-line2`}
                  name="addressLine2"
                  defaultValue={address?.addressLine2 ?? ""}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" htmlFor={`${prefix}-city`}>
                  <Input
                    id={`${prefix}-city`}
                    name="city"
                    defaultValue={address?.city ?? ""}
                  />
                </Field>
                <Field label="State" htmlFor={`${prefix}-state`}>
                  <Input
                    id={`${prefix}-state`}
                    name="state"
                    defaultValue={address?.state ?? ""}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Postal code" htmlFor={`${prefix}-zip`}>
                  <Input
                    id={`${prefix}-zip`}
                    name="postalCode"
                    defaultValue={address?.postalCode ?? ""}
                  />
                </Field>
                <Field label="Country" htmlFor={`${prefix}-country`}>
                  <Input
                    id={`${prefix}-country`}
                    name="country"
                    defaultValue={address?.country ?? "USA"}
                  />
                </Field>
              </div>
              <Button type="submit" size="sm">
                Save {type.label.toLowerCase()} address
              </Button>
            </ToastForm>
          </SettingsPanel>
        );
      })}
    </div>
  );
}
