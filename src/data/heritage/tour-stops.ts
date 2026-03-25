import { getExploreZoneById } from "@/data/explore";
import { siteOverview } from "@/data/heritage/site-overview";
import type {
  ExploreCameraStop,
  HeritageZoneId,
  TourStopDefinition,
} from "@/types/content";

function requireZoneCameraStop(zoneId: HeritageZoneId): ExploreCameraStop {
  const zone = getExploreZoneById(zoneId);

  if (!zone) {
    throw new Error(`Missing explore zone for tour stop: ${zoneId}`);
  }

  return zone.cameraStop;
}

const introCameraStop: ExploreCameraStop = {
  position: [12.4, 7.4, 14.8],
  target: [0, 2.1, -1.3],
  fov: 30,
};

const summaryCameraStop: ExploreCameraStop = {
  position: [10.4, 5.9, 5.8],
  target: [0, 2.2, -2.8],
  fov: 31,
};

export const tourStopDefinitions: TourStopDefinition[] = [
  {
    id: "central-axis-introduction",
    kind: "intro",
    title: "Introduction to the central axis",
    explanation: siteOverview.tourIntro,
    cameraStop: introCameraStop,
    focusZoneId: null,
  },
  {
    id: "meridian-gate",
    kind: "zone",
    focusZoneId: "meridian-gate",
    cameraStop: requireZoneCameraStop("meridian-gate"),
  },
  {
    id: "taihe-gate",
    kind: "zone",
    focusZoneId: "taihe-gate",
    cameraStop: requireZoneCameraStop("taihe-gate"),
  },
  {
    id: "hall-of-supreme-harmony",
    kind: "zone",
    focusZoneId: "hall-of-supreme-harmony",
    cameraStop: requireZoneCameraStop("hall-of-supreme-harmony"),
  },
  {
    id: "outer-to-inner-court-meaning",
    kind: "meaning",
    title: "Outer Court to Inner Court meaning",
    explanation:
      "Beyond the great terraces, the axis narrows and the spatial register changes. The route prepares a movement from public ritual toward more intimate court life.",
    focusZoneId: "inner-court-threshold",
    cameraStop: requireZoneCameraStop("inner-court-threshold"),
  },
  {
    id: "tour-summary",
    kind: "summary",
    title: "Summary",
    explanation: siteOverview.completionSummary,
    cameraStop: summaryCameraStop,
    focusZoneId: null,
  },
];
