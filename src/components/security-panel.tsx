"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, InlineError, Input } from "@/components/ui/form";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { useToast } from "@/components/ui/toast";
import { changePassword } from "@/lib/actions/auth";
import { describePolicy } from "@/lib/auth/password-policy";

/**
 * Account security (BO-AUTH-01): change password, sign-in activity, and
 * a placeholder for concurrent-session management.
 */
export function SecurityPanel({
  lastLoginAt,
  lastActivityAt,
}: {
  lastLoginAt: string | null;
  lastActivityAt: string | null;
}) {
  const toast = useToast();
  const [state, action, pending] = useActionState(changePassword, null);

  return (
    <SettingsPanel
      title="Security"
      description="Your sign-in credentials and session activity."
    >
      <div className="space-y-5">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-meta">Last login</dt>
            <dd className="mt-0.5">
              {lastLoginAt ? new Date(lastLoginAt).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-meta">Last activity</dt>
            <dd className="mt-0.5">
              {lastActivityAt ? new Date(lastActivityAt).toLocaleString() : "—"}
            </dd>
          </div>
        </dl>

        <form action={action} className="space-y-4">
          {state && "error" in state ? (
            <div
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2"
            >
              <InlineError>{state.error}</InlineError>
            </div>
          ) : null}
          {state && "success" in state ? (
            <p
              role="status"
              className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
            >
              Password changed. Your other sessions were signed out.
            </p>
          ) : null}
          <Field label="Current password" htmlFor="sec-current">
            <Input
              id="sec-current"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" htmlFor="sec-new" helper={describePolicy()}>
              <Input
                id="sec-new"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </Field>
            <Field label="Confirm new password" htmlFor="sec-confirm">
              <Input
                id="sec-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </Field>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Changing…" : "Change password"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                toast(
                  "info",
                  "Log out all sessions arrives with concurrent-session management in a later build order."
                )
              }
            >
              Log out all sessions
            </Button>
          </div>
        </form>
      </div>
    </SettingsPanel>
  );
}
