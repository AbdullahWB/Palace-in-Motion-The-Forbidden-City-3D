"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

type DemoBadgePanelProps = {
  title?: string;
  description?: string;
  compact?: boolean;
  announce?: boolean;
  className?: string;
};

export function DemoBadgePanel({
  title = "Competition demo badge",
  description = "Complete the Explore route and generate a souvenir postcard inside Explore to unlock the final submission badge.",
  compact = false,
  announce = false,
  className,
}: DemoBadgePanelProps) {
  const hasCompletedTour = useAppStore((state) => state.hasCompletedTour);
  const hasGeneratedPostcard = useAppStore((state) => state.hasGeneratedPostcard);

  const milestones = [
    {
      id: "tour",
      label: "Explore route completed",
      isDone: hasCompletedTour,
    },
    {
      id: "postcard",
      label: "Postcard generated",
      isDone: hasGeneratedPostcard,
    },
  ];

  const completedCount = milestones.filter((milestone) => milestone.isDone).length;
  const progress = (completedCount / milestones.length) * 100;
  const isUnlocked = completedCount === milestones.length;
  const statusLabel = isUnlocked
    ? "Unlocked"
    : completedCount > 0
      ? `${completedCount} of ${milestones.length} complete`
      : "Locked";

  return (
    <section
      aria-live={announce ? "polite" : undefined}
      className={cn(
        "rounded-[1.45rem] border border-accent/15 bg-accent/8 p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            {title}
          </p>
          {!compact ? (
            <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
          ) : null}
        </div>

        <span
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
            isUnlocked
              ? "border-accent/30 bg-white/80 text-accent"
              : "border-accent/15 bg-white/68 text-accent-soft"
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-accent/10">
        <div
          role="progressbar"
          aria-label="Competition demo badge progress"
          aria-valuemin={0}
          aria-valuemax={milestones.length}
          aria-valuenow={completedCount}
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={cn("mt-4 grid gap-3", compact ? "sm:grid-cols-2" : "")}>
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={cn(
              "rounded-[1.1rem] border px-4 py-3",
              milestone.isDone
                ? "border-accent/20 bg-white/74"
                : "border-accent/10 bg-white/52"
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
              {milestone.isDone ? "Complete" : "Pending"}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {milestone.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
