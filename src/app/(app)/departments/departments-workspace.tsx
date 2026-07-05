"use client";

import { useActionState, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, InlineError, Input, Textarea } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { SitemapIcon } from "@/components/icons";
import {
  addDefaultDepartments,
  createDepartment,
  setDepartmentActive,
} from "@/lib/actions/organization";

type DepartmentRow = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  teamCount: number;
};

export function DepartmentsWorkspace({
  departments,
}: {
  departments: DepartmentRow[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [state, action, pending] = useActionState(createDepartment, null);

  return (
    <Card>
      <CardHeader
        title={`Departments (${departments.length})`}
        description="Operations, Dispatch, Safety, and any structure your organization uses."
        actions={
          <div className="flex items-center gap-2">
            <form action={addDefaultDepartments}>
              <Button type="submit" variant="secondary">
                Add default departments
              </Button>
            </form>
            <Button onClick={() => setFormOpen((v) => !v)}>
              {formOpen ? "Close" : "Add department"}
            </Button>
          </div>
        }
      />

      {formOpen ? (
        <div className="border-b border-border bg-surface-muted/50 px-5 py-4">
          {state?.error ? (
            <div className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
              <InlineError>{state.error}</InlineError>
            </div>
          ) : null}
          <form action={action} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="d-name">
                <Input id="d-name" name="name" required />
              </Field>
              <Field label="Description" htmlFor="d-desc">
                <Textarea id="d-desc" name="description" rows={2} />
              </Field>
            </div>
            <p className="text-caption">
              Department managers and default locations arrive with the
              employee foundation.
            </p>
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save department"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {departments.length > 0 ? (
        <Table>
          <THead>
            <tr>
              <TH>Department</TH>
              <TH>Teams</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {departments.map((d) => (
              <TR key={d.id}>
                <TD>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-caption">{d.description ?? "—"}</p>
                </TD>
                <TD className="text-muted-foreground">{d.teamCount}</TD>
                <TD>
                  <StatusBadge status={d.active ? "active" : "inactive"} />
                </TD>
                <TD className="text-right">
                  <form action={setDepartmentActive} className="inline">
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="active" value={String(!d.active)} />
                    <Button type="submit" variant="ghost" size="sm">
                      {d.active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : !formOpen ? (
        <EmptyState
          icon={<SitemapIcon />}
          title="No departments yet"
          description="Departments group your teams: Operations, Dispatch, Field Operations, Safety, and more. Start from the platform defaults or create your own — future modules use departments for employees, scheduling, and reporting."
          action={
            <form action={addDefaultDepartments}>
              <Button type="submit">Add default departments</Button>
            </form>
          }
        />
      ) : null}
    </Card>
  );
}
