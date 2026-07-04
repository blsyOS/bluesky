import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { ToastForm } from "@/components/ui/toast-form";
import { updateServiceTerritory } from "@/lib/actions/company-admin";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { jsonListToCsv } from "@/lib/lists";

export const metadata: Metadata = { title: "Service Territory" };

export default async function ServiceTerritoryPage() {
  const session = await getCurrentSession();
  const territory = await db.companyServiceTerritory.findUnique({
    where: { companyId: session.company.id },
  });

  return (
    <div className="max-w-2xl">
      <SettingsPanel
        title="Service territory"
        description="Where this company operates. GIS boundaries arrive in a later phase — this is the descriptive foundation."
      >
        <ToastForm
          action={updateServiceTerritory}
          successMessage="Service territory saved."
          className="space-y-4"
        >
          <Field
            label="States"
            htmlFor="states"
            helper="Comma-separated, e.g. TX, OK, LA"
          >
            <Input
              id="states"
              name="states"
              defaultValue={jsonListToCsv(territory?.states)}
            />
          </Field>
          <Field
            label="Counties"
            htmlFor="counties"
            helper="Comma-separated county names."
          >
            <Input
              id="counties"
              name="counties"
              defaultValue={jsonListToCsv(territory?.counties)}
            />
          </Field>
          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              placeholder="Coverage notes, exclusions, seasonal areas…"
              defaultValue={territory?.description ?? ""}
            />
          </Field>
          <Button type="submit">Save territory</Button>
        </ToastForm>
      </SettingsPanel>
    </div>
  );
}
