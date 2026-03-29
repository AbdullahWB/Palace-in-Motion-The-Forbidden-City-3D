"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QuickFactList } from "@/components/ui/quick-fact-list";
import { cn } from "@/lib/utils";
import type { ExploreZone, TourStepKind } from "@/types/content";
import type { TourStep } from "@/features/tour/tour-data";

type TourSidebarProps = {
  steps: TourStep[];
  activeIndex: number;
  activeZone: ExploreZone | null;
  onStepSelect: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
};

function formatCourtLabel(court: "outer" | "inner-threshold") {
  return court === "outer" ? "Outer Court" : "Inner Court Threshold";
}

function formatKindLabel(kind: TourStepKind) {
  switch (kind) {
    case "intro":
      return "Orientation";
    case "meaning":
      return "Interpretation";
    case "summary":
      return "Closing";
    default:
      return "Zone focus";
  }
}

export function TourSidebar({
  steps,
  activeIndex,
  activeZone,
  onStepSelect,
  onNext,
  onPrevious,
}: TourSidebarProps) {
  const activeStep = steps[activeIndex];
  const progress = ((activeIndex + 1) / steps.length) * 100;
  const isFirstStep = activeIndex === 0;
  const isLastStep = activeIndex === steps.length - 1;
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <aside className="paper-panel h-fit rounded-[1.85rem] border border-border/85 p-6 md:p-7 xl:sticky xl:top-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Guided walkthrough
          </p>
          <h2 className="mt-3 font-display text-3xl text-foreground">
            {activeStep.title}
          </h2>
        </div>

        <span className="rounded-full border border-accent/15 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
          Step {activeIndex + 1} / {steps.length}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-accent/10">
        <div
          role="progressbar"
          aria-label="Guided tour progress"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={activeIndex + 1}
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft"
          style={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeStep.id}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <div className="mt-6 rounded-[1.45rem] border border-accent/15 bg-accent/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
              {formatKindLabel(activeStep.kind)}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {activeStep.explanation}
            </p>

            {activeZone ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-accent/15 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
                  {formatCourtLabel(activeZone.court)}
                </span>
                <span className="rounded-full border border-accent/15 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
                  {activeZone.shortLabel}
                </span>
              </div>
            ) : null}
          </div>

          <QuickFactList facts={activeStep.quickFacts} className="mt-6" />
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 space-y-3">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepSelect(index)}
              aria-pressed={isActive}
              className={cn(
                "w-full rounded-[1.3rem] border p-4 text-left",
                isActive
                  ? "border-accent/25 bg-accent/10"
                  : "border-border bg-white/80 hover:bg-white"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Step {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-display text-2xl text-foreground">
                {step.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {formatKindLabel(step.kind)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
          className={cn(
            "inline-flex flex-1 items-center justify-center rounded-full border px-4 py-3 text-sm font-semibold",
            isFirstStep
              ? "cursor-not-allowed border-border bg-white/55 text-muted/60"
              : "border-border bg-white/82 text-foreground hover:-translate-y-0.5 hover:bg-white"
          )}
        >
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-accent bg-accent px-4 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-accent-strong"
        >
          {isLastStep ? "Finish tour" : "Next stop"}
        </button>
      </div>
    </aside>
  );
}
