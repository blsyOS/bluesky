import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/module-page";
import { ChartBarIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Locate · Reports" };

export default function LocateReportsPage() {
  return (
    <ModulePlaceholder
      icon={<ChartBarIcon />}
      title="Locate reports"
      description="Locate-specific production and compliance reports will be generated here. Cross-module reporting lives under Reports."
      source="BlueSky reporting engine"
    />
  );
}
