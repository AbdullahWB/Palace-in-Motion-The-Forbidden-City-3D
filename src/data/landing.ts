import type {
  AIGuidePreviewPoint,
  HeroAction,
  LandingFeaturePreview,
  LandingHero,
} from "@/types/content";

export const landingHero: LandingHero = {
  eyebrow: "Forbidden City digital heritage experience",
  titleLines: ["Palace", "in Motion"],
  subtitle:
    "Enter a refined interactive journey through imperial architecture, guided storytelling, and cultural interpretation.",
};

export const landingHeroActions: HeroAction[] = [
  {
    label: "Start Exploring",
    href: "/explore",
    variant: "primary",
  },
  {
    label: "Take Guided Tour",
    href: "/tour",
    variant: "secondary",
  },
  {
    label: "Meet the AI Guide",
    href: "#ai-guide",
    variant: "ghost",
  },
];

export const landingFeaturePreviews: LandingFeaturePreview[] = [
  {
    eyebrow: "Spatial exploration",
    title: "Walk the palace at architectural scale",
    description:
      "Move through courtyards, gates, and ceremonial spaces in an elegant browser-native experience.",
    href: "/explore",
    ctaLabel: "Start Exploring",
  },
  {
    eyebrow: "Guided storytelling",
    title: "Follow a curated route through key moments",
    description:
      "Step through a narrative sequence that connects architecture, ritual, and imperial life with clarity.",
    href: "/tour",
    ctaLabel: "Take Guided Tour",
  },
  {
    eyebrow: "AI cultural guide",
    title: "Meet interpretation designed for context",
    description:
      "Future AI guidance is shaped to explain spaces and significance with a calm, museum-like voice.",
    href: "#ai-guide",
    ctaLabel: "Meet the AI Guide",
  },
];

export const aiGuidePreview = {
  eyebrow: "AI cultural guide",
  title: "A thoughtful interpretive layer, not a novelty overlay.",
  description:
    "The guide is planned as a calm companion that adds context precisely where curiosity appears.",
} as const;

export const aiGuidePreviewPoints: AIGuidePreviewPoint[] = [
  {
    title: "Context anchored to place",
    description:
      "Interpretation can stay tied to courtyards, halls, objects, and the visitor's current viewpoint.",
  },
  {
    title: "Multilingual cultural framing",
    description:
      "Designed to support broader access without flattening nuance, tone, or historical meaning.",
  },
  {
    title: "Story paths that adapt",
    description:
      "Future guidance can respond to visitor choices while preserving a clear curatorial structure.",
  },
];
