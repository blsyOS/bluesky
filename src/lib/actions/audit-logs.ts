"use server";

import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

const PAGE_SIZE = 25;

export async function listAuditLogs(page = 1) {
  const session = await getCurrentSession();
  const where = { companyId: session.company.id };

  const [entries, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    entries,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
