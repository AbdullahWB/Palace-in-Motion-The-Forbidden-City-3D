import { getQuickFactIdsForZone } from "@/data/heritage/quick-facts";
import type { HeritageZoneId, HotspotContent } from "@/types/content";

export const hotspotContent: HotspotContent[] = [
  {
    id: "meridian-gate",
    title: "Meridian Gate",
    shortLabel: "Southern threshold",
    court: "outer",
    sequence: 1,
    hotspotDescription:
      "The formal southern gate fixes orientation on the central axis and frames entry as a ceremonial transition rather than a casual arrival.",
    tourExplanation:
      "Meridian Gate establishes entry, scale, and procession. The visitor crosses from city fabric into the first formal threshold of imperial space.",
    quickFactIds: getQuickFactIdsForZone("meridian-gate"),
  },
  {
    id: "taihe-gate",
    title: "Taihe Gate",
    shortLabel: "Outer court gateway",
    court: "outer",
    sequence: 2,
    hotspotDescription:
      "A second gate compresses movement before releasing it into the main court, clarifying how hierarchy is staged along the axis.",
    tourExplanation:
      "Taihe Gate compresses and then releases movement, clarifying that each threshold along the axis intensifies ceremonial hierarchy.",
    quickFactIds: getQuickFactIdsForZone("taihe-gate"),
  },
  {
    id: "hall-of-supreme-harmony",
    title: "Hall of Supreme Harmony",
    shortLabel: "Ceremonial climax",
    court: "outer",
    sequence: 3,
    hotspotDescription:
      "The dominant hall rises on elevated terraces at the center of the outer court, expressing authority through mass, elevation, and symmetry.",
    tourExplanation:
      "The Hall of Supreme Harmony dominates the outer court through elevation, breadth, and frontal symmetry, turning the axis into ritual theater.",
    quickFactIds: getQuickFactIdsForZone("hall-of-supreme-harmony"),
  },
  {
    id: "inner-court-threshold",
    title: "Transition toward the Inner Court",
    shortLabel: "Threshold of intimacy",
    court: "inner-threshold",
    sequence: 4,
    hotspotDescription:
      "Beyond the ceremonial core, the axis tightens into a more inward spatial register that prepares the shift toward residential court life.",
    tourExplanation:
      "Beyond the ceremonial climax, the axis tightens. Grand state ritual gives way to a more inward register that prepares the transition toward court life.",
    quickFactIds: getQuickFactIdsForZone("inner-court-threshold"),
  },
];

export function getHotspotContentById(zoneId: HeritageZoneId) {
  return hotspotContent.find((zone) => zone.id === zoneId) ?? null;
}
