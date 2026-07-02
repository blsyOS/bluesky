import type { ProductAccess } from "@/lib/access";

export type ProductAvailability = {
  label: "Enabled" | "Trial" | "Disabled" | "Coming soon";
  tone: "success" | "info" | "neutral" | "warning";
};

/**
 * Single source of truth for how a product's licensing state is described
 * in the UI (switcher, product cards, dropdowns). Lives apart from
 * lib/access so client components can import it without pulling the
 * database client into the browser bundle.
 */
export function describeAvailability(item: ProductAccess): ProductAvailability {
  if (item.product.status === "coming_soon")
    return { label: "Coming soon", tone: "warning" };
  if (!item.enabledForCompany) return { label: "Disabled", tone: "neutral" };
  if (item.licenseStatus === "trial") return { label: "Trial", tone: "info" };
  return { label: "Enabled", tone: "success" };
}
