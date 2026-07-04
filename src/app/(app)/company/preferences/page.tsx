import type { Metadata } from "next";
import { PreferencesPanel } from "@/components/company/preferences-panel";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = { title: "Company Preferences" };

export default async function CompanyPreferencesPage() {
  const session = await getCurrentSession();
  return (
    <div className="max-w-2xl">
      <PreferencesPanel settings={session.company.settings} />
    </div>
  );
}
