export type AppRoute = "/" | "/explore" | "/tour" | "/selfie";

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

export type TourStop = {
  id: string;
  title: string;
  zoneLabel: string;
  summary: string;
};

export type PostcardFrame = {
  id: string;
  title: string;
  accentToken: "imperial-red" | "sunlit-bronze" | "jade-ink";
};
