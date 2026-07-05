import type { Metadata } from "next";
import { ContactIcon } from "@/components/icons";
import { PlatformPlaceholder } from "../platform-placeholder";

export const metadata: Metadata = { title: "Platform · Support Tools" };

export default function PlatformSupportPage() {
  return (
    <PlatformPlaceholder
      icon={<ContactIcon />}
      title="Support Tools"
      description="Tools for supporting tenants: impersonation, diagnostics, and data assistance."
      futureNotes={[
        "Support impersonation with full audit trail.",
        "Tenant diagnostics (config, flags, license state at a glance).",
        "Data export/repair utilities.",
      ]}
    />
  );
}
