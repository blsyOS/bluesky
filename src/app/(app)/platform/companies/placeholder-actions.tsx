"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * Placeholder tenant actions (BO-02.01B). Suspension, billing, and tenant
 * management arrive with later Epic 02 build orders.
 */
const ACTIONS = ["View", "Manage", "Suspend", "Billing"] as const;

export function PlaceholderActions({ companyName }: { companyName: string }) {
  const toast = useToast();
  return (
    <div className="flex justify-end gap-1">
      {ACTIONS.map((action) => (
        <Button
          key={action}
          size="sm"
          variant="ghost"
          onClick={() =>
            toast(
              "info",
              `${action} for ${companyName} arrives with a later build order.`
            )
          }
        >
          {action}
        </Button>
      ))}
    </div>
  );
}
