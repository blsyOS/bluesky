import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/authz";
import { db } from "@/lib/db";
import { DepartmentsWorkspace } from "./departments-workspace";

export const metadata: Metadata = { title: "Departments" };

/**
 * Organization Departments (BO-02.01C): the functional structure teams
 * hang off. The platform offers a default set; organizations add their
 * own. Managers and default locations arrive with the employee
 * foundation.
 */
export default async function DepartmentsPage() {
  const session = await requirePermission("company.manage");

  const departments = await db.department.findMany({
    where: { companyId: session.company.id },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { _count: { select: { teams: true } } },
  });

  return (
    <>
      <PageHeader
        title="Departments"
        description={`How ${session.company.name} is organized. Teams belong to departments.`}
      />
      <DepartmentsWorkspace
        departments={departments.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          active: d.active,
          teamCount: d._count.teams,
        }))}
      />
    </>
  );
}
