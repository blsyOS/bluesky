import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardBody } from "@/components/ui/card";

/**
 * Reusable "professional empty state" body for module pages whose
 * functionality has not shipped yet. Explains what will appear and which
 * future module supplies it — never fabricates data.
 */
export function ModulePlaceholder({
  icon,
  title,
  description,
  source,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Which future build order / module delivers this. */
  source: string;
}) {
  return (
    <Card>
      <CardBody className="py-4">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          className="py-14"
        />
        <p className="mx-auto max-w-md text-center text-caption">
          Supplied by: <span className="font-medium text-foreground">{source}</span>
        </p>
      </CardBody>
    </Card>
  );
}
