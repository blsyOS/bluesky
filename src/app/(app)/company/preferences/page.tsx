import type { Metadata } from "next";
import { OperationsPanel } from "@/components/company/operations-panel";
import { PreferencesPanel } from "@/components/company/preferences-panel";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = { title: "Organization Preferences" };

export default async function CompanyPreferencesPage() {
  const session = await getCurrentSession();
  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
      <PreferencesPanel settings={session.company.settings} />
      <OperationsPanel settings={session.company.settings} />
    </div>
  );
}
