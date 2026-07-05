import type { Metadata } from "next";
import { SparkleIcon } from "@/components/icons";
import { PlatformPlaceholder } from "../platform-placeholder";

export const metadata: Metadata = { title: "Platform · System Health" };

export default function PlatformHealthPage() {
  return (
    <PlatformPlaceholder
      icon={<SparkleIcon />}
      title="System Health"
      description="Service status, queues, and background jobs across the platform."
      futureNotes={[
        "API, database, queue, and job-runner telemetry (feeds the dashboard System widgets).",
        "Incident tracking and status history.",
        "Per-tenant health drill-down.",
      ]}
    />
  );
}
