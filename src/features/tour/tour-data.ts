import { getHotspotContentById } from "@/data/heritage/hotspots";
import {
  getQuickFactsByIds,
  getSiteQuickFacts,
} from "@/data/heritage/quick-facts";
import { siteOverview } from "@/data/heritage/site-overview";
import { tourStopDefinitions } from "@/data/heritage/tour-stops";
import type {
  ExploreCameraStop,
  QuickFact,
  TourStopDefinition,
  TourStepKind,
} from "@/types/content";

export type TourStep = {
  id: string;
  title: string;
  explanation: string;
  cameraStop: ExploreCameraStop;
  focusZoneId?: TourStopDefinition["focusZoneId"];
  kind: TourStepKind;
  quickFacts: QuickFact[];
};

function resolveTourStep(stop: TourStopDefinition): TourStep {
  if (stop.focusZoneId) {
    const hotspot = getHotspotContentById(stop.focusZoneId);

    if (!hotspot) {
      throw new Error(`Missing hotspot content for tour stop: ${stop.focusZoneId}`);
    }

    return {
      id: stop.id,
      title: stop.title ?? hotspot.title,
      explanation: stop.explanation ?? hotspot.tourExplanation,
      cameraStop: stop.cameraStop,
      focusZoneId: stop.focusZoneId,
      kind: stop.kind,
      quickFacts: getQuickFactsByIds(hotspot.quickFactIds),
    };
  }

  return {
    id: stop.id,
    title: stop.title ?? siteOverview.headline,
    explanation: stop.explanation ?? siteOverview.summary,
    cameraStop: stop.cameraStop,
    focusZoneId: stop.focusZoneId ?? null,
    kind: stop.kind,
    quickFacts: getSiteQuickFacts(),
  };
}

export const tourSteps: TourStep[] = tourStopDefinitions.map(resolveTourStep);
