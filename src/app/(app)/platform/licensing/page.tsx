import type { Metadata } from "next";
import { ShieldIcon } from "@/components/icons";
import { PlatformPlaceholder } from "../platform-placeholder";

export const metadata: Metadata = { title: "Platform · Licensing" };

export default function PlatformLicensingPage() {
  return (
    <PlatformPlaceholder
      icon={<ShieldIcon />}
      title="Licensing"
      description="Which tenants are licensed for which products, seats, and terms."
      futureNotes={[
        "Grant and revoke product licenses per tenant (enforcement of CompanyProduct).",
        "Seat counts, trial windows, and expiration (drives the derived 'expired' status).",
        "License history and audit trail.",
      ]}
    />
  );
}
