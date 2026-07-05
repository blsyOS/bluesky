import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requirePermission } from "@/lib/authz";
import { db } from "@/lib/db";
import { LocationsWorkspace } from "./locations-workspace";

export const metadata: Metadata = { title: "Locations" };

/**
 * Organization Locations (BO-02.01C): the physical operating locations
 * every product shares. Employees, vehicles, equipment, inventory, and
 * dispatch areas will be assigned to these in future build orders.
 */
export default async function LocationsPage() {
  const session = await requirePermission("company.manage");

  const locations = await db.organizationLocation.findMany({
    where: { companyId: session.company.id },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Locations"
        description={`Physical operating locations for ${session.company.name}, shared by every BlueSky product.`}
      />
      <LocationsWorkspace
        locations={locations.map((l) => ({
          id: l.id,
          name: l.name,
          code: l.code,
          type: l.type,
          status: l.status,
          city: l.city,
          state: l.state,
          timezone: l.timezone,
          phone: l.phone,
        }))}
      />
    </>
  );
}
