import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartBarIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Reports" };

/**
 * Reports landing. Names the report categories that future modules will
 * populate — there is no reporting engine yet, so every category is marked
 * coming soon rather than showing fabricated figures.
 */
const REPORT_CATEGORIES = [
  {
    title: "Ticket Production",
    description: "Volume, throughput, and completion rates across locate tickets.",
    source: "Locate module",
  },
  {
    title: "Damage Reports",
    description: "Damage investigations, causes, and outcomes.",
    source: "Locate module",
  },
  {
    title: "SLA Compliance",
    description: "On-time performance against service-level agreements.",
    source: "Locate + Dispatch",
  },
  {
    title: "Locator Performance",
    description: "Per-locator productivity and quality metrics.",
    source: "Locate module",
  },
  {
    title: "Utility Performance",
    description: "Response and quality metrics by utility owner.",
    source: "Locate + Contacts",
  },
  {
    title: "Dispatch Performance",
    description: "Assignment efficiency and routing metrics.",
    source: "Dispatch module",
  },
  {
    title: "Fleet Reports",
    description: "Vehicle utilization and equipment metrics.",
    source: "Fleet module",
  },
];

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Cross-module reporting for your BlueSky products."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_CATEGORIES.map((report) => (
          <Card key={report.title} className="h-full">
            <CardBody className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                  <ChartBarIcon className="size-4.5" />
                </span>
                <Badge tone="warning">Coming soon</Badge>
              </div>
              <h2 className="mt-4 text-title-card">{report.title}</h2>
              <p className="mt-1 flex-1 text-caption">{report.description}</p>
              <p className="mt-3 text-xs text-faint-foreground">
                Supplied by:{" "}
                <span className="font-medium text-muted-foreground">
                  {report.source}
                </span>
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-caption">
        The reporting engine ships in a later build order; categories are
        listed here so navigation and structure are ready.
      </p>
    </>
  );
}
