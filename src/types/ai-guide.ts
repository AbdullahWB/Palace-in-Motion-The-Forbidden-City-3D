import type {
  HeritageZoneId,
  HotspotContent,
  QuickFact,
  TourStepKind,
} from "@/types/content";

export type GuideMode = "short" | "detailed" | "fun";

export type GuideRequest = {
  sceneId?: string | null;
  hotspotId?: HeritageZoneId | null;
  tourStepId?: string | null;
  question: string;
  mode: GuideMode;
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
