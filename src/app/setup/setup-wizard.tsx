"use client";

import { useActionState, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, HelperText, InlineError, Input } from "@/components/ui/form";
import { completeInitialSetup } from "@/lib/actions/auth";
import { describePolicy, validatePassword } from "@/lib/auth/password-policy";
import { cn } from "@/lib/cn";

const STEPS = ["Organization", "Platform Administrator", "Organization Administrator"];

type Values = Record<string, string>;

/**
 * Three-step first-run wizard. All fields post as one form so the server
 * action creates the organization and administrators atomically; steps
 * are presentation only. Inputs are controlled so values survive
 * React 19's automatic form reset after a rejected server action, and
 * the Continue/Complete buttons are keyed separately so a step change
 * can never turn an in-flight click into a form submission.
 */
export function SetupWizard() {
  const [step, setStep] = useState(0);
  const [sameAdmin, setSameAdmin] = useState(true);
  const [stepError, setStepError] = useState<string | null>(null);
  const [values, setValues] = useState<Values>({});
  const [state, action, pending] = useActionState(completeInitialSetup, null);

  const v = (name: string) => values[name] ?? "";
  const set = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [name]: e.target.value }));

  // Client-side gate per step; the server action revalidates everything.
  function continueFrom(current: number) {
    const requiredByStep: string[][] = [
      ["orgName", "subdomain"],
      ["paFirstName", "paLastName", "paEmail", "paPassword", "paConfirm"],
    ];
    for (const name of requiredByStep[current] ?? []) {
      if (!v(name).trim()) {
        setStepError("Fill in every field before continuing.");
        return;
      }
    }
    if (current === 1) {
      if (v("paPassword") !== v("paConfirm")) {
        setStepError("Passwords do not match.");
        return;
      }
      const failures = validatePassword(v("paPassword"));
      if (failures.length > 0) {
        setStepError(failures.join(" "));
        return;
      }
    }
    setStepError(null);
    setStep(current + 1);
  }

  const field = (
    name: string,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    helper?: string
  ) => (
    <Field label={label} htmlFor={`s-${name}`} helper={helper}>
      <Input
        id={`s-${name}`}
        name={name}
        value={v(name)}
        onChange={set(name)}
        {...props}
      />
    </Field>
  );

  return (
    <Card variant="elevated" className="w-full max-w-lg">
      <CardBody className="space-y-5 p-6">
        <div>
          <h1 className="text-title-page">Set up BlueSky OS</h1>
          <p className="mt-1 text-body text-muted-foreground">
            Create the platform administrator, your first organization, and
            its administrator.
          </p>
        </div>

        {/* Stepper */}
        <ol className="flex items-center gap-2" aria-label="Setup progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                aria-current={i === step ? "step" : undefined}
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  i < step
                    ? "bg-success text-white"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-xs sm:block",
                  i === step ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>

        {state?.error || stepError ? (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2"
          >
            <InlineError>{state?.error ?? stepError}</InlineError>
          </div>
        ) : null}

        <form action={action} className="space-y-4">
          {/* Step 1 — Organization */}
          <div className={cn("space-y-4", step !== 0 && "hidden")}>
            {field(
              "orgName",
              "Organization name",
              { placeholder: "BlueSky Locating" },
              "Your company as it appears across BlueSky OS."
            )}
            {field(
              "subdomain",
              "Subdomain",
              { placeholder: "bluesky" },
              "Lowercase letters and numbers, e.g. “bluesky”."
            )}
          </div>

          {/* Step 2 — Platform Administrator */}
          <div className={cn("space-y-4", step !== 1 && "hidden")}>
            <HelperText>
              The platform administrator manages BlueSky OS itself: all
              tenants, the product catalog, licensing, and billing.
            </HelperText>
            <div className="grid grid-cols-2 gap-4">
              {field("paFirstName", "First name", { autoComplete: "given-name" })}
              {field("paLastName", "Last name", { autoComplete: "family-name" })}
            </div>
            {field("paEmail", "Email", { type: "email", autoComplete: "email" })}
            {field(
              "paPassword",
              "Password",
              { type: "password", autoComplete: "new-password" },
              describePolicy()
            )}
            {field("paConfirm", "Confirm password", {
              type: "password",
              autoComplete: "new-password",
            })}
          </div>

          {/* Step 3 — Organization Administrator */}
          <div className={cn("space-y-4", step !== 2 && "hidden")}>
            <HelperText>
              The organization administrator manages this organization:
              profile, users, roles, locations, departments, and teams.
            </HelperText>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="sameAdmin"
                checked={sameAdmin}
                onChange={(e) => setSameAdmin(e.target.checked)}
                className="size-4 rounded border-border accent-[var(--color-primary)]"
              />
              The platform administrator also manages this organization
            </label>
            {!sameAdmin ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {field("oaFirstName", "First name")}
                  {field("oaLastName", "Last name")}
                </div>
                {field("oaEmail", "Email", { type: "email" })}
                {field(
                  "oaPassword",
                  "Password",
                  { type: "password", autoComplete: "new-password" },
                  describePolicy()
                )}
                {field("oaConfirm", "Confirm password", {
                  type: "password",
                  autoComplete: "new-password",
                })}
              </>
            ) : null}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              key="back"
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={cn(step === 0 && "invisible")}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                key="continue"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  continueFrom(step);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button key="submit" type="submit" disabled={pending}>
                {pending ? "Setting up…" : "Complete setup"}
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
