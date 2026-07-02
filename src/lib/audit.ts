import { headers } from "next/headers";
import { db } from "@/lib/db";

type AuditEntry = {
  companyId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, unknown>;
};

/**
 * Writes an audit trail entry for a major admin action. Request context
 * (IP, user agent) is captured automatically when available.
 */
export async function recordAudit(entry: AuditEntry) {
  let ipAddress: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = await headers();
    ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    userAgent = h.get("user-agent");
  } catch {
    // Outside a request scope (e.g. scripts) — leave request context empty.
  }

  await db.auditLog.create({
    data: {
      companyId: entry.companyId,
      userId: entry.userId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      description: entry.description,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      ipAddress,
      userAgent,
    },
  });
}
