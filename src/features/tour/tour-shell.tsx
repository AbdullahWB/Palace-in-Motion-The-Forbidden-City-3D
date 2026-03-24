"use client";

import { tourStops } from "@/data/tour";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

export function TourShell() {
  const selectedTourStopId = useAppStore((state) => state.selectedTourStopId);
  const setSelectedTourStopId = useAppStore(
    (state) => state.setSelectedTourStopId
  );

  const activeStop =
    tourStops.find((stop) => stop.id === selectedTourStopId) ?? tourStops[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <aside className="paper-panel rounded-[1.8rem] border border-border p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
          Tour stops
        </p>
        <div className="mt-4 space-y-3">
          {tourStops.map((stop, index) => {
            const isActive = stop.id === activeStop.id;

            return (
              <button
                key={stop.id}
                type="button"
                onClick={() => setSelectedTourStopId(stop.id)}
                className={cn(
                  "w-full rounded-[1.35rem] border p-4 text-left",
                  isActive
                    ? "border-accent/25 bg-accent/10"
                    : "border-border bg-white/80 hover:bg-white"
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                  Stop {index + 1}
                </p>
                <p className="mt-2 font-display text-2xl text-foreground">
                  {stop.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {stop.zoneLabel}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="grid gap-6">
        <div className="paper-panel rounded-[1.8rem] border border-border p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Active stop
          </p>
          <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
            {activeStop.title}
          </h2>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-soft">
            {activeStop.zoneLabel}
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
            {activeStop.summary}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.7rem] border border-border bg-white/85 p-6 shadow-[0_18px_50px_rgba(74,37,28,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
              Future AI guide seam
            </p>
            <h3 className="mt-3 font-display text-3xl text-foreground">
              Cultural interpretation placeholder
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              This block is reserved for future guide narration, multilingual
              interpretation, and question-answer flows linked to the current
              stop context.
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-border bg-white/85 p-6 shadow-[0_18px_50px_rgba(74,37,28,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
              Future synchronization seam
            </p>
            <h3 className="mt-3 font-display text-3xl text-foreground">
              Camera and scene cues
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              Later work can bind this narrative state to camera paths, spatial
              annotations, subtitles, and layered archival media without
              changing the page structure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
