"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BuildingIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon,
} from "@/components/icons";
import { Logo, LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AutoBreadcrumbs } from "@/components/shell/breadcrumbs";
import { SearchLauncher } from "@/components/search/search-launcher";
import { NotificationLauncher } from "@/components/notifications/notification-launcher";
import { useProductContext } from "@/components/shell/product-context";
import { UserMenu, type MenuUser } from "@/components/shell/user-menu";
import {
  adminSectionsFor,
  DEFAULT_PRODUCT_ID,
  productRegistry,
  resolveSidebar,
  type AdminAccess,
} from "@/lib/products";
import { setPreferenceCookie } from "@/lib/cookies";
import { accentStyle } from "@/lib/accents";
import { cn } from "@/lib/cn";

export type ShellCompany = {
  name: string;
  subdomain: string;
  /** Company branding: shown in the company card when set (BO-02.01A). */
  logoUrl?: string | null;
};

const SIDEBAR_COOKIE = "bsky_sidebar";

export function AppShell({
  company,
  user,
  access,
  initialCollapsed = false,
  children,
}: {
  company: ShellCompany;
  user: MenuUser;
  /** Which admin scopes this user may see (from server-side permissions). */
  access: AdminAccess;
  /** Server-read cookie value, so SSR renders the persisted state without a flash. */
  initialCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  // Product switching lives in Settings → Product Context; the shell only
  // reads the active product to build its sidebar.
  const { activeProductId } = useProductContext();

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    setPreferenceCookie(SIDEBAR_COOKIE, next ? "collapsed" : "expanded");
  }

  // The sidebar is generated entirely from the active product's config —
  // no hardcoded module nav. Admin sections (Organization and, for BlueSky
  // platform admins only, Platform) are appended per the user's access.
  const activeProductConfig =
    productRegistry.get(activeProductId) ??
    productRegistry.get(DEFAULT_PRODUCT_ID)!;
  const navSections = resolveSidebar(
    activeProductConfig,
    adminSectionsFor(access)
  );

  // The shell subtly adopts the active product's accent (active nav bar,
  // highlights); the platform context stays on the neutral brand color.
  const shellStyle = activeProductConfig.accentKey
    ? accentStyle(activeProductConfig.accentKey)
    : undefined;

  const productNames = Object.fromEntries(
    productRegistry.list().map((p) => [p.id, p.name])
  );

  // `inDrawer` renders the always-expanded variant used by the mobile drawer.
  const sidebarContent = (inDrawer: boolean) => {
    const slim = collapsed && !inDrawer;
    return (
      <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div
          className={cn(
            "flex h-16 items-center",
            slim ? "justify-center px-2" : "justify-between px-5"
          )}
        >
          <Link
            href="/dashboard"
            className="text-foreground"
            aria-label="BlueSky OS dashboard"
          >
            {slim ? <LogoMark /> : <Logo />}
          </Link>
          {inDrawer ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex size-11 items-center justify-center rounded-lg text-sidebar-muted hover:bg-sidebar-hover hover:text-foreground"
              aria-label="Close navigation"
            >
              <XIcon className="size-5" />
            </button>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-active shadow-card",
            slim ? "mx-2 justify-center px-2 py-2.5" : "mx-4 px-3 py-2.5"
          )}
          title={`${company.name} · ${company.subdomain}.blueskyos.app`}
        >
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external, admin-provided logo URL
            <img
              src={company.logoUrl}
              alt=""
              aria-hidden
              className="size-5 shrink-0 rounded object-contain"
            />
          ) : (
            <BuildingIcon className="size-4.5 shrink-0 text-sidebar-muted" />
          )}
          {!slim ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {company.name}
              </p>
              <p className="truncate text-xs text-sidebar-muted">
                {company.subdomain}.blueskyos.app
              </p>
            </div>
          ) : null}
        </div>

        {/* Read-only active product context. Switching happens under
            Administration → Settings → Product Context. */}
        <div
          className={cn(
            "mt-2 flex items-center gap-2.5",
            slim ? "mx-2 justify-center px-2 py-1" : "mx-4 px-3 py-1"
          )}
          title={`Active product: ${activeProductConfig.name}`}
        >
          <span
            aria-hidden
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-accent text-white"
          >
            <activeProductConfig.icon className="size-3.5" />
          </span>
          {!slim ? (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {activeProductConfig.name}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-sidebar-muted">
                Active product
              </p>
            </div>
          ) : null}
        </div>

        <nav
          aria-label="Main"
          className={cn(
            "mt-3 flex-1 overflow-y-auto pb-4",
            slim ? "px-2" : "px-3"
          )}
        >
          {navSections.map((section) => (
            <div key={section.label} className="mt-4 first:mt-1">
              {slim ? (
                <div
                  aria-hidden
                  className="mx-2 mb-2 border-t border-sidebar-border first:hidden"
                />
              ) : (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-muted">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      aria-current={active ? "page" : undefined}
                      aria-label={slim ? item.label : undefined}
                      title={slim ? item.label : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                        slim ? "justify-center px-0" : "px-3 py-2",
                        active
                          ? "bg-sidebar-active text-foreground shadow-card ring-1 ring-sidebar-border"
                          : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-md text-white transition-colors",
                          active ? "bg-accent" : "bg-accent/80"
                        )}
                      >
                        <item.icon className="size-3.5" />
                      </span>
                      {!slim ? item.label : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {!inDrawer ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "mx-2 mb-2 flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform",
                collapsed ? "-rotate-90" : "rotate-90"
              )}
            />
            {!collapsed ? "Collapse" : null}
          </button>
        ) : null}

        <div
          className={cn(
            "border-t border-sidebar-border",
            slim ? "flex justify-center p-3" : "p-4"
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
              title={`${user.name} · ${user.email}`}
            >
              {user.initials}
            </span>
            {!slim ? (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-sidebar-muted">
                    {user.role}
                  </p>
                </div>
                <Link
                  href="/login"
                  className="text-xs text-sidebar-muted hover:text-foreground"
                  title="Sign out"
                >
                  Sign out
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "min-h-dvh transition-[padding] duration-200",
        collapsed ? "lg:pl-19" : "lg:pl-72"
      )}
      style={shellStyle}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden overflow-hidden transition-[width] duration-200 lg:block",
          collapsed ? "w-19" : "w-72"
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile drawer — always mounted so open/close animates */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", !drawerOpen && "pointer-events-none")}
        aria-hidden={!drawerOpen}
        {...(!drawerOpen ? { inert: true } : {})}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-200",
            drawerOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
        <aside
          aria-label="Navigation drawer"
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-overlay transition-transform duration-200 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent(true)}
        </aside>
      </div>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-1 border-b border-border bg-surface/90 px-3 backdrop-blur sm:gap-2 sm:px-6">
          {/* Left: mobile menu + breadcrumbs */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon className="size-5" />
          </button>
          <AutoBreadcrumbs productNames={productNames} className="min-w-0" />

          {/* Center: global search / command palette */}
          <div
            className="flex flex-1 items-center justify-end sm:justify-center sm:px-4"
            data-slot="search"
          >
            <SearchLauncher />
          </div>

          {/* Right: notifications, theme, profile. */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <NotificationLauncher />
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>

        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
