import { cn } from "@/lib/utils";
import type { QuickFact } from "@/types/content";

type QuickFactListProps = {
  facts: QuickFact[];
  title?: string;
  className?: string;
};

export function QuickFactList({
  facts,
  title = "Quick facts",
  className,
}: QuickFactListProps) {
  if (!facts.length) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
        {title}
      </p>

      <div className="grid gap-3">
        {facts.map((fact) => (
          <article
            key={fact.id}
            className="rounded-[1.2rem] border border-accent/12 bg-white/70 p-4"
          >
            <h3 className="font-display text-2xl leading-tight text-foreground">
              {fact.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">{fact.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
