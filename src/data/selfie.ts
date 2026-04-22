import { hotspotContent } from "@/data/heritage/hotspots";
import { siteOverview } from "@/data/heritage/site-overview";
import { PALACE_PANORAMA_PLACEHOLDER_SRC } from "@/lib/constants";
import type {
  ExploreJourneyRouteId,
  HeritageZoneId,
  PostcardFrame,
} from "@/types/content";

export type SelfieFocusId = HeritageZoneId | "central-axis";

export type SelfieFocusOption = {
  id: SelfieFocusId;
  label: string;
  description: string;
};

export type SelfieBackdropOption = {
  id: string;
  label: string;
  imageUrl: string;
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
  {
    id: "journey-ceremonial-axis",
    title: "Ceremonial Axis Journey",
    accentToken: "sunlit-bronze",
    description:
      "A formal gold route frame for the central ceremonial progression through the main halls.",
    ribbonLabel: "Ceremonial Axis",
    defaultTitle: "Ceremonial Axis Journey",
  },
  {
    id: "journey-inner-court-life",
    title: "Inner Court Life Journey",
    accentToken: "imperial-red",
    description:
      "A warmer cinnabar route frame for the tighter, more intimate rooms of court life.",
    ribbonLabel: "Inner Court Life",
    defaultTitle: "Inner Court Life Journey",
  },
  {
    id: "journey-garden-quiet-spaces",
    title: "Garden & Quiet Spaces Journey",
    accentToken: "jade-ink",
    description:
      "A calmer jade route frame tuned for garden thresholds, residence courts, and quieter sequences.",
    ribbonLabel: "Quiet Spaces",
    defaultTitle: "Garden & Quiet Spaces Journey",
  },
];

export const postcardFrameByJourneyRouteId: Record<ExploreJourneyRouteId, PostcardFrame["id"]> =
  {
    "ceremonial-axis": "journey-ceremonial-axis",
    "inner-court-life": "journey-inner-court-life",
    "garden-quiet-spaces": "journey-garden-quiet-spaces",
  };

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
export const selfieBackdropOptions: SelfieBackdropOption[] = [
  {
    id: "forbidden-city",
    label: "Forbidden City Axis",
    imageUrl: PALACE_PANORAMA_PLACEHOLDER_SRC,
  },
  {
    id: "mountain-temple",
    label: "Mountain Temple Courtyard",
    imageUrl:
      "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=2000",
  },
  {
    id: "historic-city",
    label: "Historic City Square",
    imageUrl:
      "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=2000",
  },
];
export const defaultSelfieBackdropId = selfieBackdropOptions[0].id;

export function getPostcardFrameById(frameId: string | null | undefined) {
  return postcardFrames.find((frame) => frame.id === frameId) ?? postcardFrames[0];
}

export function getSelfieFocusById(focusId: string | null | undefined) {
  return selfieFocusOptions.find((focus) => focus.id === focusId) ?? null;
}

export function getSelfieBackdropById(backdropId: string | null | undefined) {
  return (
    selfieBackdropOptions.find((backdrop) => backdrop.id === backdropId) ??
    selfieBackdropOptions[0]
  );
}

export function getPostcardFrameIdForJourneyRoute(
  routeId: ExploreJourneyRouteId | null | undefined
) {
  if (!routeId) {
    return null;
  }

  return postcardFrameByJourneyRouteId[routeId] ?? null;
}
