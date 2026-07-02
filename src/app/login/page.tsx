import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Placeholder login. Real authentication is a later milestone; for now the
 * session is pinned to the seeded platform admin (see src/lib/session.ts).
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background to-surface-muted px-4">
      <Logo className="mb-8" />
      <Card className="w-full max-w-sm">
        <CardBody className="space-y-4 p-6">
          <div>
            <h1 className="text-lg font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your BlueSky OS workspace.
            </p>
          </div>
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              defaultValue="admin@blueskyos.app"
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input id="password" type="password" placeholder="••••••••" />
          </Field>
          <Link
            href="/dashboard"
            className="flex h-9 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            Sign in
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            Authentication is coming soon — this signs you in as the platform
            admin.
          </p>
        </CardBody>
      </Card>
      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} BlueSky OS
      </p>
    </div>
  );
}
