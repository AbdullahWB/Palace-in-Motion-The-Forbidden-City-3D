import { hotspotContent } from "@/data/heritage/hotspots";
import { siteOverview } from "@/data/heritage/site-overview";
import type { HeritageZoneId, PostcardFrame } from "@/types/content";

export type SelfieFocusId = HeritageZoneId | "central-axis";

export type SelfieFocusOption = {
  id: SelfieFocusId;
  label: string;
  description: string;
};

export const postcardFrames: PostcardFrame[] = [
  {
    id: "palace-explorer",
    title: "Palace Explorer",
    accentToken: "imperial-red",
    description:
      "A warm museum-card palette with imperial red accents for a classic souvenir finish.",
    ribbonLabel: "Palace Explorer",
    defaultTitle: "Palace Explorer",
  },
  {
    id: "guardian-of-the-central-axis",
    title: "Guardian of the Central Axis",
    accentToken: "jade-ink",
    description:
      "A cooler jade-and-ink composition that leans into geometry, order, and ceremonial calm.",
    ribbonLabel: "Central Axis",
    defaultTitle: "Guardian of the Central Axis",
  },
  {
    id: "forbidden-city-memory-card",
    title: "Forbidden City Memory Card",
    accentToken: "sunlit-bronze",
    description:
      "A bronze-edged keepsake card tuned for a polished travel-memory postcard.",
    ribbonLabel: "Memory Card",
    defaultTitle: "Forbidden City Memory Card",
  },
];

const zoneFocusOptions: SelfieFocusOption[] = hotspotContent.map((zone) => ({
  id: zone.id,
  label: zone.title,
  description: zone.hotspotDescription,
}));

export const selfieFocusOptions: SelfieFocusOption[] = [
  {
    id: "central-axis",
    label: "Central Axis",
    description: siteOverview.summary,
  },
  ...zoneFocusOptions,
];

export const defaultPostcardFrameId = postcardFrames[0].id;
export const defaultSelfieFocusId = selfieFocusOptions[0].id;

export function getPostcardFrameById(frameId: string | null | undefined) {
  return postcardFrames.find((frame) => frame.id === frameId) ?? postcardFrames[0];
}

export function getSelfieFocusById(focusId: string | null | undefined) {
  return selfieFocusOptions.find((focus) => focus.id === focusId) ?? null;
}
