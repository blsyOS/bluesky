import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ClockIcon, SearchIcon, SparkleIcon } from "@/components/icons";

/** Loading rows shown while providers resolve. */
export function SearchingState() {
  return (
    <div aria-hidden className="space-y-2 px-2 py-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="size-8 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NoResultsState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<SearchIcon />}
      title={`No results for “${query}”`}
      description="Try a different term, or browse with the quick actions below."
      className="py-10"
    />
  );
}

export function NoProvidersState() {
  return (
    <EmptyState
      icon={<SearchIcon />}
      title="No search providers registered"
      description="Modules register their content with the search registry as they come online."
      className="py-10"
    />
  );
}

export function NoRecentSearchesState() {
  return (
    <EmptyState
      icon={<ClockIcon />}
      title="No recent searches"
      description="Your searches will show up here."
      className="py-8"
    />
  );
}

/** Reserved slot for the future AI answer surface. */
export function AiPlaceholder() {
  return (
    <div className="mx-2 mb-2 flex items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2.5 opacity-70">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <SparkleIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">Ask BlueSky AI</span>
        <span className="block truncate text-caption">
          Natural-language answers across your operations
        </span>
      </span>
      <span className="text-meta">Coming soon</span>
    </div>
  );
}
