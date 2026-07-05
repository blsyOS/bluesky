import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/authz";
import { db } from "@/lib/db";
import { TeamsWorkspace } from "./teams-workspace";

export const metadata: Metadata = { title: "Teams" };

/**
 * Teams (BO-02.01C): working units inside departments (Locate Team A,
 * Dispatch Day Shift, Storm Team Alpha). Team leads, members, equipment,
 * vehicles, and schedules arrive with future modules.
 */
export default async function TeamsPage() {
  const session = await requirePermission("company.manage");

  const [teams, departments] = await Promise.all([
    db.team.findMany({
      where: { companyId: session.company.id },
      orderBy: [{ active: "desc" }, { name: "asc" }],
      include: { department: { select: { name: true } } },
    }),
    db.department.findMany({
      where: { companyId: session.company.id, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Teams"
        description={`Working units inside ${session.company.name}'s departments.`}
      />
      <TeamsWorkspace
        teams={teams.map((t) => ({
          id: t.id,
          name: t.name,
          code: t.code,
          description: t.description,
          active: t.active,
          departmentName: t.department.name,
        }))}
        departments={departments}
      />
    </>
  );
}
