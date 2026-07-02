"use client";

import { useActionState, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import {
  assignProductAccess,
  createUser,
  removeProductAccess,
  updateUser,
} from "@/lib/actions/users";
import { USER_STATUSES } from "@/lib/constants";
import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  access: {
    id: string;
    productId: string;
    productName: string;
    accentColor: string | null;
    roleName: string;
  }[];
};

type Option = { id: string; name: string };

export function UsersTable({
  users,
  products,
  roles,
}: {
  users: UserRow[];
  products: Option[];
  roles: Option[];
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [inviteState, inviteAction, invitePending] = useActionState(
    createUser,
    null
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={`All users (${users.length})`}
          description="Invite teammates and manage their product access."
          actions={
            <Button onClick={() => setInviteOpen((v) => !v)}>
              {inviteOpen ? "Close" : "Invite user"}
            </Button>
          }
        />

        {inviteOpen ? (
          <div className="border-b border-border bg-surface-muted/50 px-5 py-4">
            {inviteState?.error ? (
              <p
                role="alert"
                className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400"
              >
                {inviteState.error}
              </p>
            ) : null}
            <form
              action={inviteAction}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
            >
              <Field label="First name" htmlFor="invite-first">
                <Input
                  id="invite-first"
                  name="firstName"
                  defaultValue={inviteState?.values?.firstName ?? ""}
                  required
                />
              </Field>
              <Field label="Last name" htmlFor="invite-last">
                <Input
                  id="invite-last"
                  name="lastName"
                  defaultValue={inviteState?.values?.lastName ?? ""}
                  required
                />
              </Field>
              <Field label="Email" htmlFor="invite-email">
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  defaultValue={inviteState?.values?.email ?? ""}
                  required
                />
              </Field>
              <Field label="Phone (optional)" htmlFor="invite-phone">
                <Input
                  id="invite-phone"
                  name="phone"
                  type="tel"
                  defaultValue={inviteState?.values?.phone ?? ""}
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={invitePending}>
                  {invitePending ? "Inviting…" : "Send invite"}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        <Table>
          <THead>
            <tr>
              <TH>User</TH>
              <TH>Status</TH>
              <TH>Product access</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {users.map((user) => {
              const expanded = expandedId === user.id;
              return [
                <tr key={user.id} className={cn(expanded && "bg-surface-muted/40")}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                        {initials(user.firstName, user.lastName)}
                      </span>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <StatusBadge status={user.status} />
                  </TD>
                  <TD>
                    <div className="flex max-w-md flex-wrap gap-1.5">
                      {user.access.map((a) => (
                        <Badge key={a.id} tone="blue">
                          {a.productName} · {a.roleName}
                        </Badge>
                      ))}
                      {user.access.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          No product access
                        </span>
                      ) : null}
                    </div>
                  </TD>
                  <TD className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setExpandedId(expanded ? null : user.id)}
                    >
                      {expanded ? "Close" : "Manage"}
                    </Button>
                  </TD>
                </tr>,
                expanded ? (
                  <tr key={`${user.id}-manage`} className="bg-surface-muted/40">
                    <TD colSpan={4} className="py-4">
                      <div className="grid gap-6 lg:grid-cols-3">
                        <div>
                          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Grant product access
                          </h3>
                          <form action={assignProductAccess} className="space-y-3">
                            <input type="hidden" name="userId" value={user.id} />
                            <Field label="Product">
                              <Select name="productId" required>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </Select>
                            </Field>
                            <Field label="Role">
                              <Select name="roleId" required>
                                {roles.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </Select>
                            </Field>
                            <Button type="submit" size="sm">
                              Grant access
                            </Button>
                          </form>
                        </div>

                        <div>
                          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Current access
                          </h3>
                          <div className="space-y-2">
                            {user.access.map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                              >
                                <div className="flex items-center gap-2 text-sm">
                                  <span
                                    className="size-2.5 rounded-full"
                                    style={{
                                      backgroundColor: a.accentColor ?? "#64748b",
                                    }}
                                  />
                                  {a.productName}
                                  <span className="text-xs text-muted-foreground">
                                    {a.roleName}
                                  </span>
                                </div>
                                <form action={removeProductAccess}>
                                  <input type="hidden" name="userId" value={user.id} />
                                  <input
                                    type="hidden"
                                    name="productId"
                                    value={a.productId}
                                  />
                                  <Button variant="danger" size="sm" type="submit">
                                    Revoke
                                  </Button>
                                </form>
                              </div>
                            ))}
                            {user.access.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No access granted yet.
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Profile & status
                          </h3>
                          <form action={updateUser} className="space-y-3">
                            <input type="hidden" name="userId" value={user.id} />
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="First name">
                                <Input name="firstName" defaultValue={user.firstName} required />
                              </Field>
                              <Field label="Last name">
                                <Input name="lastName" defaultValue={user.lastName} required />
                              </Field>
                            </div>
                            <Field label="Phone">
                              <Input name="phone" defaultValue={user.phone ?? ""} />
                            </Field>
                            <Field label="Status">
                              <Select name="status" defaultValue={user.status}>
                                {USER_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </Select>
                            </Field>
                            <Button type="submit" size="sm" variant="secondary">
                              Save changes
                            </Button>
                          </form>
                        </div>
                      </div>
                    </TD>
                  </tr>
                ) : null,
              ];
            })}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
