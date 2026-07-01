"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { appConfig } from "@/config/app";
import { bottomNavRoutes, mainRoutes } from "@/routes/navigation";
import { Logo } from "@/components/layout/logo";
import { PwaLifecycle } from "@/components/layout/pwa-lifecycle";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <PwaLifecycle />
      <header className="sticky top-0 z-20 -mx-4 border-b border-brand-border/80 bg-brand-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Logo />
          <nav
            aria-label="Primary navigation"
            className="hidden max-w-3xl flex-wrap items-center justify-end gap-1 xl:flex"
          >
            {mainRoutes.map((route) => {
              const active = pathname === route.href;
              return (
                <Link
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-brand-primary text-brand-mint"
                      : "text-brand-muted hover:bg-white hover:text-brand-primary"
                  }`}
                  href={route.href}
                  key={route.href}
                >
                  {route.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 py-6">{children}</main>

      <footer className="mt-4 rounded-xl border border-brand-border bg-white p-4 text-xs leading-5 text-brand-muted">
        {appConfig.disclaimer}
      </footer>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-border bg-white/95 px-2 py-2 shadow-[0_-10px_30px_rgba(15,110,86,0.12)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {bottomNavRoutes.map((route) => {
            const Icon = route.icon;
            const active = pathname === route.href;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center rounded-lg text-[11px] font-semibold transition ${
                  active
                    ? "bg-brand-primary text-brand-mint"
                    : "text-brand-muted hover:bg-brand-neutral"
                }`}
                href={route.href}
                key={route.href}
              >
                <Icon aria-hidden="true" size={19} />
                <span className="mt-1">{route.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
