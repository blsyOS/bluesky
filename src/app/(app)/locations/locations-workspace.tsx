"use client";

import { useActionState, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, InlineError, Input, Select, Textarea } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MapPinIcon } from "@/components/icons";
import { createLocation, setLocationStatus } from "@/lib/actions/organization";
import { LOCATION_TYPES, TIMEZONES, locationTypeLabel } from "@/lib/organization";

type LocationRow = {
  id: string;
  name: string;
  code: string | null;
  type: string;
  status: string;
  city: string | null;
  state: string | null;
  timezone: string | null;
  phone: string | null;
};

export function LocationsWorkspace({ locations }: { locations: LocationRow[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [state, action, pending] = useActionState(createLocation, null);

  return (
    <Card>
      <CardHeader
        title={`Locations (${locations.length})`}
        description="Headquarters, service centers, yards, warehouses, and storm offices."
        actions={
          <Button onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? "Close" : "Add location"}
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
              <Field label="Name" htmlFor="l-name">
                <Input id="l-name" name="name" required />
              </Field>
              <Field label="Code" htmlFor="l-code" helper="Short code, e.g. HQ">
                <Input id="l-code" name="code" />
              </Field>
              <Field label="Type" htmlFor="l-type">
                <Select id="l-type" name="type" defaultValue="branch_office">
                  {LOCATION_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status" htmlFor="l-status">
                <Select id="l-status" name="status" defaultValue="active">
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </Select>
              </Field>
              <Field label="Street address" htmlFor="l-a1">
                <Input id="l-a1" name="addressLine1" />
              </Field>
              <Field label="City" htmlFor="l-city">
                <Input id="l-city" name="city" />
              </Field>
              <Field label="State" htmlFor="l-state">
                <Input id="l-state" name="state" />
              </Field>
              <Field label="ZIP" htmlFor="l-zip">
                <Input id="l-zip" name="postalCode" />
              </Field>
              <Field label="Country" htmlFor="l-country">
                <Input id="l-country" name="country" defaultValue="USA" />
              </Field>
              <Field label="Time zone" htmlFor="l-tz">
                <Select id="l-tz" name="timezone" defaultValue="America/Chicago">
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Hours open" htmlFor="l-open">
                <Input id="l-open" name="businessHoursStart" type="time" defaultValue="08:00" />
              </Field>
              <Field label="Hours close" htmlFor="l-close">
                <Input id="l-close" name="businessHoursEnd" type="time" defaultValue="17:00" />
              </Field>
              <Field label="Phone" htmlFor="l-phone">
                <Input id="l-phone" name="phone" type="tel" />
              </Field>
              <Field label="Email" htmlFor="l-email">
                <Input id="l-email" name="email" type="email" />
              </Field>
            </div>
            <Field label="Description" htmlFor="l-desc">
              <Textarea id="l-desc" name="description" />
            </Field>
            <p className="text-caption">
              Employees, vehicles, equipment, inventory, and dispatch areas
              will be assigned to locations by future modules.
            </p>
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save location"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {locations.length > 0 ? (
        <Table>
          <THead>
            <tr>
              <TH>Location</TH>
              <TH>Type</TH>
              <TH>City / State</TH>
              <TH>Time zone</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {locations.map((l) => (
              <TR key={l.id}>
                <TD>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-caption">{l.code ?? "—"}</p>
                </TD>
                <TD>
                  <Badge tone="neutral">{locationTypeLabel(l.type)}</Badge>
                </TD>
                <TD className="text-muted-foreground">
                  {[l.city, l.state].filter(Boolean).join(", ") || "—"}
                </TD>
                <TD className="text-muted-foreground">{l.timezone ?? "—"}</TD>
                <TD>
                  <StatusBadge status={l.status} />
                </TD>
                <TD className="text-right">
                  <form action={setLocationStatus} className="inline">
                    <input type="hidden" name="id" value={l.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={l.status === "active" ? "inactive" : "active"}
                    />
                    <Button type="submit" variant="ghost" size="sm">
                      {l.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : !formOpen ? (
        <EmptyState
          icon={<MapPinIcon />}
          title="No locations yet"
          description="Add your headquarters, branch offices, service centers, utility yards, warehouses, and temporary storm offices. Future modules assign employees, vehicles, equipment, inventory, and dispatch areas to them."
          action={<Button onClick={() => setFormOpen(true)}>Add your first location</Button>}
        />
      ) : null}
    </Card>
  );
}
