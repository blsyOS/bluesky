import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { CompanyDisplayStatus } from "@/lib/company";

/**
 * Reusable company status chip (BO-02.01A). One place maps company
 * lifecycle statuses to design-system tones so they display consistently
 * everywhere a company is referenced.
 */
const STATUS_TONES: Record<CompanyDisplayStatus, BadgeTone> = {
  trial: "info",
  active: "success",
  suspended: "danger",
  archived: "neutral",
  expired: "warning",
};

export function CompanyStatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status as CompanyDisplayStatus] ?? "neutral";
  return (
    <Badge tone={tone}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {status}
    </Badge>
  );
}
