"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { requestPasswordReset } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  if (state?.done) {
    return (
      <div className="space-y-4">
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          If an account exists for that email, password reset instructions
          will be sent when email delivery is available. Contact your
          administrator for immediate help.
        </p>
        <Link
          href="/login"
          className="block text-center text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          autoFocus
        />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Request reset"}
      </Button>
      <Link
        href="/login"
        className="block text-center text-sm font-medium text-primary hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}
