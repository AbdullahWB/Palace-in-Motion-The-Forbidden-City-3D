"use client";

import { exploreZones } from "@/data/explore";
import { useAppStore } from "@/store/use-app-store";
import { ZoneMarker } from "@/features/explore/zone-marker";

export function ZoneLayer() {
  const selectedExploreZoneId = useAppStore(
    (state) => state.selectedExploreZoneId
  );
  const setSelectedExploreZoneId = useAppStore(
    (state) => state.setSelectedExploreZoneId
  );

  return (
    <group>
      {exploreZones.map((zone) => (
        <ZoneMarker
          key={zone.id}
          zone={zone}
          isSelected={selectedExploreZoneId === zone.id}
          onSelect={setSelectedExploreZoneId}
        />
      ))}
    </group>
  );
}
