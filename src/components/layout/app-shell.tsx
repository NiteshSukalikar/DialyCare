"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { appConfig } from "@/config/app";
import { SettingsRepository } from "@/data/repositories";
import { mainRoutes } from "@/routes/navigation";
import { Logo } from "@/components/layout/logo";
import { PwaLifecycle } from "@/components/layout/pwa-lifecycle";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    new SettingsRepository().get().then((settings) => {
      if (cancelled) return;
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = settings.theme === "system" ? (systemDark ? "dark" : "light") : settings.theme;
      document.documentElement.dataset.theme = theme;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
      <PwaLifecycle />
      <header className="sticky top-0 z-20 -mx-4 border-b border-brand-border/80 bg-brand-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <Logo />
            <nav
              aria-label="Primary navigation"
              className="hidden max-w-4xl flex-wrap items-center justify-end gap-1 xl:flex"
            >
              {mainRoutes.map((route) => {
                const active = pathname === route.href;
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-brand-primary text-brand-mint"
                        : "text-brand-muted hover:bg-brand-neutral hover:text-brand-primary"
                    }`}
                    href={route.href}
                    key={route.href}
                  >
                    {route.label}
                  </Link>
                );
              })}
            </nav>
            <button
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-brand-border bg-brand-surface text-brand-ink shadow-sm transition hover:bg-brand-neutral xl:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
            </button>
          </div>
          <nav
            aria-label="Tablet and mobile navigation"
            className="-mx-1 mt-3 flex gap-2 overflow-x-auto pb-1 xl:hidden"
          >
            {mainRoutes.map((route) => {
              const Icon = route.icon;
              const active = pathname === route.href;

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                    active
                      ? "border-brand-primary bg-brand-primary text-brand-mint"
                      : "border-brand-border bg-brand-surface text-brand-muted hover:bg-brand-neutral hover:text-brand-primary"
                  }`}
                  href={route.href}
                  key={route.href}
                >
                  <Icon aria-hidden="true" size={16} />
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

      {menuOpen ? (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] xl:hidden" onClick={() => setMenuOpen(false)} />
      ) : null}

      <aside
        aria-hidden={!menuOpen}
        className={`fixed bottom-0 right-0 top-0 z-40 flex w-[min(22rem,88vw)] flex-col border-l border-brand-border bg-brand-surface shadow-2xl transition-transform duration-200 xl:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        id="mobile-navigation"
      >
        <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-4">
          <Logo />
          <button
            aria-label="Close navigation menu"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-brand-border bg-brand-neutral text-brand-ink"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="grid gap-2 overflow-y-auto p-4">
          {mainRoutes.map((route) => {
            const Icon = route.icon;
            const active = pathname === route.href;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                  active
                    ? "bg-brand-primary text-brand-mint"
                    : "text-brand-muted hover:bg-brand-neutral hover:text-brand-primary"
                }`}
                href={route.href}
                key={route.href}
              >
                <Icon aria-hidden="true" size={19} />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
