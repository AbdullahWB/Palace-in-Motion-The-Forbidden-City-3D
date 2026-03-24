"use client";

import { exploreZones } from "@/data/explore";
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

  const selectedZone =
    exploreZones.find((zone) => zone.id === selectedExploreZoneId) ?? null;

  return (
    <aside className="paper-panel rounded-[1.8rem] border border-border p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
        Route guide
      </p>

      <h2 className="mt-3 font-display text-3xl text-foreground">
        {selectedZone ? selectedZone.title : "Read the ceremonial sequence"}
      </h2>

      <p className="mt-3 text-sm leading-7 text-muted">
        {selectedZone
          ? selectedZone.description
          : "The scene is organized as a stylized north-south procession: thresholds in the outer court build ceremonial hierarchy before the axis compresses toward the Inner Court."}
      </p>

      <div className="mt-6 rounded-[1.45rem] border border-accent/15 bg-accent/8 p-5">
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
          <p className="mt-3 text-sm leading-7 text-muted">
            Select one of the four markers to inspect its title, court category,
            and future camera-stop metadata target.
          </p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {exploreZones.map((zone) => {
          const isActive = zone.id === selectedZone?.id;

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedExploreZoneId(zone.id)}
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
