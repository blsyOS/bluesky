import { cn } from "@/lib/cn";

/**
 * Data table styling wrapper. Compose inside a <Card>:
 *
 *   <Table>
 *     <THead><tr><TH>…</TH></tr></THead>
 *     <TBody>
 *       <TR><TD>…</TD></TR>
 *       <TableEmpty colSpan={n} … />   // when there are no rows
 *     </TBody>
 *   </Table>
 */
export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-surface-muted/50 text-meta">
      {children}
    </thead>
  );
}

export function TH({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-5 py-3 font-medium", className)} {...props} />;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

/** Row with hover affordance. `flat` opts out (e.g. expanded detail rows). */
export function TR({
  flat = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { flat?: boolean }) {
  return (
    <tr
      className={cn(
        !flat && "transition-colors hover:bg-surface-muted/40",
        className
      )}
      {...props}
    />
  );
}

export function TD({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-5 py-3 align-middle", className)} {...props} />;
}

export function TableEmpty({
  colSpan,
  title,
  description,
}: {
  colSpan: number;
  title: string;
  description?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center">
        <p className="text-title-card">{title}</p>
        {description ? <p className="mt-1 text-caption">{description}</p> : null}
      </td>
    </tr>
  );
}
