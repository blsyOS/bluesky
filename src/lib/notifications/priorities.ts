import type { NotificationPriority } from "./types";

type PriorityMeta = {
  label: string;
  /** Design-system badge tone (see ui/badge.tsx). Display only. */
  tone: "danger" | "warning" | "info" | "neutral" | "accent";
  /** Lower renders earlier when sorting by priority. */
  rank: number;
};

/** Single source of truth for how priorities display across the platform. */
export const PRIORITY_META: Record<NotificationPriority, PriorityMeta> = {
  critical: { label: "Critical", tone: "danger", rank: 0 },
  high: { label: "High", tone: "warning", rank: 1 },
  normal: { label: "Normal", tone: "info", rank: 2 },
  low: { label: "Low", tone: "neutral", rank: 3 },
  information: { label: "Info", tone: "accent", rank: 4 },
};
