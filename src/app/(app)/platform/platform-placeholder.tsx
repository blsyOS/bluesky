import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Placeholder body for Platform Administration pages whose functionality
 * arrives in later Epic 02+ build orders: empty state plus concrete
 * future-functionality notes. Never fabricates data.
 */
export function PlatformPlaceholder({
  icon,
  title,
  description,
  futureNotes,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  futureNotes: string[];
}) {
  return (
    <Card>
      <CardBody className="py-4">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          className="py-10"
        />
        <div className="mx-auto max-w-lg rounded-xl border border-dashed border-border px-4 py-3">
          <p className="text-meta">Planned functionality</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-caption">
            {futureNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
