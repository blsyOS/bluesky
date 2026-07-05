import type { Metadata } from "next";
import { ChartBarIcon } from "@/components/icons";
import { PlatformPlaceholder } from "../platform-placeholder";

export const metadata: Metadata = { title: "Platform · Billing" };

export default function PlatformBillingPage() {
  return (
    <PlatformPlaceholder
      icon={<ChartBarIcon />}
      title="Billing"
      description="Tenant subscriptions, invoices, and payment status."
      futureNotes={[
        "Stripe integration (subscriptions, invoices, payment methods).",
        "Per-tenant billing status feeding suspension workflows.",
        "Usage-based line items as products come online.",
      ]}
    />
  );
}
