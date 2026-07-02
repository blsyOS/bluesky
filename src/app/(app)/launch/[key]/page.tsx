import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
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
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardBody className="flex flex-col items-center py-12 text-center">
          <span
            className="inline-flex size-16 items-center justify-center rounded-2xl text-lg font-bold text-white"
            style={{ backgroundColor: item.product.accentColor ?? "#64748b" }}
          >
            {item.product.name.slice(0, 2)}
          </span>
          <h1 className="mt-5 text-xl font-semibold">{item.product.name}</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {item.product.description}
          </p>
          <p className="mt-6 rounded-lg bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
            This product workspace is provisioned for your company and will
            come online in an upcoming release.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 text-sm font-medium text-primary hover:underline"
          >
            ← Back to dashboard
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
