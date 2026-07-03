import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/module-page";
import { MapPinIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Locate · Maps" };

export default function LocateMapsPage() {
  return (
    <ModulePlaceholder
      icon={<MapPinIcon />}
      title="Maps"
      description="Ticket locations, coverage areas, and locator positions will render on the operational map here."
      source="BlueSky Locate mapping module"
    />
  );
}
