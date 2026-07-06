import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { isSetupRequired } from "@/lib/session";
import { SetupWizard } from "./setup-wizard";

export const metadata: Metadata = { title: "Initial Setup" };

// The availability check counts users at request time — never prerender.
export const dynamic = "force-dynamic";

/**
 * Initial Setup Wizard (BO-AUTH-01). Reachable only while no users
 * exist; once the first administrator is created the wizard permanently
 * redirects to sign-in (unless the database is reset).
 */
export default async function SetupPage() {
  if (!(await isSetupRequired())) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background to-surface-muted px-4 py-10">
      <Logo className="mb-8" />
      <SetupWizard />
      <p className="mt-8 text-caption">
        This wizard runs once, on a fresh installation.
      </p>
    </div>
  );
}
