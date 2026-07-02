import { cookies } from "next/headers";
import { AppShell } from "@/components/shell/app-shell";
import { getProductAccess } from "@/lib/access";
import { getCurrentSession } from "@/lib/session";
import { initials } from "@/lib/format";

// Admin pages always reflect live tenant data — never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, products, cookieStore] = await Promise.all([
    getCurrentSession(),
    getProductAccess(),
    cookies(),
  ]);

  // Highest-signal role for the profile menu: the user's most common
  // platform-wide role name (all seeded access is Platform Admin today).
  const roleNames = session.user.productRoles.map((pr) => pr.role.name);
  const role = roleNames[0] ?? "Member";

  return (
    <AppShell
      company={{
        name: session.company.name,
        subdomain: session.company.subdomain,
      }}
      user={{
        name: `${session.user.firstName} ${session.user.lastName}`,
        email: session.user.email,
        initials: initials(session.user.firstName, session.user.lastName),
        role,
        companyName: session.company.name,
      }}
      products={products}
      initialCollapsed={cookieStore.get("bsky_sidebar")?.value === "collapsed"}
    >
      {children}
    </AppShell>
  );
}
