import Link from "next/link";
import { demoFlowSteps } from "@/data/landing";
import { cn } from "@/lib/utils";
import type { AppRoute, DemoFlowStepId } from "@/types/content";

type DemoFlowRailProps = {
  currentStep: DemoFlowStepId;
  nextLabel: string;
  nextHref?: AppRoute | null;
  className?: string;
};

export function DemoFlowRail({
  currentStep,
  nextLabel,
  nextHref = null,
  className,
}: DemoFlowRailProps) {
  const currentIndex = demoFlowSteps.findIndex((step) => step.id === currentStep);

  return (
    <section
      className={cn(
        "paper-panel rounded-[1.55rem] border border-border/80 p-4 md:p-5",
        className
      )}
      aria-label="Demo flow"
    >
      <div className="flex flex-wrap gap-3">
        {demoFlowSteps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isPast = currentIndex > -1 && index < currentIndex;

          return (
            <div
              key={step.id}
              className={cn(
                "min-w-[11rem] flex-1 rounded-[1.2rem] border px-4 py-3",
                isCurrent
                  ? "border-accent/25 bg-accent text-white"
                  : isPast
                    ? "border-accent/15 bg-accent/8"
                    : "border-border bg-white/80"
              )}
            >
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.22em]",
                  isCurrent ? "text-white/76" : "text-accent-soft"
                )}
              >
                Step {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-semibold">{step.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-accent">Next recommended:</span>
        {nextHref ? (
          <Link href={nextHref} className="font-medium text-foreground underline decoration-accent/30 underline-offset-4">
            {nextLabel}
          </Link>
        ) : (
          <span className="text-muted">{nextLabel}</span>
        )}
      </div>
    </section>
  );
}
