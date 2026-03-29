import Link from "next/link";
import { navigationItems } from "@/data/navigation";
import { cn } from "@/lib/utils";

type MainNavProps = {
  pathname: string;
};

export function MainNav({ pathname }: MainNavProps) {
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-full border px-4 py-2 text-sm font-semibold",
                  isActive
                    ? "border-accent bg-accent text-white shadow-[0_12px_28px_rgba(138,34,48,0.18)]"
                    : "border-border/80 bg-white/78 text-foreground/82 hover:border-accent/15 hover:bg-white hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
