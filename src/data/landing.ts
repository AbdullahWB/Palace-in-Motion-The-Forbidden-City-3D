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
    label: "Open Selfie Studio",
    href: "/selfie",
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
    title: "One route for scenic viewing and guided palace reading",
    description:
      "A fullscreen panorama shell blends beautiful place viewing, cultural hotspots, and guided progression in a single destination.",
    href: "/explore",
    ctaLabel: "Open Explore",
  },
  {
    eyebrow: "自拍留影 Selfie studio",
    title: "Turn your palace visit into a keepsake postcard",
    description:
      "Capture or upload a portrait, place yourself in a palace-inspired setting, and export a souvenir image.",
    href: "/selfie",
    ctaLabel: "Open Selfie",
  },
  {
    eyebrow: "AI文化导览 AI cultural guide",
    title: "Interpretation designed around scene context",
    description:
      "Context-aware assistance stays tied to axial order, ceremonial meaning, and the currently selected palace focus.",
    href: "#ai-guide",
    ctaLabel: "Preview AI Guide",
  },
];

export const aiGuidePreview = {
  eyebrow: "AI文化导览 AI cultural guide",
  title: "A thoughtful interpretive layer that belongs inside the scene.",
  description:
    "AI interpretation is framed as a calm museum companion, ready to answer from the palace route instead of floating above it as a generic chatbot.",
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
    label: "Explore & Tour",
    description: "Open the fullscreen panorama and move through the palace story via hotspots.",
    href: "/explore",
  },
  {
    id: "ai-guide",
    label: "AI Guide",
    description: "Use scene-aware interpretation shaped by the palace route and its current focus.",
  },
  {
    id: "selfie",
    label: "Selfie",
    description: "Generate a souvenir postcard and complete the final demo badge path.",
    href: "/selfie",
  },
];

export const projectSummary = {
  eyebrow: "Project summary / 项目概览",
  title: "A coherent palace demo that moves from atmosphere into interaction.",
  description:
    "This submission now centers on a single immersive route: panorama exploration, guided hotspot storytelling, grounded AI interpretation, and a playful postcard finish.",
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
      "Visitors move from the landing page into Explore, read the palace through guided hotspots, consult the AI helper, and finish with a postcard keepsake.",
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
