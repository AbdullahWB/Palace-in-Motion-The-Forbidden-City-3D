import type { BilingualText } from "@/types/content";

export type ThreeDCameraView = {
  id: string;
  label: BilingualText;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

export type ThreeDViewerConfig = {
  title: BilingualText;
  subtitle: BilingualText;
  description: BilingualText;
  modelSrc: string | null;
  fallbackMode: "placeholder";
  initialCamera: ThreeDCameraView;
  cameraPresets: ThreeDCameraView[];
  orbitLimits: {
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
  };
};

export const forbiddenCityViewerConfig: ThreeDViewerConfig = {
  title: {
    zh: "故宫三维视图",
    en: "Forbidden City 3D View",
  },
  subtitle: {
    zh: "全屏三维展示",
    en: "Fullscreen ceremonial model showcase",
  },
  description: {
    zh: "这个版本是一个模型就绪的三维展示页。当真实故宫模型放入 `public/models/forbidden-city.glb` 后，这里可以直接切换到真实模型浏览。",
    en: "This page is a model-ready 3D showcase. Once a real Forbidden City asset is added at `public/models/forbidden-city.glb`, the viewer can switch from the placeholder scene to the real model without changing the route.",
  },
  modelSrc: "/models/forbidden-city.glb",
  fallbackMode: "placeholder",
  initialCamera: {
    id: "overview",
    label: {
      zh: "总览",
      en: "Overview",
    },
    // Positioned south-east, elevated — looking north-west into the outer courts
    position: [30, 18, 40],
    target: [0, 5.6, -16],
    fov: 34,
  },
  cameraPresets: [
    {
      id: "overview",
      label: {
        zh: "总览",
        en: "Overview",
      },
      position: [30, 18, 40],
      target: [0, 5.6, -16],
      fov: 34,
    },
    {
      id: "axis",
      label: {
        zh: "中轴",
        en: "Axis",
      },
      position: [0, 13, 48],
      target: [0, 5.4, -15],
      fov: 30,
    },
    {
      id: "terraces",
      label: {
        zh: "台基",
        en: "Terraces",
      },
      position: [19, 10, 15],
      target: [0, 5.8, -8],
      fov: 28,
    },
    {
      id: "garden",
      label: {
        zh: "园林",
        en: "Garden",
      },
      position: [-18, 9, -48],
      target: [0, 3.8, -36],
      fov: 32,
    },
  ],
  orbitLimits: {
    minDistance: 16,
    maxDistance: 68,
    minPolarAngle: 0.58,
    maxPolarAngle: 1.38,
  },
};
