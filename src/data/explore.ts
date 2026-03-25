import type { ExploreZone } from "@/types/content";

export const exploreZones: ExploreZone[] = [
  {
    id: "meridian-gate",
    title: "Meridian Gate",
    shortLabel: "Southern threshold",
    description:
      "The formal entry on the central axis establishes procession, orientation, and the first sense of imperial scale.",
    sequence: 1,
    court: "outer",
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
    title: "Taihe Gate",
    shortLabel: "Outer court gateway",
    description:
      "A second threshold compresses and releases movement toward the main ceremonial precinct, clarifying hierarchy along the axis.",
    sequence: 2,
    court: "outer",
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
    title: "Hall of Supreme Harmony",
    shortLabel: "Ceremonial climax",
    description:
      "The dominant hall sits on elevated terraces at the center of the outer court, expressing ritual authority through mass and elevation.",
    sequence: 3,
    court: "outer",
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
    title: "Transition toward the Inner Court",
    shortLabel: "Threshold of intimacy",
    description:
      "Beyond the grand ceremonial core, the axis tightens into a more inward spatial register that prepares the shift toward residential court life.",
    sequence: 4,
    court: "inner-threshold",
    markerPosition: [0, 2.55, -8.3],
    axisPosition: -8.3,
    cameraStop: {
      position: [6.6, 4.4, -5.4],
      target: [0, 1.9, -8.3],
      fov: 34,
    },
  },
];

export function getExploreZoneById(zoneId: ExploreZone["id"]) {
  return exploreZones.find((zone) => zone.id === zoneId) ?? null;
}
