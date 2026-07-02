import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { listAuditLogs } from "@/lib/actions/audit-logs";
import { formatDateTime, humanizeAction } from "@/lib/format";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { entries, total, pageCount } = await listAuditLogs(page);

  return (
    <>
      <PageHeader
        title="Audit logs"
        description="A chronological record of admin actions across your company."
      />

      <Card>
        <CardHeader
          title={`${total} event${total === 1 ? "" : "s"}`}
          description="Newest first."
        />
        <Table>
          <THead>
            <tr>
              <TH>When</TH>
              <TH>Action</TH>
              <TH>Description</TH>
              <TH>Actor</TH>
              <TH>Entity</TH>
            </tr>
          </THead>
          <TBody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <TD className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                </TD>
                <TD>
                  <Badge tone="blue">{humanizeAction(entry.action)}</Badge>
                </TD>
                <TD className="max-w-md">
                  <p>{entry.description}</p>
                </TD>
                <TD className="whitespace-nowrap">
                  {entry.user
                    ? `${entry.user.firstName} ${entry.user.lastName}`
                    : "System"}
                </TD>
                <TD className="whitespace-nowrap text-muted-foreground">
                  {entry.entityType}
                </TD>
              </tr>
            ))}
            {entries.length === 0 ? (
              <tr>
                <TD colSpan={5} className="py-10 text-center text-muted-foreground">
                  No audit events yet.
                </TD>
              </tr>
            ) : null}
          </TBody>
        </Table>

        {pageCount > 1 ? (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm">
            <span className="text-muted-foreground">
              Page {page} of {pageCount}
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`/audit-logs?page=${page - 1}`}
                  className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-muted"
                >
                  Previous
                </Link>
              ) : null}
              {page < pageCount ? (
                <Link
                  href={`/audit-logs?page=${page + 1}`}
                  className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-muted"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </Card>
    </>
  );
}
