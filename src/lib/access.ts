import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export type ProductAccess = {
  product: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    status: string;
    accentColor: string | null;
  };
  licenseStatus: string | null; // CompanyProduct.status, null if never licensed
  enabledForCompany: boolean;
  userHasAccess: boolean;
  /** Enabled for the company, user has a role, and the product itself is live. */
  launchable: boolean;
};

/**
 * Resolves every visible product against the current company's licenses and
 * the current user's product roles. Drives the product switcher: a product
 * is launchable only when the company licenses it AND the user holds a role
 * on it AND the product is generally available.
 */
export async function getProductAccess(): Promise<ProductAccess[]> {
  const session = await getCurrentSession();

  const products = await db.product.findMany({
    where: { status: { not: "hidden" } },
    orderBy: { createdAt: "asc" },
    include: {
      companies: { where: { companyId: session.company.id } },
    },
  });

  const userProductIds = new Set(
    session.user.productRoles.map((pr) => pr.productId)
  );

  return products.map((p) => {
    const license = p.companies[0] ?? null;
    const enabledForCompany =
      license?.status === "active" || license?.status === "trial";
    const userHasAccess = userProductIds.has(p.id);
    return {
      product: {
        id: p.id,
        key: p.key,
        name: p.name,
        description: p.description,
        status: p.status,
        accentColor: p.accentColor,
      },
      licenseStatus: license?.status ?? null,
      enabledForCompany,
      userHasAccess,
      launchable: enabledForCompany && userHasAccess && p.status === "active",
    };
  });
}
