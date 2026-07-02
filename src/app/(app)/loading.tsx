import { Skeleton, SkeletonKpiRow, SkeletonTable } from "@/components/ui/skeleton";

/** Route-level loading state for authenticated pages. */
export default function AppLoading() {
  return (
    <div aria-busy="true">
      <div className="mb-6">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-2 h-3.5 w-80" />
      </div>
      <SkeletonKpiRow />
      <div className="mt-6">
        <SkeletonTable rows={5} />
      </div>
    </div>
  );
}
