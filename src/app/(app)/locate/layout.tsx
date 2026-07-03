import { PageHeader } from "@/components/page-header";
import { LocateNav } from "./locate-nav";

/**
 * The BlueSky Locate module application shell. Shares the platform shell
 * and adds the Locate module's secondary navigation.
 */
export default function LocateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Locate"
        description="Utility locating operations."
        breadcrumbs={[{ label: "Locate" }]}
      />
      <LocateNav />
      {children}
    </>
  );
}
