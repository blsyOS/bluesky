"use client";

import { useToast } from "@/components/ui/toast";

/**
 * Form wrapper that reports the outcome of a server action as a toast.
 * Use for mutations whose only UI feedback would otherwise be a silent
 * re-render (enable/disable product, save settings, grant/revoke access).
 * Forms needing field-level errors should use useActionState instead
 * (see the invite form).
 */
export function ToastForm({
  action,
  successMessage,
  errorMessage = "Something went wrong. Please try again.",
  children,
  ...formProps
}: Omit<React.FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: (formData: FormData) => Promise<void>;
  successMessage: string;
  errorMessage?: string;
  children: React.ReactNode;
}) {
  const toast = useToast();

  return (
    <form
      {...formProps}
      action={async (formData: FormData) => {
        try {
          await action(formData);
          toast("success", successMessage);
        } catch {
          // Server action errors are masked in production; show a stable
          // generic message rather than a digest.
          toast("error", errorMessage);
        }
      }}
    >
      {children}
    </form>
  );
}
