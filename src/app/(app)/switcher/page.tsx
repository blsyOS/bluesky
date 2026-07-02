import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/ui/product-card";
import { GridIcon } from "@/components/icons";
import { getProductAccess } from "@/lib/access";
import { describeAvailability } from "@/lib/availability";

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
        {visible.map((item) => (
          <ProductCard
            key={item.product.id}
            productKey={item.product.key}
            name={item.product.name}
            description={item.product.description}
            launchable={item.launchable}
            availability={describeAvailability(item)}
            href={`/launch/${item.product.key.toLowerCase()}`}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Ask your company admin to grant you a product role."
          icon={<GridIcon />}
        />
      ) : null}
    </>
  );
}
