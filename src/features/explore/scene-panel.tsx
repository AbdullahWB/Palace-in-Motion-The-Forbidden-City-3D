"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { exploreZones } from "@/data/explore";
import {
  getQuickFactsByIds,
  getSiteQuickFacts,
} from "@/data/heritage/quick-facts";
import { siteOverview } from "@/data/heritage/site-overview";
import { QuickFactList } from "@/components/ui/quick-fact-list";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

function formatCourtLabel(court: "outer" | "inner-threshold") {
  return court === "outer" ? "Outer Court" : "Inner Court Threshold";
}

export function ScenePanel() {
  const selectedExploreZoneId = useAppStore((state) => state.selectedExploreZoneId);
  const setSelectedExploreZoneId = useAppStore(
    (state) => state.setSelectedExploreZoneId
  );
  const reduceMotion = useReducedMotion() ?? false;

  const selectedZone =
    exploreZones.find((zone) => zone.id === selectedExploreZoneId) ?? null;
  const panelQuickFacts = selectedZone
    ? getQuickFactsByIds(selectedZone.quickFactIds)
    : getSiteQuickFacts();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <aside className="paper-panel rounded-[1.8rem] border border-border p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Route guide
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedZone?.id ?? "empty"}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={transition}
            >
              <h2 className="mt-3 font-display text-3xl text-foreground">
                {selectedZone ? selectedZone.title : "Read the ceremonial sequence"}
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted">
                {selectedZone ? selectedZone.description : siteOverview.exploreIntro}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <span className="rounded-full border border-accent/15 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
          {selectedZone ? "Zone active" : "Awaiting selection"}
        </span>
      </div>

      <div className="mt-6 rounded-[1.45rem] border border-accent/15 bg-accent/8 p-5" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
          Structured metadata
        </p>

        {selectedZone ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.1rem] border border-accent/12 bg-white/65 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
                Sequence
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {selectedZone.sequence} / {exploreZones.length}
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-accent/12 bg-white/65 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
                Court
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatCourtLabel(selectedZone.court)}
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-accent/12 bg-white/65 p-3 sm:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
                Label
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {selectedZone.shortLabel}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm leading-7 text-muted">
              Select one of the four markers to inspect how the scene progresses
              from the southern threshold through the outer court and toward the
              inner court transition.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.1rem] border border-accent/12 bg-white/65 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
                  Axis
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Read the north-south procession first.
                </p>
              </div>
              <div className="rounded-[1.1rem] border border-accent/12 bg-white/65 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
                  Symmetry
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Notice how mirrored masses reinforce hierarchy.
                </p>
              </div>
              <div className="rounded-[1.1rem] border border-accent/12 bg-white/65 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
                  Threshold
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Each gate narrows, then releases, the route.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <QuickFactList facts={panelQuickFacts} className="mt-6" />

      <div className="mt-6 space-y-3">
        {exploreZones.map((zone) => {
          const isActive = zone.id === selectedZone?.id;

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedExploreZoneId(zone.id)}
              aria-pressed={isActive}
              className={cn(
                "w-full rounded-[1.3rem] border p-4 text-left",
                isActive
                  ? "border-accent/25 bg-accent/10"
                  : "border-border bg-white/80 hover:bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                    Zone 0{zone.sequence}
                  </p>
                  <p className="mt-2 font-display text-2xl text-foreground">
                    {zone.title}
                  </p>
                </div>
                <span className="rounded-full border border-accent/15 bg-white/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
                  {formatCourtLabel(zone.court)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{zone.shortLabel}</p>
            </button>
          );
        })}
      </div>

      {selectedZone ? (
        <button
          type="button"
          onClick={() => setSelectedExploreZoneId(null)}
          className="mt-5 inline-flex text-sm font-semibold text-accent"
        >
          Clear selection
        </button>
      ) : null}
    </aside>
  );
}
