import { Breadcrumbs, type Crumb } from "@/components/shell/breadcrumbs";

export type Breadcrumb = Crumb;

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}) {
  return (
    <div className="mb-6">
      {breadcrumbs?.length ? (
        <Breadcrumbs items={breadcrumbs} className="mb-2" />
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-title-page">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
