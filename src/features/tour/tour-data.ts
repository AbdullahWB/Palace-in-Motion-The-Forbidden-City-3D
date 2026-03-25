import { getExploreZoneById } from "@/data/explore";
import type { ExploreCameraStop, ExploreZone } from "@/types/content";

export type TourStepKind = "intro" | "zone" | "meaning" | "summary";

export type TourStep = {
  id: string;
  title: string;
  explanation: string;
  cameraStop: ExploreCameraStop;
  focusZoneId?: ExploreZone["id"] | null;
  kind: TourStepKind;
};

function requireZone(zoneId: ExploreZone["id"]) {
  const zone = getExploreZoneById(zoneId);

  if (!zone) {
    throw new Error(`Missing explore zone for guided tour step: ${zoneId}`);
  }

  return zone;
}

const meridianGate = requireZone("meridian-gate");
const taiheGate = requireZone("taihe-gate");
const hallOfSupremeHarmony = requireZone("hall-of-supreme-harmony");
const innerCourtThreshold = requireZone("inner-court-threshold");

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

export const tourSteps: TourStep[] = [
  {
    id: "central-axis-introduction",
    title: "Introduction to the central axis",
    explanation:
      "Begin with the ceremonial spine: gates, terraces, and halls align into a controlled north-south route rather than a loose field of buildings.",
    cameraStop: introCameraStop,
    focusZoneId: null,
    kind: "intro",
  },
  {
    id: meridianGate.id,
    title: meridianGate.title,
    explanation:
      "Meridian Gate establishes entry, scale, and procession. The visitor crosses from city fabric into the first formal threshold of imperial space.",
    cameraStop: meridianGate.cameraStop,
    focusZoneId: meridianGate.id,
    kind: "zone",
  },
  {
    id: taiheGate.id,
    title: taiheGate.title,
    explanation:
      "Taihe Gate compresses and then releases movement, clarifying that each threshold along the axis intensifies ceremonial hierarchy.",
    cameraStop: taiheGate.cameraStop,
    focusZoneId: taiheGate.id,
    kind: "zone",
  },
  {
    id: hallOfSupremeHarmony.id,
    title: hallOfSupremeHarmony.title,
    explanation:
      "The Hall of Supreme Harmony dominates the outer court through elevation, breadth, and frontal symmetry, turning the axis into ritual theater.",
    cameraStop: hallOfSupremeHarmony.cameraStop,
    focusZoneId: hallOfSupremeHarmony.id,
    kind: "zone",
  },
  {
    id: "outer-to-inner-court-meaning",
    title: "Outer Court to Inner Court meaning",
    explanation:
      "Beyond the ceremonial climax, the axis tightens. Grand state ritual gives way to a more inward register that prepares the transition toward court life.",
    cameraStop: innerCourtThreshold.cameraStop,
    focusZoneId: innerCourtThreshold.id,
    kind: "meaning",
  },
  {
    id: "tour-summary",
    title: "Summary",
    explanation:
      "Read together, the sequence reveals axial symmetry, layered thresholds, and a carefully staged shift from public ceremony to inner court intimacy.",
    cameraStop: summaryCameraStop,
    focusZoneId: null,
    kind: "summary",
  },
];
