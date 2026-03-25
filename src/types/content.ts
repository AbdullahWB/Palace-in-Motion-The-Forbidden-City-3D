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

export type ExploreCourt = "outer" | "inner-threshold";

export type ExploreCameraStop = {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
};

export type ExploreZone = {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  sequence: number;
  court: ExploreCourt;
  markerPosition: [number, number, number];
  axisPosition: number;
  cameraStop: ExploreCameraStop;
};

export type PostcardFrame = {
  id: string;
  title: string;
  accentToken: "imperial-red" | "sunlit-bronze" | "jade-ink";
};
