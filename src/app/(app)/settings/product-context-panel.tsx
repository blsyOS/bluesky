"use client";

import { SettingsPanel } from "@/components/ui/settings-panel";
import { Field, Select } from "@/components/ui/form";
import { useProductContext } from "@/components/shell/product-context";
import { productRegistry } from "@/lib/products";

/**
 * Administration → Settings → Product Context. The only place the active
 * product is switched: selection rebuilds the sidebar from that product's
 * configuration, opens its default dashboard, and persists across reloads.
 */
export function ProductContextPanel() {
  const { activeProductId, switchProduct } = useProductContext();
  const products = productRegistry.list();
  const active = productRegistry.get(activeProductId);

  return (
    <SettingsPanel
      title="Product context"
      description="Choose which BlueSky product this workspace operates in."
    >
      <div className="space-y-4">
        <Field
          label="Active product"
          htmlFor="active-product"
          helper="Switching rebuilds navigation for that product and opens its dashboard."
        >
          <Select
            id="active-product"
            value={activeProductId}
            onChange={(e) => switchProduct(e.target.value)}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </Field>
        {active ? (
          <p className="text-caption">
            Currently active: <span className="font-medium text-foreground">{active.name}</span>.
            The sidebar shows this product&apos;s modules; your
            administration sections stay available.
          </p>
        ) : null}
      </div>
    </SettingsPanel>
  );
}
