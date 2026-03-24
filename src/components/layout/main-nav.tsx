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
                className={cn(
                  "inline-flex rounded-full px-4 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-white"
                    : "text-foreground/80 hover:bg-white/70 hover:text-foreground"
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
