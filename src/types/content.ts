export type AppRoute =
  | "/"
  | "/explore"
  | "/tour"
  | "/selfie"
  | "/3d-view"
  | "/companion";
export type HomeAnchor = "#ai-guide";
export type LandingHref = AppRoute | HomeAnchor;

export type BilingualText = {
  zh: string;
  en: string;
};

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

export type DemoFlowStepId = "explore" | "ai-guide" | "selfie";

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

export type ExploreView = "welcome" | "map" | "place";

export type ExplorePlaceSlug =
  | "tianyi-men"
  | "yangxin-dian"
  | "fengxian-dian"
  | "qianqing-men"
  | "huangji-dian"
  | "shoukang-gong"
  | "taihe-dian"
  | "zhonghe-dian"
  | "baohe-dian"
  | "jingren-gong";

export type ExploreJourneyRouteId =
  | "ceremonial-axis"
  | "inner-court-life"
  | "garden-quiet-spaces";

export type PostcardFrame = {
  id: string;
  title: string;
  accentToken: "imperial-red" | "sunlit-bronze" | "jade-ink";
  description: string;
  ribbonLabel: string;
  defaultTitle?: string;
};

export type ExploreWelcomeScene = {
  id: string;
  heroSrc: string;
  heroVideoSrc: string;
  heroVideoPosterSrc?: string;
  title: BilingualText;
  subtitle: BilingualText;
  ctaLabel: BilingualText;
};

export type ExploreMapMarker = {
  placeSlug: ExplorePlaceSlug;
  x: number;
  y: number;
  label: BilingualText;
};

export type ExploreMap = {
  imageSrc: string;
  alt: BilingualText;
  minScale: number;
  maxScale: number;
  initialScale: number;
  markers: ExploreMapMarker[];
};

export type ExplorePlacePhoto = {
  id: string;
  src: string;
  alt: BilingualText;
  caption: BilingualText;
  depth: number;
};

export type ExplorePlace = {
  slug: ExplorePlaceSlug;
  title: BilingualText;
  badgeLabel: BilingualText;
  shortDescription: BilingualText;
  longDescription: BilingualText;
  markerPosition: {
    x: number;
    y: number;
  };
  coverSrc: string;
  defaultPhotoId: string;
  gallery: ExplorePlacePhoto[];
};

export type ExploreJourneyRoute = {
  id: ExploreJourneyRouteId;
  title: BilingualText;
  description: BilingualText;
  intro: BilingualText;
  coverSrc: string;
  accent: string;
  placeOrder: ExplorePlaceSlug[];
};

export type ExplorePassportSeal = {
  id: string;
  routeId: ExploreJourneyRouteId;
  title: BilingualText;
  description: BilingualText;
  accent: string;
};

export type ExplorePassportData = {
  title: BilingualText;
  subtitle: BilingualText;
  placeCollectionLabel: BilingualText;
  routeSealsLabel: BilingualText;
  visitedSummaryLabel: BilingualText;
  completedSummaryLabel: BilingualText;
  completedLabel: BilingualText;
  resetLabel: BilingualText;
  closeLabel: BilingualText;
  routeSeals: ExplorePassportSeal[];
};

export type ExploreExperienceData = {
  welcome: ExploreWelcomeScene;
  map: ExploreMap;
  journeys: ExploreJourneyRoute[];
  passport: ExplorePassportData;
  places: ExplorePlace[];
};

export type ExploreSearchState = {
  view: ExploreView;
  placeSlug: ExplorePlaceSlug | null;
  photoId: string | null;
  routeId: ExploreJourneyRouteId | null;
};
