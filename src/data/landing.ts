import type {
  AIGuidePreviewPoint,
  DemoFlowStep,
  FooterTheme,
  HeroAction,
  LandingSummaryCard,
  LandingFeaturePreview,
  LandingHero,
} from "@/types/content";
import { siteOverview } from "@/data/heritage/site-overview";

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
  description: siteOverview.aiGuideIntro,
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

export const demoFlowSteps: DemoFlowStep[] = [
  {
    id: "explore",
    label: "Explore",
    description: "Inspect the stylized palace axis and its four major zones.",
    href: "/explore",
  },
  {
    id: "tour",
    label: "Tour",
    description: "Follow the six-stop narrative through ceremonial sequence and meaning.",
    href: "/tour",
  },
  {
    id: "ai-guide",
    label: "AI Guide",
    description: "Ask scene-aware questions from the current stop without leaving the route.",
  },
  {
    id: "selfie",
    label: "Selfie",
    description: "Generate a souvenir postcard and complete the demo badge path.",
    href: "/selfie",
  },
];

export const projectSummary = {
  eyebrow: "Project summary",
  title: "A coherent heritage demo built to move from atmosphere into action.",
  description:
    "This submission is designed as a single flow: spatial exploration, guided interpretation, grounded AI assistance, and a playful postcard finish.",
} as const;

export const projectSummaryCards: LandingSummaryCard[] = [
  {
    eyebrow: "What the demo proves",
    title: "The architecture can carry the story",
    description:
      "A stylized 3D blockout, structured local content, and guided camera stops already support a museum-like heritage narrative in the browser.",
  },
  {
    eyebrow: "Demo flow",
    title: "The experience has a clear beginning, middle, and finish",
    description:
      "Visitors move from the landing page into free exploration, continue into a guided walkthrough, consult the AI helper, and finish with a postcard keepsake.",
  },
  {
    eyebrow: "Cultural framing",
    title: "Interpretation stays tied to space and meaning",
    description:
      "The core themes remain consistent across the app: central axis, symmetry, court hierarchy, and the ceremonial logic of movement through the palace.",
  },
];

export const footerThemes: FooterTheme[] = [
  {
    label: "Central axis",
    description: "The north-south spine orders sequence, sightlines, and procession.",
  },
  {
    label: "Symmetry",
    description: "Mirrored masses reinforce balance, discipline, and imperial authority.",
  },
  {
    label: "Outer and inner court",
    description: "The route shifts from public ceremony toward a more inward court register.",
  },
  {
    label: "Ceremonial meaning",
    description: "Thresholds, terraces, and scale turn movement into ritual theater.",
  },
];
