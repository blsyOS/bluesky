"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { toggleCompanyFlag } from "@/lib/actions/company-admin";
import type { CompanyFlagDefinition } from "@/lib/company";

/**
 * Company feature-flag toggles. Foundation only — flags persist per
 * company and are audit-logged; modules read them as they come online.
 */
export function FlagList({
  flags,
}: {
  flags: Array<CompanyFlagDefinition & { enabled: boolean }>;
}) {
  const toast = useToast();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  // Optimistic switch state: flips immediately on click, reverts on error.
  // Server revalidation converges props to the same values.
  const [enabledByKey, setEnabledByKey] = useState<Record<string, boolean>>(
    () => Object.fromEntries(flags.map((f) => [f.key, f.enabled]))
  );
  const [, startTransition] = useTransition();

  function toggle(key: string, label: string, enabled: boolean) {
    setPendingKey(key);
    setEnabledByKey((current) => ({ ...current, [key]: enabled }));
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("key", key);
        formData.set("enabled", String(enabled));
        await toggleCompanyFlag(formData);
        toast("success", `${label} ${enabled ? "enabled" : "disabled"}.`);
      } catch {
        setEnabledByKey((current) => ({ ...current, [key]: !enabled }));
        toast("error", "Couldn't update the flag. Please try again.");
      } finally {
        setPendingKey(null);
      }
    });
  }

  return (
    <Card>
      <CardHeader
        title="Feature flags"
        description="Per-company toggles. These are the foundation — modules begin reading them as they come online."
      />
      <ul className="divide-y divide-border">
        {flags.map((flag) => {
          const enabled = enabledByKey[flag.key] ?? flag.enabled;
          return (
            <li
              key={flag.key}
              className="flex flex-wrap items-center gap-3 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {flag.label}
                  <code className="rounded bg-surface-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    {flag.key}
                  </code>
                  {enabled ? (
                    <Badge tone="success">On</Badge>
                  ) : (
                    <Badge tone="neutral">Off</Badge>
                  )}
                </p>
                <p className="mt-0.5 text-caption">{flag.description}</p>
              </div>
              <Switch
                label=""
                aria-label={`Toggle ${flag.label}`}
                checked={enabled}
                disabled={pendingKey === flag.key}
                onChange={(e) => toggle(flag.key, flag.label, e.target.checked)}
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
