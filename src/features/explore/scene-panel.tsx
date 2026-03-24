"use client";

import { exploreHotspots } from "@/data/explore";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

export function ScenePanel() {
  const selectedExploreHotspotId = useAppStore(
    (state) => state.selectedExploreHotspotId
  );
  const setSelectedExploreHotspotId = useAppStore(
    (state) => state.setSelectedExploreHotspotId
  );

  const selectedHotspot =
    exploreHotspots.find((hotspot) => hotspot.id === selectedExploreHotspotId) ??
    null;

  return (
    <aside className="paper-panel rounded-[1.8rem] border border-border p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
        Scene guide
      </p>
      <h2 className="mt-3 font-display text-3xl text-foreground">
        {selectedHotspot ? selectedHotspot.title : "Select a point of interest"}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        {selectedHotspot
          ? selectedHotspot.description
          : "Click one of the three glowing markers in the scene to inspect a key architectural zone in this first exploration MVP."}
      </p>

      <div className="mt-6 rounded-[1.45rem] border border-accent/15 bg-accent/8 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
          Interactive hotspots
        </p>
        <p className="mt-3 text-sm leading-7 text-muted">
          Orbit around the blockout scene and select a marker to inspect how the
          palace sequence is being mapped into spatial storytelling.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {exploreHotspots.map((hotspot, index) => {
          const isActive = hotspot.id === selectedHotspot?.id;

          return (
            <button
              key={hotspot.id}
              type="button"
              onClick={() => setSelectedExploreHotspotId(hotspot.id)}
              className={cn(
                "w-full rounded-[1.3rem] border p-4 text-left",
                isActive
                  ? "border-accent/25 bg-accent/10"
                  : "border-border bg-white/80 hover:bg-white"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Hotspot 0{index + 1}
              </p>
              <p className="mt-2 font-display text-2xl text-foreground">
                {hotspot.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {hotspot.description}
              </p>
            </button>
          );
        })}
      </div>

      {selectedHotspot ? (
        <button
          type="button"
          onClick={() => setSelectedExploreHotspotId(null)}
          className="mt-5 inline-flex text-sm font-semibold text-accent"
        >
          Clear selection
        </button>
      ) : null}
    </aside>
  );
}
