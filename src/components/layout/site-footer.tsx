import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { navigationItems } from "@/data/navigation";
import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/80 bg-surface/70">
      <PageContainer className="py-8 md:py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="font-display text-3xl text-foreground">{APP_NAME}</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Scaffolded for a medium-sized experience: immersive exploration,
              guided storytelling, and future AI interpretation layers without
              premature backend complexity.
            </p>
          </div>

          <nav aria-label="Footer links">
            <ul className="flex flex-wrap gap-4 text-sm font-medium text-muted">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </PageContainer>
    </footer>
  );
}
