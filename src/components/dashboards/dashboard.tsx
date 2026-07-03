"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { SkeletonKpiRow, SkeletonCard } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { DashboardIcon } from "@/components/icons";
import { WidgetCard } from "@/components/dashboards/widget-card";
import { dashboardRegistry } from "@/lib/dashboards/registry";
import type {
  DashboardContext,
  DashboardSectionData,
  DashboardWidget,
  WidgetSize,
} from "@/lib/dashboards/types";
import { cn } from "@/lib/cn";

/**
 * Grid footprint per widget size. The grid is 1 column on mobile,
 * 2 on tablet (sm+), 4 on desktop (xl+); widgets always stack on mobile.
 */
const SIZE_CLASSES: Record<WidgetSize, string> = {
  small: "sm:col-span-1",
  medium: "sm:col-span-1 xl:col-span-2",
  large: "sm:col-span-2",
  wide: "sm:col-span-2 xl:col-span-4",
};

function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6">
      <SkeletonKpiRow />
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function DashboardSection({
  section,
  children,
}: {
  section: DashboardSectionData;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={section.category.label}>
      <SectionHeader title={section.category.label} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

/**
 * The reusable dashboard engine surface. Loads widgets for
 * `context.dashboardId` from the registry (failure-isolated), groups them
 * into category sections, and renders the responsive grid with loading,
 * empty, and error states. Rendering never fails because a provider has
 * no data — scaffolded dashboards fall through to the empty state.
 */
export function Dashboard({ context }: { context: DashboardContext }) {
  const router = useRouter();
  const toast = useToast();

  const [sections, setSections] = useState<DashboardSectionData[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    dashboardRegistry
      .loadSections(context)
      .then((loaded) => {
        if (!cancelled) setSections(loaded);
      })
      .catch(() => {
        // loadSections isolates provider failures; this only fires on an
        // engine-level fault.
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- context is a per-render literal; version drives reloads
  }, [context.dashboardId, version]);

  const refresh = useCallback(() => {
    setSections(null);
    setFailed(false);
    setVersion((v) => v + 1);
  }, []);

  const actionContext = useMemo(
    () => ({
      navigate: (href: string) => router.push(href),
      notify: (message: string) => toast("info", message),
      refresh,
    }),
    [router, toast, refresh]
  );

  if (failed) {
    return (
      <EmptyState
        icon={<DashboardIcon />}
        title="The dashboard couldn't load"
        description="Something went wrong while loading widgets."
        action={
          <Button variant="secondary" onClick={refresh}>
            Try again
          </Button>
        }
        className="py-16"
      />
    );
  }

  if (!dashboardRegistry.hasWidgetProviders()) {
    return (
      <EmptyState
        icon={<DashboardIcon />}
        title="No dashboard widgets registered"
        description="Modules register their widgets with the dashboard registry as they come online."
        className="py-16"
      />
    );
  }

  if (sections === null) return <DashboardSkeleton />;

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={<DashboardIcon />}
        title="This dashboard is coming online"
        description="Its widgets connect when the module's build order is complete."
        className="py-16"
      />
    );
  }

  return (
    <div className="space-y-7">
      {sections.map((section) => (
        <DashboardSection key={section.category.id} section={section}>
          {section.widgets.map((widget: DashboardWidget) => (
            <div key={widget.id} className={cn(SIZE_CLASSES[widget.size])}>
              <WidgetCard widget={widget} context={actionContext} />
            </div>
          ))}
        </DashboardSection>
      ))}
    </div>
  );
}
