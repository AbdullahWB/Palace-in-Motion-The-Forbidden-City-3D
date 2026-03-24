"use client";

import { exploreHotspots } from "@/data/explore";
import { useAppStore } from "@/store/use-app-store";
import { HotspotMarker } from "@/features/explore/hotspot-marker";

export function HotspotLayer() {
  const selectedExploreHotspotId = useAppStore(
    (state) => state.selectedExploreHotspotId
  );
  const setSelectedExploreHotspotId = useAppStore(
    (state) => state.setSelectedExploreHotspotId
  );

  return (
    <group>
      {exploreHotspots.map((hotspot) => (
        <HotspotMarker
          key={hotspot.id}
          hotspot={hotspot}
          isSelected={selectedExploreHotspotId === hotspot.id}
          onSelect={setSelectedExploreHotspotId}
        />
      ))}
    </group>
  );
}
