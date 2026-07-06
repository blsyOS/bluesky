import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { Card, CardBody } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background to-surface-muted px-4">
      <Logo className="mb-8" />
      <Card variant="elevated" className="w-full max-w-sm">
        <CardBody className="space-y-4 p-6">
          <div>
            <h1 className="text-title-page">Forgot your password?</h1>
            <p className="mt-1 text-body text-muted-foreground">
              Enter your email and we&apos;ll send reset instructions once
              email delivery is connected.
            </p>
          </div>
          <ForgotPasswordForm />
        </CardBody>
      </Card>
    </div>
  );
}
