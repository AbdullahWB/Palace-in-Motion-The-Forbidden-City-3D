import type { BilingualText } from "@/types/content";

export type ThreeDViewerConfig = {
  title: BilingualText;
  subtitle: BilingualText;
  description: BilingualText;
  modelSrc: string | null;
  fallbackMode: "placeholder";
  initialCamera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
  orbitLimits: {
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
  };
};

export const forbiddenCityViewerConfig: ThreeDViewerConfig = {
  title: {
    zh: "æ•…å®«ä¸‰ç»´è§†å›¾",
    en: "Forbidden City 3D View",
  },
  subtitle: {
    zh: "å…¨å±ä¸‰ç»´å±•ç¤º",
    en: "Fullscreen ceremonial model showcase",
  },
  description: {
    zh: "è¿™ä¸ªç‰ˆæœ¬æ˜¯ä¸€ä¸ªæ¨¡åž‹å°±ç»ªçš„ä¸‰ç»´å±•ç¤ºé¡µã€‚å½“çœŸå®žæ•…å®«æ¨¡åž‹æ”¾å…¥ `public/models/forbidden-city.glb` åŽï¼Œè¿™é‡Œå¯ä»¥ç›´æŽ¥åˆ‡æ¢åˆ°çœŸå®žæ¨¡åž‹æµè§ˆã€‚",
    en: "This page is a model-ready 3D showcase. Once a real Forbidden City asset is added at `public/models/forbidden-city.glb`, the viewer can switch from the placeholder scene to the real model without changing the route.",
  },
  modelSrc: "/models/forbidden-city.glb",
  fallbackMode: "placeholder",
  initialCamera: {
    position: [24, 15, 22],
    target: [0, 4.2, -5.5],
    fov: 34,
  },
  orbitLimits: {
    minDistance: 12,
    maxDistance: 36,
    minPolarAngle: 0.72,
    maxPolarAngle: 1.42,
  },
};
