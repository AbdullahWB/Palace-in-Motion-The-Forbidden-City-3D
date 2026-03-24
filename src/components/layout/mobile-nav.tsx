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
      className={cn(
        "overflow-hidden transition-[max-height,opacity] duration-300 md:hidden",
        isOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
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
                    className={cn(
                      "block rounded-[1.3rem] border px-4 py-4",
                      isActive
                        ? "border-accent/30 bg-accent/10"
                        : "border-border bg-white/70"
                    )}
                  >
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
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
