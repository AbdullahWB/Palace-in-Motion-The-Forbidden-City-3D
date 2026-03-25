import type {
  HeritageZoneId,
  HotspotContent,
  QuickFact,
  TourStepKind,
} from "@/types/content";

export type GuideMode = "short" | "detailed" | "fun";
export type GuideIntent = "answer" | "caption";

export type GuideRequest = {
  sceneId?: string | null;
  hotspotId?: HeritageZoneId | null;
  tourStepId?: string | null;
  focusId?: HeritageZoneId | "central-axis" | null;
  postcardThemeId?: string | null;
  title?: string | null;
  question: string;
  mode: GuideMode;
  intent?: GuideIntent;
};

export type GuideResponse = {
  answer: string;
  mode: GuideMode;
  fallback: boolean;
  sourceIds: string[];
  contextLabel: string;
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
