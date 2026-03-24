import { tourStops } from "@/data/tour";
import type { ExploreHotspot, TourStop } from "@/types/content";

function getTourStop(id: TourStop["id"]) {
  const tourStop = tourStops.find((stop) => stop.id === id);

  if (!tourStop) {
    throw new Error(`Missing explore hotspot source for tour stop: ${id}`);
  }

  return tourStop;
}

const meridianGate = getTourStop("meridian-gate");
const hallOfSupremeHarmony = getTourStop("hall-of-supreme-harmony");
const palaceOfHeavenlyPurity = getTourStop("palace-of-heavenly-purity");

export const exploreHotspots: ExploreHotspot[] = [
  {
    id: meridianGate.id,
    title: meridianGate.title,
    description:
      "The southern ceremonial gate marks the threshold where procession, scale, and first orientation begin.",
    position: [0, 2.25, 4.1],
  },
  {
    id: hallOfSupremeHarmony.id,
    title: hallOfSupremeHarmony.title,
    description:
      "This elevated hall anchors the outer court and introduces the formal spatial language of imperial ceremony.",
    position: [1.4, 3.2, -0.5],
  },
  {
    id: palaceOfHeavenlyPurity.id,
    title: palaceOfHeavenlyPurity.title,
    description:
      "A quieter inner-court landmark where the narrative can later shift from state ritual toward imperial daily life.",
    position: [-1.2, 2.7, -4.6],
  },
];
