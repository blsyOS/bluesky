"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, InlineError, Input, Select, Textarea } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { TeamIcon } from "@/components/icons";
import { createTeam, setTeamActive } from "@/lib/actions/organization";

type TeamRow = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  active: boolean;
  departmentName: string;
};

type DepartmentOption = { id: string; name: string };

export function TeamsWorkspace({
  teams,
  departments,
}: {
  teams: TeamRow[];
  departments: DepartmentOption[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [state, action, pending] = useActionState(createTeam, null);

  // Teams require a department: without one, guide the admin there first.
  if (departments.length === 0 && teams.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<TeamIcon />}
          title="Create departments first"
          description="Teams belong to departments (Locate Team A in Field Operations, Dispatch Day Shift in Dispatch). Set up your departments, then come back to build teams. Future modules assign team leads, members, equipment, vehicles, and schedules."
          action={
            <Link
              href="/departments"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-hover"
            >
              Go to Departments
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={`Teams (${teams.length})`}
        description="Crews and shifts that do the work, grouped by department."
        actions={
          <Button onClick={() => setFormOpen((v) => !v)} disabled={departments.length === 0}>
            {formOpen ? "Close" : "Add team"}
          </Button>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Team name" htmlFor="t-name">
                <Input id="t-name" name="name" required placeholder="Locate Team A" />
              </Field>
              <Field label="Team code" htmlFor="t-code" helper="Short code, e.g. LOC-A">
                <Input id="t-code" name="code" />
              </Field>
              <Field label="Department" htmlFor="t-dept">
                <Select id="t-dept" name="departmentId" defaultValue={departments[0]?.id}>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Description" htmlFor="t-desc">
                <Textarea id="t-desc" name="description" rows={1} />
              </Field>
            </div>
            <p className="text-caption">
              Team leads, members, equipment, vehicles, and schedules arrive
              with future modules.
            </p>
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save team"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {teams.length > 0 ? (
        <Table>
          <THead>
            <tr>
              <TH>Team</TH>
              <TH>Department</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {teams.map((t) => (
              <TR key={t.id}>
                <TD>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-caption">
                    {[t.code, t.description].filter(Boolean).join(" · ") || "—"}
                  </p>
                </TD>
                <TD>
                  <Badge tone="neutral">{t.departmentName}</Badge>
                </TD>
                <TD>
                  <StatusBadge status={t.active ? "active" : "inactive"} />
                </TD>
                <TD className="text-right">
                  <form action={setTeamActive} className="inline">
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="active" value={String(!t.active)} />
                    <Button type="submit" variant="ghost" size="sm">
                      {t.active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : !formOpen ? (
        <EmptyState
          icon={<TeamIcon />}
          title="No teams yet"
          description="Teams are the crews and shifts that do the work — Locate Team A, Storm Team Alpha, Dispatch Day Shift. Future modules assign team leads, members, equipment, vehicles, and schedules."
          action={<Button onClick={() => setFormOpen(true)}>Add your first team</Button>}
        />
      ) : null}
    </Card>
  );
}
