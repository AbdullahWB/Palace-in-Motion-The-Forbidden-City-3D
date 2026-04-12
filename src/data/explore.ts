import { getHotspotContentById } from "@/data/heritage/hotspots";
import type {
  ExploreCameraStop,
  ExploreZone,
  HeritageZoneId,
} from "@/types/content";

type ExploreSpatialData = {
  id: HeritageZoneId;
  markerPosition: [number, number, number];
  axisPosition: number;
  cameraStop: ExploreCameraStop;
};

const exploreSpatialData: ExploreSpatialData[] = [
  {
    id: "meridian-gate",
    markerPosition: [0, 2.5, 7.2],
    axisPosition: 7.2,
    cameraStop: {
      position: [6.8, 4.8, 11.4],
      target: [0, 1.8, 7.2],
      fov: 35,
    },
  },
  {
    id: "taihe-gate",
    markerPosition: [0, 2.6, 2.6],
    axisPosition: 2.6,
    cameraStop: {
      position: [7.2, 4.6, 6.6],
      target: [0, 1.8, 2.6],
      fov: 34,
    },
  },
  {
    id: "hall-of-supreme-harmony",
    markerPosition: [0, 4.4, -2.6],
    axisPosition: -2.6,
    cameraStop: {
      position: [8.2, 6.6, 3.4],
      target: [0, 2.6, -2.6],
      fov: 32,
    },
  },
  {
    id: "inner-court-threshold",
    markerPosition: [0, 2.55, -8.3],
    axisPosition: -8.3,
    cameraStop: {
      position: [6.6, 4.4, -5.4],
      target: [0, 1.9, -8.3],
      fov: 34,
    },
  },
];

export const exploreZones: ExploreZone[] = exploreSpatialData.map((spatialZone) => {
  const content = getHotspotContentById(spatialZone.id);

  if (!content) {
    throw new Error(`Missing hotspot content for explore zone: ${spatialZone.id}`);
  }

  return {
    id: content.id,
    title: content.title,
    shortLabel: content.shortLabel,
    description: content.hotspotDescription,
    sequence: content.sequence,
    court: content.court,
    quickFactIds: content.quickFactIds,
    markerPosition: spatialZone.markerPosition,
    axisPosition: spatialZone.axisPosition,
    cameraStop: spatialZone.cameraStop,
  };
});

export function getExploreZoneById(zoneId: ExploreZone["id"]) {
  return exploreZones.find((zone) => zone.id === zoneId) ?? null;
}

