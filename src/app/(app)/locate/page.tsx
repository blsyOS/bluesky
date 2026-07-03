import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/module-page";
import { ScrollIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Locate · Tickets" };

export default function LocateTicketsPage() {
  return (
    <ModulePlaceholder
      icon={<ScrollIcon />}
      title="Tickets"
      description="811 locate tickets — intake, assignment, and completion — will appear here with full search and filtering."
      source="BlueSky Locate ticketing module"
    />
  );
}
