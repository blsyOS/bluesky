import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/module-page";
import { UsersIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Locate · Assignments" };

export default function LocateAssignmentsPage() {
  return (
    <ModulePlaceholder
      icon={<UsersIcon />}
      title="Assignments"
      description="Locator assignments and workload balancing will appear here once ticketing and dispatch are online."
      source="BlueSky Locate + Dispatch modules"
    />
  );
}
