"use client";

import { useActionState, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, InlineError, Select } from "@/components/ui/form";
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from "@/components/ui/table";
import { ToastForm } from "@/components/ui/toast-form";
import {
  assignProductAccess,
  createUser,
  removeProductAccess,
  updateUser,
} from "@/lib/actions/users";
import { USER_STATUSES } from "@/lib/constants";
import { accentStyle } from "@/lib/accents";
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
    productKey: string;
    productName: string;
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
              <div className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
                <InlineError>{inviteState.error}</InlineError>
              </div>
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
              <Field
                label="Phone (optional)"
                htmlFor="invite-phone"
                helper="Used for field notifications later."
              >
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
                <TR key={user.id} className={cn(expanded && "bg-surface-muted/40")}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                        {initials(user.firstName, user.lastName)}
                      </span>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-caption">{user.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <StatusBadge status={user.status} />
                  </TD>
                  <TD>
                    <div className="flex max-w-md flex-wrap gap-1.5">
                      {user.access.map((a) => (
                        <Badge
                          key={a.id}
                          tone="accent"
                          style={accentStyle(a.productKey)}
                          className="whitespace-nowrap"
                        >
                          <span
                            aria-hidden
                            className="size-1.5 rounded-full bg-accent"
                          />
                          {a.productName} · {a.roleName}
                        </Badge>
                      ))}
                      {user.access.length === 0 ? (
                        <span className="text-caption">No product access</span>
                      ) : null}
                    </div>
                  </TD>
                  <TD className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-expanded={expanded}
                      onClick={() => setExpandedId(expanded ? null : user.id)}
                    >
                      {expanded ? "Close" : "Manage"}
                    </Button>
                  </TD>
                </TR>,
                expanded ? (
                  <TR flat key={`${user.id}-manage`} className="bg-surface-muted/40">
                    <TD colSpan={4} className="py-4">
                      <div className="grid gap-6 lg:grid-cols-3">
                        <div>
                          <h3 className="mb-3 text-meta">Grant product access</h3>
                          <ToastForm
                            action={assignProductAccess}
                            successMessage={`Access granted to ${user.firstName}.`}
                            className="space-y-3"
                          >
                            <input type="hidden" name="userId" value={user.id} />
                            <Field label="Product" htmlFor={`grant-product-${user.id}`}>
                              <Select
                                id={`grant-product-${user.id}`}
                                name="productId"
                                required
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </Select>
                            </Field>
                            <Field label="Role" htmlFor={`grant-role-${user.id}`}>
                              <Select
                                id={`grant-role-${user.id}`}
                                name="roleId"
                                required
                              >
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
                          </ToastForm>
                        </div>

                        <div>
                          <h3 className="mb-3 text-meta">Current access</h3>
                          <div className="space-y-2">
                            {user.access.map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                              >
                                <div
                                  className="flex items-center gap-2 text-sm"
                                  style={accentStyle(a.productKey)}
                                >
                                  <span
                                    aria-hidden
                                    className="size-2.5 rounded-full bg-accent"
                                  />
                                  {a.productName}
                                  <span className="text-caption">{a.roleName}</span>
                                </div>
                                <ToastForm
                                  action={removeProductAccess}
                                  successMessage={`${a.productName} access removed for ${user.firstName}.`}
                                >
                                  <input type="hidden" name="userId" value={user.id} />
                                  <input
                                    type="hidden"
                                    name="productId"
                                    value={a.productId}
                                  />
                                  <Button variant="destructive" size="sm" type="submit">
                                    Revoke
                                  </Button>
                                </ToastForm>
                              </div>
                            ))}
                            {user.access.length === 0 ? (
                              <p className="text-caption">No access granted yet.</p>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-3 text-meta">Profile &amp; status</h3>
                          <ToastForm
                            action={updateUser}
                            successMessage={`${user.firstName}'s profile saved.`}
                            className="space-y-3"
                          >
                            <input type="hidden" name="userId" value={user.id} />
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="First name" htmlFor={`edit-first-${user.id}`}>
                                <Input
                                  id={`edit-first-${user.id}`}
                                  name="firstName"
                                  defaultValue={user.firstName}
                                  required
                                />
                              </Field>
                              <Field label="Last name" htmlFor={`edit-last-${user.id}`}>
                                <Input
                                  id={`edit-last-${user.id}`}
                                  name="lastName"
                                  defaultValue={user.lastName}
                                  required
                                />
                              </Field>
                            </div>
                            <Field label="Phone" htmlFor={`edit-phone-${user.id}`}>
                              <Input
                                id={`edit-phone-${user.id}`}
                                name="phone"
                                defaultValue={user.phone ?? ""}
                              />
                            </Field>
                            <Field label="Status" htmlFor={`edit-status-${user.id}`}>
                              <Select
                                id={`edit-status-${user.id}`}
                                name="status"
                                defaultValue={user.status}
                              >
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
                          </ToastForm>
                        </div>
                      </div>
                    </TD>
                  </TR>
                ) : null,
              ];
            })}
            {users.length === 0 ? (
              <TableEmpty
                colSpan={4}
                title="No users yet"
                description="Invite your first teammate to get started."
              />
            ) : null}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
