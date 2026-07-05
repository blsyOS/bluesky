import type { Metadata } from "next";
import { BoxesIcon } from "@/components/icons";
import { PlatformPlaceholder } from "../platform-placeholder";

export const metadata: Metadata = { title: "Platform · Product Catalog" };

export default function PlatformCatalogPage() {
  return (
    <PlatformPlaceholder
      icon={<BoxesIcon />}
      title="Product Catalog"
      description="The master catalog of BlueSky products offered to tenants."
      futureNotes={[
        "Define and version products (LocateOS, LeakOS, FiberOS, SiteView, Command Center).",
        "Set availability (active / coming soon / hidden) per product.",
        "Manage product accents and marketing metadata.",
      ]}
    />
  );
}
