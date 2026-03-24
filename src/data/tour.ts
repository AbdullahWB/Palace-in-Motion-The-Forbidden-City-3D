import type { TourStop } from "@/types/content";

export const tourStops: TourStop[] = [
  {
    id: "meridian-gate",
    title: "Meridian Gate",
    zoneLabel: "Southern ceremonial axis",
    summary:
      "The arrival threshold for the palace complex and the first place to establish orientation, procession, and visitor context.",
  },
  {
    id: "hall-of-supreme-harmony",
    title: "Hall of Supreme Harmony",
    zoneLabel: "Outer court ritual center",
    summary:
      "A placeholder stop for imperial ceremony, spatial scale, and the type of storytelling that will eventually benefit from synchronized narration.",
  },
  {
    id: "palace-of-heavenly-purity",
    title: "Palace of Heavenly Purity",
    zoneLabel: "Inner court residence",
    summary:
      "A future narrative hinge between state ritual and private imperial life, useful for tone shifts in the guided tour experience.",
  },
];

export const defaultTourStopId = tourStops[0].id;
