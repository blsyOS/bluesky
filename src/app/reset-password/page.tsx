import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = { title: "Reset password" };

/**
 * Reset-password landing (BO-AUTH-01). Token-based resets require email
 * delivery, which is a future build order — until then this page explains
 * the path and administrators reset credentials directly.
 */
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background to-surface-muted px-4">
      <Logo className="mb-8" />
      <Card variant="elevated" className="w-full max-w-sm">
        <CardBody className="space-y-4 p-6">
          <div>
            <h1 className="text-title-page">Reset your password</h1>
            <p className="mt-1 text-body text-muted-foreground">
              Password reset links are delivered by email. Email integration
              arrives with a later build order — until then, contact your
              administrator to reset your password.
            </p>
          </div>
          <Link
            href="/login"
            className="block text-center text-sm font-medium text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
