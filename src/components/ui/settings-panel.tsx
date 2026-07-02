import { Card, CardBody, CardHeader } from "@/components/ui/card";

/**
 * Standard panel for settings surfaces: titled card with an optional
 * footer row for actions.
 */
export function SettingsPanel({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody>{children}</CardBody>
      {footer ? (
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
