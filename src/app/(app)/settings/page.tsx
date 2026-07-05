import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PreferencesPanel } from "@/components/company/preferences-panel";
import { BuildingIcon } from "@/components/icons";
import { getCurrentSession } from "@/lib/session";
import { ProductContextPanel } from "./product-context-panel";

export const metadata: Metadata = { title: "Settings" };

/**
 * Workspace settings: product context and workspace preferences. The
 * company record itself (profile, branding, addresses, territory, flags)
 * is managed under Administration → Company (BO-02.01A).
 */
export default async function SettingsPage() {
  const session = await getCurrentSession();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Workspace preferences for this company."
      />

      <div className="mb-6">
        <ProductContextPanel />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PreferencesPanel settings={session.company.settings} />

        <Card>
          <CardHeader
            title="Organization profile"
            description="Managed under Organization Administration."
          />
          <CardBody className="flex items-center gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
              <BuildingIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{session.company.name}</p>
              <p className="text-caption">
                Profile, branding, addresses, service territory, and feature
                flags live in the Organization area.
              </p>
            </div>
            <Link
              href="/company"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              Open Organization →
            </Link>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
