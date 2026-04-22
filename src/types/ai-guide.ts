import type {
  ExploreJourneyRouteId,
  HeritageZoneId,
  HotspotContent,
  QuickFact,
  TourStepKind,
} from "@/types/content";
import type { AppLanguage } from "@/types/preferences";

export type GuideMode = "short" | "detailed" | "fun";
export type GuideIntent = "answer" | "caption";

export type GuideRequest = {
  sceneId?: string | null;
  hotspotId?: HeritageZoneId | null;
  tourStepId?: string | null;
  focusId?: HeritageZoneId | "central-axis" | null;
  journeyRouteId?: ExploreJourneyRouteId | null;
  journeyTitle?: string | null;
  journeyDescription?: string | null;
  journeyStopIndex?: number | null;
  journeyStopTotal?: number | null;
  frameCaption?: string | null;
  contextHint?: string | null;
  postcardThemeId?: string | null;
  title?: string | null;
  language?: AppLanguage;
  question: string;
  mode: GuideMode;
  intent?: GuideIntent;
};

export type GuideCaptionPayload = {
  text: string;
  focusLabel: string;
  themeId?: string | null;
};

export type GuideResponse = {
  answer: string;
  mode: GuideMode;
  fallback: boolean;
  sourceIds: string[];
  contextLabel: string;
  intent?: GuideIntent;
  caption?: GuideCaptionPayload;
  meta?: {
    provider: "deepseek" | "fallback";
    latencyMs: number;
  };
};

export type ResolvedGuideContext = {
  sceneId: string | null;
  hotspotId: HeritageZoneId | null;
  tourStepId: string | null;
  focusId: HeritageZoneId | "central-axis" | null;
  focusLabel: string | null;
  contextLabel: string;
  sourceIds: string[];
  hasSpecificContext: boolean;
  site: {
    headline: string;
    summary: string;
    aiGuideIntro: string;
  };
  hotspot: HotspotContent | null;
  tourStep:
    | {
        id: string;
        title: string;
        explanation: string;
        kind: TourStepKind;
      }
    | null;
  quickFacts: QuickFact[];
};
