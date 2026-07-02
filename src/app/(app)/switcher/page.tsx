import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "@/components/icons";
import { getProductAccess } from "@/lib/access";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Product Switcher" };

export default async function SwitcherPage() {
  const products = await getProductAccess();
  const visible = products.filter((p) => p.userHasAccess);

  return (
    <>
      <PageHeader
        title="Product switcher"
        description="Jump into any product you have access to."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const unavailableReason = !item.enabledForCompany
            ? "Not enabled"
            : item.product.status === "coming_soon"
              ? "Coming soon"
              : null;

          const card = (
            <Card
              className={cn(
                "h-full",
                item.launchable
                  ? "transition-all hover:-translate-y-0.5 hover:shadow-md"
                  : "opacity-60"
              )}
            >
              <CardBody className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between">
                  <span
                    className="inline-flex size-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{
                      backgroundColor: item.product.accentColor ?? "#64748b",
                    }}
                  >
                    {item.product.name.slice(0, 2)}
                  </span>
                  {unavailableReason ? (
                    <Badge tone={unavailableReason === "Coming soon" ? "amber" : "gray"}>
                      {unavailableReason}
                    </Badge>
                  ) : (
                    <Badge tone="green">Available</Badge>
                  )}
                </div>
                <h2 className="mt-4 text-base font-semibold">
                  {item.product.name}
                </h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {item.product.description}
                </p>
                {item.launchable ? (
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Launch <ArrowRightIcon className="size-4" />
                  </span>
                ) : (
                  <span className="mt-4 text-sm text-muted-foreground">
                    Unavailable
                  </span>
                )}
              </CardBody>
            </Card>
          );

          return item.launchable ? (
            <Link
              key={item.product.id}
              href={`/launch/${item.product.key.toLowerCase()}`}
            >
              {card}
            </Link>
          ) : (
            <div key={item.product.id} aria-disabled="true">
              {card}
            </div>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-muted-foreground">
            You don&apos;t have access to any products yet. Ask your company
            admin to grant you a product role.
          </CardBody>
        </Card>
      ) : null}
    </>
  );
}
