import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/module-page";
import { ShieldIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Locate · Damage Investigations" };

export default function LocateDamageInvestigationsPage() {
  return (
    <ModulePlaceholder
      icon={<ShieldIcon />}
      title="Damage Investigations"
      description="Open, pending, and closed damage investigations with evidence and findings will be managed here."
      source="BlueSky Locate damage investigation module"
    />
  );
}
