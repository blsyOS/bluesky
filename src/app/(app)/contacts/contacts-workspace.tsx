"use client";

import { useActionState, useMemo, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, InlineError, Select, Textarea } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from "@/components/ui/table";
import { ContactIcon } from "@/components/icons";
import { createContact } from "@/lib/actions/contacts";
import { CONTACT_STATUSES, contactSubtypeLabel } from "@/lib/contacts";
import type { ContactTypeGroup } from "@/lib/contacts";

type ContactRow = {
  id: string;
  contactType: string;
  subtype: string | null;
  status: string;
  organization: string | null;
  contactName: string;
  title: string | null;
  email: string | null;
  officePhone: string | null;
  mobilePhone: string | null;
};

export function ContactsWorkspace({
  contactTypes,
  contacts,
}: {
  contactTypes: ContactTypeGroup[];
  contacts: ContactRow[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [activeType, setActiveType] = useState<string>("all");
  const [state, action, pending] = useActionState(createContact, null);

  // Form state: chosen group drives the available subtypes.
  const [formType, setFormType] = useState(contactTypes[0]?.id ?? "");
  const formSubtypes =
    contactTypes.find((g) => g.id === formType)?.subtypes ?? [];

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of contacts) {
      map.set(c.contactType, (map.get(c.contactType) ?? 0) + 1);
    }
    return map;
  }, [contacts]);

  const filtered = useMemo(
    () =>
      activeType === "all"
        ? contacts
        : contacts.filter((c) => c.contactType === activeType),
    [contacts, activeType]
  );

  return (
    <div className="space-y-4">
      {/* Contact-type filter chips */}
      <div className="flex flex-wrap gap-2">
        <TypeChip
          label="All"
          count={contacts.length}
          active={activeType === "all"}
          onClick={() => setActiveType("all")}
        />
        {contactTypes.map((group) => (
          <TypeChip
            key={group.id}
            label={group.label}
            count={counts.get(group.id) ?? 0}
            active={activeType === group.id}
            onClick={() => setActiveType(group.id)}
          />
        ))}
      </div>

      <Card>
        <CardHeader
          title={`Directory (${filtered.length})`}
          description="Utility owners, municipalities, contractors, and more."
          actions={
            <Button onClick={() => setFormOpen((v) => !v)}>
              {formOpen ? "Close" : "Add contact"}
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
                <Field label="Contact type" htmlFor="c-type">
                  <Select
                    id="c-type"
                    name="contactType"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    {contactTypes.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Subtype" htmlFor="c-subtype">
                  <Select id="c-subtype" name="subtype" defaultValue="">
                    <option value="">—</option>
                    {formSubtypes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Contact name" htmlFor="c-name">
                  <Input id="c-name" name="contactName" required />
                </Field>
                <Field label="Organization" htmlFor="c-org">
                  <Input id="c-org" name="organization" />
                </Field>
                <Field label="Title" htmlFor="c-title">
                  <Input id="c-title" name="title" />
                </Field>
                <Field label="Department" htmlFor="c-dept">
                  <Input id="c-dept" name="department" />
                </Field>
                <Field label="Status" htmlFor="c-status">
                  <Select id="c-status" name="status" defaultValue="active">
                    {CONTACT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Email" htmlFor="c-email">
                  <Input id="c-email" name="email" type="email" />
                </Field>
                <Field label="Office phone" htmlFor="c-office">
                  <Input id="c-office" name="officePhone" type="tel" />
                </Field>
                <Field label="Mobile phone" htmlFor="c-mobile">
                  <Input id="c-mobile" name="mobilePhone" type="tel" />
                </Field>
                <Field label="Utility served" htmlFor="c-util">
                  <Input id="c-util" name="utilityServed" />
                </Field>
                <Field label="Service area" htmlFor="c-area">
                  <Input id="c-area" name="serviceArea" />
                </Field>
                <Field label="Counties" htmlFor="c-counties" helper="Comma-separated">
                  <Input id="c-counties" name="counties" />
                </Field>
                <Field label="States" htmlFor="c-states" helper="Comma-separated">
                  <Input id="c-states" name="states" />
                </Field>
                <Field label="Physical address" htmlFor="c-phys">
                  <Input id="c-phys" name="physicalAddress" />
                </Field>
                <Field label="Mailing address" htmlFor="c-mail">
                  <Input id="c-mail" name="mailingAddress" />
                </Field>
              </div>
              <Field label="Notes" htmlFor="c-notes">
                <Textarea id="c-notes" name="notes" />
              </Field>
              <div className="flex justify-end">
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Save contact"}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        <Table>
          <THead>
            <tr>
              <TH>Contact</TH>
              <TH>Type</TH>
              <TH>Status</TH>
              <TH>Email</TH>
              <TH>Phone</TH>
            </tr>
          </THead>
          <TBody>
            {filtered.map((c) => (
              <TR key={c.id}>
                <TD>
                  <p className="font-medium">{c.contactName}</p>
                  <p className="text-caption">
                    {[c.title, c.organization].filter(Boolean).join(" · ") || "—"}
                  </p>
                </TD>
                <TD>
                  <Badge tone="neutral">
                    {contactSubtypeLabel(c.contactType, c.subtype) ??
                      contactTypeGroupLabel(contactTypes, c.contactType)}
                  </Badge>
                </TD>
                <TD>
                  <StatusBadge status={c.status} />
                </TD>
                <TD className="text-muted-foreground">{c.email ?? "—"}</TD>
                <TD className="text-muted-foreground">
                  {c.mobilePhone ?? c.officePhone ?? "—"}
                </TD>
              </TR>
            ))}
            {filtered.length === 0 ? (
              <TableEmptyRow hasAny={contacts.length > 0} />
            ) : null}
          </TBody>
        </Table>
      </Card>

      {contacts.length === 0 && !formOpen ? (
        <EmptyState
          icon={<ContactIcon />}
          title="No contacts yet"
          description="Add utility owners, municipalities, contractors, and emergency contacts to build your directory. Nothing is pre-populated."
          action={<Button onClick={() => setFormOpen(true)}>Add your first contact</Button>}
        />
      ) : null}
    </div>
  );
}

function contactTypeGroupLabel(groups: ContactTypeGroup[], id: string) {
  return groups.find((g) => g.id === id)?.label ?? id;
}

function TableEmptyRow({ hasAny }: { hasAny: boolean }) {
  return (
    <TableEmpty
      colSpan={5}
      title={hasAny ? "No contacts of this type" : "No contacts yet"}
      description={
        hasAny
          ? "Try a different contact type filter."
          : "Add your first contact to start the directory."
      }
    />
  );
}

function TypeChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground")
      }
    >
      {label}
      <span className={active ? "opacity-80" : "text-faint-foreground"}>{count}</span>
    </button>
  );
}
