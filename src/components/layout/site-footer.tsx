"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { DemoBadgePanel } from "@/components/ui/demo-badge-panel";
import { footerThemes } from "@/data/landing";
import { navigationItems } from "@/data/navigation";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function SiteFooter() {
  const pathname = usePathname();

  if (
    pathname === "/" ||
    pathname === "/selfie" ||
    pathname === "/explore" ||
    pathname === "/companion" ||
    pathname === "/3d-view"
  ) {
    return null;
  }

  return (
    <footer className="mt-16 border-t border-border/80 bg-surface/70">
      <PageContainer className="py-8 md:py-10">
        <div className="paper-panel rounded-[2rem] border border-border/80 p-6 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_22rem]">
            <div>
              <p className="font-display text-4xl leading-none text-foreground">
                {APP_NAME}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Immersive route
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                {APP_DESCRIPTION}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                {APP_TAGLINE}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                  Demo routes
                </p>
                <nav aria-label="Footer links" className="mt-4">
                  <ul className="space-y-3 text-sm text-muted">
                    {navigationItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          prefetch={item.href === "/3d-view" ? false : undefined}
                          className="font-semibold text-foreground hover:text-accent"
                        >
                          {item.label}
                        </Link>
                        <p className="mt-1 leading-6">{item.description}</p>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                  Cultural themes
                </p>
                <div className="mt-4 space-y-3">
                  {footerThemes.map((theme) => (
                    <article
                      key={theme.label}
                      className="rounded-[1.2rem] border border-accent/12 bg-white/70 p-4"
                    >
                      <h2 className="font-display text-2xl leading-tight text-foreground">
                        {theme.label}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {theme.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <DemoBadgePanel compact />
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
