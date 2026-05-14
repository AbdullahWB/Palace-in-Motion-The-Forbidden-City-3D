"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PageContainer } from "@/components/layout/page-container";
import { ThemeToggleButton } from "@/components/preferences/theme-toggle-button";
import { APP_NAME } from "@/lib/constants";
import { appRoutes, isImmersiveShellPathname } from "@/lib/app-routes";
import { useAppStore } from "@/store/use-app-store";

export function SiteHeader() {
  const pathname = usePathname();
  const isNavOpen = useAppStore((state) => state.isNavOpen);
  const setNavOpen = useAppStore((state) => state.setNavOpen);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname, setNavOpen]);

  if (isImmersiveShellPathname(pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <PageContainer>
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href={appRoutes.home} className="min-w-0" aria-label={`${APP_NAME} home`}>
            <p className="font-display text-2xl leading-none text-foreground md:text-3xl">
              {APP_NAME}
            </p>
            <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.26em] text-accent-soft">
              全景故宫 panorama route
            </p>
          </Link>

          <div className="flex items-center gap-3">
            <MainNav pathname={pathname} />
            <ThemeToggleButton />
            <button
              type="button"
              onClick={() => setNavOpen(!isNavOpen)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-white/78 px-4 py-2 text-sm font-semibold text-foreground md:hidden"
              aria-expanded={isNavOpen}
              aria-controls="mobile-nav"
              aria-label={isNavOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isNavOpen ? (
                <X className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {isNavOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </PageContainer>

      <div id="mobile-nav">
        <MobileNav
          pathname={pathname}
          isOpen={isNavOpen}
          onNavigate={() => setNavOpen(false)}
        />
      </div>
    </header>
  );
}
