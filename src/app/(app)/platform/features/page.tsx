import type { Metadata } from "next";
import { SettingsIcon } from "@/components/icons";
import { PlatformPlaceholder } from "../platform-placeholder";

export const metadata: Metadata = { title: "Platform · Feature Management" };

export default function PlatformFeaturesPage() {
  return (
    <PlatformPlaceholder
      icon={<SettingsIcon />}
      title="Feature Management"
      description="Platform-level feature flags and rollouts across tenants."
      futureNotes={[
        "Define platform flags and default states (tenant flags exist under Organization → Feature Flags).",
        "Staged rollouts: enable a feature for specific tenants or percentages.",
        "Flag usage reporting.",
      ]}
    />
  );
}
