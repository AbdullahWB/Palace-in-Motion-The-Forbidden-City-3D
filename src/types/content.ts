export type AppRoute = "/" | "/explore" | "/tour" | "/selfie";
export type HomeAnchor = "#ai-guide";
export type LandingHref = AppRoute | HomeAnchor;

export type NavItem = {
  label: string;
  href: AppRoute;
  description: string;
};

export type FeatureCard = {
  title: string;
  body: string;
  href: AppRoute;
};

export type HeroAction = {
  label: string;
  href: LandingHref;
  variant: "primary" | "secondary" | "ghost";
};

export type LandingHero = {
  eyebrow: string;
  titleLines: [string, string];
  subtitle: string;
};

export type LandingFeaturePreview = {
  eyebrow: string;
  title: string;
  description: string;
  href: LandingHref;
  ctaLabel: string;
};

export type AIGuidePreviewPoint = {
  title: string;
  description: string;
};

export type DemoFlowStepId = "explore" | "tour" | "ai-guide" | "selfie";

export type DemoFlowStep = {
  id: DemoFlowStepId;
  label: string;
  description: string;
  href?: AppRoute;
};

export type LandingSummaryCard = {
  eyebrow: string;
  title: string;
  description: string;
};

export type FooterTheme = {
  label: string;
  description: string;
};

export type HeritageZoneId =
  | "meridian-gate"
  | "taihe-gate"
  | "hall-of-supreme-harmony"
  | "inner-court-threshold";

export type ExploreCourt = "outer" | "inner-threshold";

export type ExploreCameraStop = {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
};

export type SiteOverviewContent = {
  headline: string;
  summary: string;
  exploreIntro: string;
  tourIntro: string;
  aiGuideIntro: string;
  completionSummary: string;
};

export type QuickFact = {
  id: string;
  title: string;
  body: string;
  zoneIds?: HeritageZoneId[];
};

export type HotspotContent = {
  id: HeritageZoneId;
  title: string;
  shortLabel: string;
  court: ExploreCourt;
  sequence: number;
  hotspotDescription: string;
  tourExplanation: string;
  quickFactIds: QuickFact["id"][];
};

export type TourStepKind = "intro" | "zone" | "meaning" | "summary";

export type TourStopDefinition = {
  id: string;
  kind: TourStepKind;
  focusZoneId?: HeritageZoneId | null;
  cameraStop: ExploreCameraStop;
  title?: string;
  explanation?: string;
};

export type ExploreZone = {
  id: HeritageZoneId;
  title: string;
  shortLabel: string;
  description: string;
  sequence: number;
  court: ExploreCourt;
  markerPosition: [number, number, number];
  axisPosition: number;
  cameraStop: ExploreCameraStop;
  quickFactIds: QuickFact["id"][];
};

export type PostcardFrame = {
  id: string;
  title: string;
  accentToken: "imperial-red" | "sunlit-bronze" | "jade-ink";
  description: string;
  ribbonLabel: string;
  defaultTitle?: string;
};
