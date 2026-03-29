import Link from "next/link";
import { navigationItems } from "@/data/navigation";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  pathname: string;
  isOpen: boolean;
  onNavigate: () => void;
};

export function MobileNav({ pathname, isOpen, onNavigate }: MobileNavProps) {
  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "overflow-hidden transition-[max-height,opacity] duration-300 md:hidden",
        isOpen ? "max-h-[32rem] opacity-100" : "pointer-events-none max-h-0 opacity-0"
      )}
    >
      <div className="border-t border-border/80 bg-surface/95 px-6 py-5 backdrop-blur">
        <nav aria-label="Mobile primary">
          <ul className="space-y-3">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block rounded-[1.3rem] border px-4 py-4",
                      isActive
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-white/78 hover:border-accent/15 hover:bg-white"
                    )}
                  >
                    <p className={cn("font-semibold", isActive ? "text-white" : "text-foreground")}>
                      {item.label}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-sm leading-6",
                        isActive ? "text-white/80" : "text-muted"
                      )}
                    >
                      {item.description}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
