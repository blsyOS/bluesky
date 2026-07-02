"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ProductAccess } from "@/lib/access";
import {
  BoxesIcon,
  BuildingIcon,
  DashboardIcon,
  MenuIcon,
  ScrollIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProductSwitcher } from "@/components/shell/product-switcher";
import { accentStyle } from "@/lib/accents";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/products", label: "Products", icon: BoxesIcon },
  { href: "/users", label: "Users", icon: UsersIcon },
  { href: "/roles", label: "Roles & Permissions", icon: ShieldIcon },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export type ShellUser = {
  name: string;
  email: string;
  initials: string;
};

export type ShellCompany = {
  name: string;
  subdomain: string;
};

export function AppShell({
  company,
  user,
  products,
  children,
}: {
  company: ShellCompany;
  user: ShellUser;
  products: ProductAccess[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Inside a product workspace the shell subtly adopts that product's
  // accent (active nav bar, highlights). Everywhere else it stays on the
  // neutral brand color.
  const activeProduct = pathname.startsWith("/launch/")
    ? products.find(
        (p) => p.product.key.toLowerCase() === pathname.split("/")[2]
      )
    : undefined;
  const shellStyle = activeProduct
    ? accentStyle(activeProduct.product.key)
    : undefined;

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <Link href="/dashboard" className="text-white">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-sidebar-muted hover:bg-sidebar-hover hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <div className="mx-4 mt-4 flex items-center gap-2.5 rounded-lg bg-sidebar-hover px-3 py-2.5">
        <BuildingIcon className="size-4.5 shrink-0 text-sidebar-muted" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{company.name}</p>
          <p className="truncate text-xs text-sidebar-muted">
            {company.subdomain}.blueskyos.app
          </p>
        </div>
      </div>

      <nav aria-label="Main" className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-white"
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute inset-y-2 left-0 w-0.75 rounded-full bg-accent"
                />
              ) : null}
              <item.icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-sidebar-muted">{user.email}</p>
          </div>
          <Link
            href="/login"
            className="text-xs text-sidebar-muted hover:text-white"
            title="Sign out"
          >
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:pl-72" style={shellStyle}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-overlay">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon className="size-5" />
          </button>
          <ProductSwitcher products={products} />
          {activeProduct ? (
            <span className="hidden items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent sm:inline-flex">
              {activeProduct.product.name}
            </span>
          ) : null}
          <div className="flex-1" />
          <span className="mr-1 hidden max-w-40 truncate text-caption md:block lg:hidden">
            {company.name}
          </span>
          <ThemeToggle />
          <span
            className="ml-1 inline-flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
            title={`${user.name} · ${user.email}`}
          >
            {user.initials}
          </span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
