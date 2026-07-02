import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductGlyph } from "@/components/ui/product-card";
import { accentStyle } from "@/lib/accents";
import { getProductAccess } from "@/lib/access";

/**
 * Placeholder product workspace. Product experiences (LocateOS, LeakOS, …)
 * ship as later milestones; this route only proves the access path works.
 */
export default async function LaunchPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const products = await getProductAccess();
  const item = products.find(
    (p) => p.product.key.toLowerCase() === key.toLowerCase()
  );

  if (!item) notFound();
  if (!item.launchable) redirect("/switcher");

  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      style={accentStyle(item.product.key)}
    >
      <Card variant="elevated" className="w-full max-w-lg overflow-hidden">
        <div aria-hidden className="h-1.5 bg-accent" />
        <CardBody className="flex flex-col items-center py-12 text-center">
          <ProductGlyph
            name={item.product.name}
            productKey={item.product.key}
            size="xl"
          />
          <h1 className="mt-5 text-title-page">{item.product.name}</h1>
          <p className="mt-2 max-w-sm text-body text-muted-foreground">
            {item.product.description}
          </p>
          <Badge tone="accent" className="mt-4">
            Workspace provisioned
          </Badge>
          <p className="mt-4 rounded-lg bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
            This product workspace is provisioned for your company and will
            come online in an upcoming release.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 text-sm font-medium text-accent hover:underline"
          >
            ← Back to dashboard
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
