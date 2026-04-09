import type {
  AIGuidePreviewPoint,
  DemoFlowStep,
  FooterTheme,
  HeroAction,
  LandingSummaryCard,
  LandingFeaturePreview,
  LandingHero,
} from "@/types/content";

export const landingHero: LandingHero = {
  eyebrow: "全景故宫 Panorama-driven heritage experience",
  titleLines: ["Palace", "in Motion"],
  subtitle:
    "以全屏沉浸视角进入故宫空间叙事。 Enter a richer route through palace atmosphere, hotspot storytelling, and souvenir-making.",
};

export const landingHeroActions: HeroAction[] = [
  {
    label: "Enter Explore",
    href: "/explore",
    variant: "primary",
  },
  {
    label: "Selfie In Explore",
    href: "/explore",
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
    eyebrow: "全景探索 Explore & Tour",
    title: "One route for scenic viewing, guidance, and selfie capture",
    description:
      "A fullscreen panorama shell now blends beautiful place viewing, cultural hotspots, DeepSeek chat help, and an in-place selfie studio.",
    href: "/explore",
    ctaLabel: "Open Explore",
  },
  {
    eyebrow: "自拍留影 Selfie studio",
    title: "Capture your postcard without leaving the palace route",
    description:
      "Open any mapped place, launch the integrated selfie modal, and turn that exact location into a keepsake postcard scene.",
    href: "/explore",
    ctaLabel: "Open Place Selfie",
  },
  {
    eyebrow: "AI文化导览 AI cultural guide",
    title: "A floating corner guide that stays tied to palace context",
    description:
      "A corner chatbot uses DeepSeek with local palace context so questions stay grounded in the route instead of feeling generic.",
    href: "#ai-guide",
    ctaLabel: "Preview AI Guide",
  },
];

export const aiGuidePreview = {
  eyebrow: "AI文化导览 AI cultural guide",
  title: "A thoughtful interpretive layer that now lives inside the route.",
  description:
    "AI interpretation is framed as a calm museum companion, ready to answer from a floating corner helper that still stays grounded in the palace route.",
  summary:
    "从场景出发，而不是脱离场景。 Scene-aware guidance can explain symmetry, thresholds, and ritual meaning from the viewer's current palace focus.",
} as const;

export const aiGuidePreviewPoints: AIGuidePreviewPoint[] = [
  {
    title: "Context anchored to place / 场景锚定",
    description:
      "Interpretation can stay tied to courtyards, halls, objects, and the visitor's current point of view inside the explore route.",
  },
  {
    title: "Bilingual cultural framing / 双语表达",
    description:
      "Chinese-first presentation can still support broader access without flattening nuance, tone, or historical meaning.",
  },
  {
    title: "Adaptive story paths / 导览递进",
    description:
      "Future guidance can adapt to visitor choices while preserving a clear curatorial structure built around hotspots and route moments.",
  },
];

export const demoFlowSteps: DemoFlowStep[] = [
  {
    id: "explore",
    label: "Explore",
    description: "Open the fullscreen panorama, map, and place views inside the main palace route.",
    href: "/explore",
  },
  {
    id: "ai-guide",
    label: "AI Guide",
    description: "Use the floating DeepSeek helper for scene-aware interpretation shaped by the palace route.",
  },
  {
    id: "selfie",
    label: "Selfie In Explore",
    description: "Generate a souvenir postcard directly from any mapped place inside Explore.",
    href: "/explore",
  },
];

export const projectSummary = {
  eyebrow: "Project summary / 项目概览",
  title: "A coherent palace demo that moves from atmosphere into interaction.",
  description:
    "This submission now centers on a single immersive route: panorama exploration, grounded AI interpretation, and a playful postcard finish inside Explore itself.",
} as const;

export const projectSummaryCards: LandingSummaryCard[] = [
  {
    eyebrow: "What the demo proves",
    title: "The palace view can carry the story",
    description:
      "A fullscreen place-view, structured content, and hotspot-led guidance already support a museum-like heritage narrative in the browser.",
  },
  {
    eyebrow: "Demo flow",
    title: "The experience now has a clearer public route",
    description:
      "Visitors move from the landing page into Explore, read the palace through mapped places, consult the AI helper, and finish with a postcard keepsake without leaving the route.",
  },
  {
    eyebrow: "Cultural framing",
    title: "Interpretation stays tied to scene and ceremonial meaning",
    description:
      "The core themes remain consistent across the app: central axis, symmetry, court hierarchy, and the ceremonial logic of movement through the palace.",
  },
];

export const footerThemes: FooterTheme[] = [
  {
    label: "Central axis / 中轴线",
    description: "The north-south spine orders sequence, sightlines, and procession.",
  },
  {
    label: "Symmetry / 对称秩序",
    description: "Mirrored masses reinforce balance, discipline, and imperial authority.",
  },
  {
    label: "Panorama route / 全景导览",
    description: "The public route now blends scenic immersion with guided cultural interpretation.",
  },
  {
    label: "Ceremonial meaning / 礼制空间",
    description: "Thresholds, terraces, and scale turn movement into ritual theater.",
  },
];
