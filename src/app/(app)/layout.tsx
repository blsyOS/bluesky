import { cookies } from "next/headers";
import { AppShell } from "@/components/shell/app-shell";
import { ProductContextProvider } from "@/components/shell/product-context";
import { getCurrentSession } from "@/lib/session";
import { initials } from "@/lib/format";
import { DEFAULT_PRODUCT_ID, PRODUCT_COOKIE } from "@/lib/products";

// Admin pages always reflect live tenant data — never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([
    getCurrentSession(),
    cookies(),
  ]);

  // Highest-signal role for the profile menu: the user's most common
  // platform-wide role name (all seeded access is Platform Admin today).
  const roleNames = session.user.productRoles.map((pr) => pr.role.name);
  const role = roleNames[0] ?? "Member";

  return (
    <ProductContextProvider
      initialProductId={
        cookieStore.get(PRODUCT_COOKIE)?.value ?? DEFAULT_PRODUCT_ID
      }
    >
      <AppShell
        company={{
          name: session.company.name,
          subdomain: session.company.subdomain,
          logoUrl: session.company.logoUrl,
        }}
        user={{
          name: `${session.user.firstName} ${session.user.lastName}`,
          email: session.user.email,
          initials: initials(session.user.firstName, session.user.lastName),
          role,
          companyName: session.company.name,
        }}
        access={{
          organization: session.hasPermission("company.manage"),
          platform: session.hasPermission("platform.manage"),
        }}
        initialCollapsed={cookieStore.get("bsky_sidebar")?.value === "collapsed"}
      >
        {children}
      </AppShell>
    </ProductContextProvider>
  );
}
