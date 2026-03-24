import Link from "next/link";
import type { AppRoute } from "@/types/content";
import { cn } from "@/lib/utils";

type InfoCardProps = {
  title: string;
  description: string;
  href?: AppRoute;
  className?: string;
};

export function InfoCard({
  title,
  description,
  href,
  className,
}: InfoCardProps) {
  const content = (
    <>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
          Scaffold route
        </p>
        <h2 className="font-display text-3xl text-foreground">{title}</h2>
        <p className="text-sm leading-7 text-muted">{description}</p>
      </div>
      {href ? (
        <span className="inline-flex text-sm font-semibold text-accent">
          Open route
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <article
        className={cn(
          "paper-panel flex h-full flex-col justify-between rounded-[1.7rem] border border-border p-6",
          className
        )}
      >
        {content}
      </article>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "paper-panel group flex h-full flex-col justify-between rounded-[1.7rem] border border-border p-6 hover:-translate-y-1",
        className
      )}
    >
      {content}
    </Link>
  );
}
