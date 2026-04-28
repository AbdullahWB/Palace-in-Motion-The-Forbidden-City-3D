import type {
  BilingualText,
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
  HeritageZoneId,
  HotspotContent,
  QuickFact,
  TourStepKind,
} from "@/types/content";
import type { AppLanguage } from "@/types/preferences";

export type GuideMode =
  | "short"
  | "detailed"
  | "fun"
  | "story"
  | "child"
  | "academic"
  | "tourist"
  | "exam"
  | "quiz";
export type GuideIntent =
  | "answer"
  | "caption"
  | "quiz"
  | "tour_builder"
  | "site_action";

export type TourBuilderInterest =
  | "architecture"
  | "history"
  | "gardens"
  | "photography"
  | "overview";

export type PalaceKnowledgeQuizOption = {
  id: string;
  text: BilingualText;
};

export type PalaceKnowledgeQuizQuestion = {
  id: string;
  question: BilingualText;
  options: PalaceKnowledgeQuizOption[];
  correctOptionId: string;
  explanation: BilingualText;
  stampLabel: BilingualText;
};

export type PalaceKnowledgeEntry = {
  placeSlug: ExplorePlaceSlug;
  routeIds: ExploreJourneyRouteId[];
  shortDescription: BilingualText;
  historyNote: BilingualText;
  thingsToNotice: BilingualText[];
  quiz: PalaceKnowledgeQuizQuestion[];
  sourceNote: BilingualText;
  sourceTitle: BilingualText;
  sourceStatus: "local-guide" | "museum-review-needed";
  sourceConfidence: "guide-ready" | "draft";
  preservationNote: BilingualText;
  learningTags: BilingualText[];
  accessibilitySummary: BilingualText;
  recommendedModes: GuideMode[];
};

export type PassportMissionState = {
  placeSlug: ExplorePlaceSlug;
  quizAnswered: boolean;
  correctCount: number;
  stampUnlocked: boolean;
  updatedAt: number;
};

export type CustomTourState = {
  id: string;
  title: string;
  timeBudget: 5 | 10 | 20;
  interests: TourBuilderInterest[];
  orderedPlaceSlugs: ExplorePlaceSlug[];
  explanation: string;
  currentStopIndex: number;
  createdAt: number;
};

export type GuideSiteActionCommand =
  | "open_map"
  | "open_passport"
  | "start_route"
  | "continue_route"
  | "next_stop"
  | "open_place"
  | "switch_guide_mode"
  | "switch_language";

export type GuideSiteActionPayload = {
  command: GuideSiteActionCommand;
  label: string;
  routeId?: ExploreJourneyRouteId | null;
  placeSlug?: ExplorePlaceSlug | null;
  mode?: GuideMode | null;
  language?: AppLanguage | null;
};

export type GuideRequest = {
  sceneId?: string | null;
  hotspotId?: HeritageZoneId | null;
  tourStepId?: string | null;
  focusId?: HeritageZoneId | "central-axis" | null;
  placeSlug?: ExplorePlaceSlug | null;
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
  timeBudget?: 5 | 10 | 20 | null;
  interests?: TourBuilderInterest[];
};

export type GuideCaptionPayload = {
  text: string;
  focusLabel: string;
  themeId?: string | null;
};

export type GuideQuizPayload = {
  placeSlug: ExplorePlaceSlug;
  questionId: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctOptionId: string;
  explanation: string;
  stampLabel: string;
  sourceNote: string;
};

export type GuideSourceCard = {
  id: string;
  title: string;
  body: string;
  sourceNote: string;
  sourceStatus: PalaceKnowledgeEntry["sourceStatus"] | "scene-context";
  sourceConfidence: PalaceKnowledgeEntry["sourceConfidence"] | "limited";
};

export type GuideVerification = {
  label: string;
  status: "grounded" | "limited" | "missing";
  message: string;
};

export type GuideResponse = {
  answer: string;
  mode: GuideMode;
  fallback: boolean;
  sourceIds: string[];
  contextLabel: string;
  intent?: GuideIntent;
  caption?: GuideCaptionPayload;
  quiz?: GuideQuizPayload;
  customTour?: CustomTourState;
  siteAction?: GuideSiteActionPayload;
  sourceCards?: GuideSourceCard[];
  verification?: GuideVerification;
  aiLabel?: string;
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
  placeKnowledge: PalaceKnowledgeEntry | null;
};
