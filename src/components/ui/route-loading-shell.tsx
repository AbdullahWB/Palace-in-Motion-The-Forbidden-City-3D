import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

type RouteLoadingShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  canvasHeightClassName?: string;
};

export function RouteLoadingShell({
  eyebrow,
  title,
  description,
  canvasHeightClassName = "h-[34rem] xl:h-[42rem]",
}: RouteLoadingShellProps) {
  return (
    <PageContainer className="py-12 md:py-16">
      <section
        aria-busy="true"
        aria-label={`Loading ${title}`}
        className="animate-pulse"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-soft">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-foreground md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted md:text-lg">
            {description}
          </p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_24rem]">
          <div className="paper-panel overflow-hidden rounded-[1.8rem] border border-border">
            <div className="border-b border-border/80 px-5 py-4">
              <div className="h-3 w-40 rounded-full bg-accent/14" />
              <div className="mt-3 h-3 w-80 max-w-full rounded-full bg-accent/10" />
            </div>
            <div className={cn("w-full bg-white/45", canvasHeightClassName)} />
          </div>

          <div className="space-y-6">
            <div className="paper-panel rounded-[1.8rem] border border-border p-6">
              <div className="h-3 w-28 rounded-full bg-accent/14" />
              <div className="mt-4 h-10 w-52 rounded-2xl bg-accent/10" />
              <div className="mt-4 space-y-3">
                <div className="h-3 rounded-full bg-accent/10" />
                <div className="h-3 rounded-full bg-accent/8" />
                <div className="h-3 w-5/6 rounded-full bg-accent/8" />
              </div>
              <div className="mt-6 h-32 rounded-[1.35rem] bg-accent/8" />
            </div>

            <div className="paper-panel rounded-[1.8rem] border border-border p-6">
              <div className="h-3 w-24 rounded-full bg-accent/14" />
              <div className="mt-4 h-10 w-44 rounded-2xl bg-accent/10" />
              <div className="mt-6 h-28 rounded-[1.35rem] bg-accent/8" />
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
