import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { Card, CardBody } from "@/components/ui/card";
import { getOptionalSession, isSetupRequired } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  // A valid session skips the form; a fresh database goes to setup.
  const session = await getOptionalSession();
  if (session) redirect("/dashboard");
  if (await isSetupRequired()) redirect("/setup");

  const { setup } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background to-surface-muted px-4">
      <Logo className="mb-8" />
      <Card variant="elevated" className="w-full max-w-sm">
        <CardBody className="space-y-4 p-6">
          <div>
            <h1 className="text-title-page">Welcome back</h1>
            <p className="mt-1 text-body text-muted-foreground">
              Sign in to your BlueSky OS workspace.
            </p>
          </div>
          {setup === "complete" ? (
            <p
              role="status"
              className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
            >
              Platform setup complete. Sign in with your administrator account.
            </p>
          ) : null}
          <LoginForm />
        </CardBody>
      </Card>
      <p className="mt-8 text-caption">© {new Date().getFullYear()} BlueSky OS</p>
    </div>
  );
}
