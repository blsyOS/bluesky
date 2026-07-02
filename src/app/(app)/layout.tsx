import { AppShell } from "@/components/shell/app-shell";

// Admin pages always reflect live tenant data — never prerender at build time.
export const dynamic = "force-dynamic";
import { getProductAccess } from "@/lib/access";
import { getCurrentSession } from "@/lib/session";
import { initials } from "@/lib/format";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, products] = await Promise.all([
    getCurrentSession(),
    getProductAccess(),
  ]);

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
      }}
      products={products}
    >
      {children}
    </AppShell>
  );
}
