import type {
  BilingualText,
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
} from "@/types/content";

export type ThreeDCameraView = {
  id: string;
  label: BilingualText;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

export type ThreeDLayerId =
  | "routes"
  | "hotspots"
  | "hierarchy"
  | "defense"
  | "courtyard-reveal"
  | "measure";

export type ThreeDLightingMode = "morning" | "noon" | "sunset" | "night";
export type ThreeDSeasonMode = "summer" | "winter";
export type ThreeDQualityMode = "low" | "medium" | "high";
export type ThreeDHotspotKind =
  | "roof"
  | "gate"
  | "courtyard"
  | "monument"
  | "garden";

export type ThreeDHotspot = {
  id: string;
  label: BilingualText;
  kind: ThreeDHotspotKind;
  placeSlug: ExplorePlaceSlug;
  routeId: ExploreJourneyRouteId;
  position: [number, number, number];
  cameraPresetId: string;
  description: BilingualText;
  challengePrompt?: BilingualText;
};

export type ThreeDRouteOverlay = {
  id: ExploreJourneyRouteId;
  label: BilingualText;
  color: string;
  cameraPresetId: string;
  points: [number, number, number][];
  stopHotspotIds: string[];
  description: BilingualText;
};

export type ThreeDInformationLayer = {
  id: ThreeDLayerId;
  label: BilingualText;
  description: BilingualText;
};

export type ThreeDViewerConfig = {
  title: BilingualText;
  subtitle: BilingualText;
  description: BilingualText;
  modelSrc: string | null;
  fallbackMode: "placeholder";
  modelImport: {
    targetPath: string;
    optimizationNote: BilingualText;
    fallbackNote: BilingualText;
  };
  initialCamera: ThreeDCameraView;
  cameraPresets: ThreeDCameraView[];
  hotspots: ThreeDHotspot[];
  routeOverlays: ThreeDRouteOverlay[];
  informationLayers: ThreeDInformationLayer[];
  lightingModes: Array<{ id: ThreeDLightingMode; label: BilingualText }>;
  seasonModes: Array<{ id: ThreeDSeasonMode; label: BilingualText }>;
  qualityModes: Array<{ id: ThreeDQualityMode; label: BilingualText }>;
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
    zh: "交互式宫城模型导览",
    en: "Interactive palace model guide",
  },
  description: {
    zh: "这个页面已经准备好加载真实 GLB 模型。把优化后的 `forbidden-city.glb` 放入 `public/models/` 后，热点、路线、灯光、图层和挑战模式会继续工作。",
    en: "This viewer is ready for a real GLB asset. Drop an optimized `forbidden-city.glb` into `public/models/` and the hotspots, route overlays, lighting modes, layers, and challenge tools continue to work.",
  },
  modelSrc: "/models/forbidden-city.glb",
  fallbackMode: "placeholder",
  modelImport: {
    targetPath: "public/models/forbidden-city.glb",
    optimizationNote: {
      zh: "建议使用 glTF/GLB、Draco 或 Meshopt 压缩、KTX2/WebP 贴图，并为移动端控制面数与纹理尺寸。",
      en: "Use glTF/GLB with Draco or Meshopt compression, KTX2/WebP textures, and mobile-friendly mesh and texture budgets.",
    },
    fallbackNote: {
      zh: "当前显示程序化占位模型；真实授权模型加入后会自动替换。",
      en: "The procedural fallback is shown until a licensed optimized model is added.",
    },
  },
  initialCamera: {
    id: "overview",
    label: {
      zh: "总览",
      en: "Overview",
    },
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
    {
      id: "gate-close",
      label: {
        zh: "门序",
        en: "Gate",
      },
      position: [10, 9, 55],
      target: [0, 5.2, 32],
      fov: 29,
    },
    {
      id: "inner-court",
      label: {
        zh: "内廷",
        en: "Inner court",
      },
      position: [22, 11, -45],
      target: [2, 4.2, -58],
      fov: 31,
    },
    {
      id: "defense",
      label: {
        zh: "城墙",
        en: "Defense",
      },
      position: [42, 18, -28],
      target: [0, 5.4, -12],
      fov: 36,
    },
  ],
  hotspots: [
    {
      id: "wumen-gate",
      label: {
        zh: "午门",
        en: "Meridian Gate",
      },
      kind: "gate",
      placeSlug: "tianyi-men",
      routeId: "ceremonial-axis",
      position: [0, 9.5, 52],
      cameraPresetId: "gate-close",
      description: {
        zh: "从南侧进入时，门序先建立方向、尺度和进入宫城的仪式感。",
        en: "The southern gate sequence establishes direction, scale, and the ritual feeling of entering the palace.",
      },
      challengePrompt: {
        zh: "找出门序如何把视线引向中轴线。",
        en: "Find how the gate sequence pulls the eye toward the central axis.",
      },
    },
    {
      id: "taihe-roof",
      label: {
        zh: "太和殿屋顶层级",
        en: "Taihe Dian roof hierarchy",
      },
      kind: "roof",
      placeSlug: "taihe-dian",
      routeId: "ceremonial-axis",
      position: [0, 18, 1],
      cameraPresetId: "terraces",
      description: {
        zh: "屋顶层级、宽阔前场和高台基共同强化外朝礼制中心的秩序。",
        en: "Roof hierarchy, broad forecourt, and raised terraces reinforce the outer-court ceremonial center.",
      },
      challengePrompt: {
        zh: "找到台基、屋顶和前场共同形成的等级关系。",
        en: "Find the hierarchy created by the plinth, roof tiers, and forecourt.",
      },
    },
    {
      id: "zhonghe-sequence",
      label: {
        zh: "中和殿序列",
        en: "Zhonghe Dian sequence",
      },
      kind: "monument",
      placeSlug: "zhonghe-dian",
      routeId: "ceremonial-axis",
      position: [0, 11, -15],
      cameraPresetId: "axis",
      description: {
        zh: "中和殿让中轴线在宏大前场之后收紧，帮助用户理解空间节奏。",
        en: "Zhonghe Dian tightens the axis after the large forecourt, helping users read spatial rhythm.",
      },
    },
    {
      id: "baohe-court",
      label: {
        zh: "保和殿前场",
        en: "Baohe Dian forecourt",
      },
      kind: "courtyard",
      placeSlug: "baohe-dian",
      routeId: "ceremonial-axis",
      position: [0, 10, -29],
      cameraPresetId: "axis",
      description: {
        zh: "开放前场让建筑从距离中被阅读，是外朝礼制路线的收束节点。",
        en: "The open forecourt lets the hall be read from distance, closing the formal outer-court route.",
      },
    },
    {
      id: "qianqing-threshold",
      label: {
        zh: "乾清门阈限",
        en: "Qianqing Men threshold",
      },
      kind: "gate",
      placeSlug: "qianqing-men",
      routeId: "inner-court-life",
      position: [0, 9, -42],
      cameraPresetId: "inner-court",
      description: {
        zh: "红色门扇与压缩通道把路线从外朝礼制推向更亲密的内廷空间。",
        en: "Red gate leaves and compressed passage move the route from outer-court ceremony into the intimate inner court.",
      },
    },
    {
      id: "yangxin-court",
      label: {
        zh: "养心殿内廷生活",
        en: "Yangxin Dian inner-court life",
      },
      kind: "courtyard",
      placeSlug: "yangxin-dian",
      routeId: "inner-court-life",
      position: [16, 8, -54],
      cameraPresetId: "inner-court",
      description: {
        zh: "养心殿把体验转向起居、治理和更贴近宫廷日常的尺度。",
        en: "Yangxin Dian shifts the experience toward residence, governance, and the closer scale of palace life.",
      },
    },
    {
      id: "jingren-quiet-court",
      label: {
        zh: "景仁宫安静院落",
        en: "Jingren Gong quiet court",
      },
      kind: "courtyard",
      placeSlug: "jingren-gong",
      routeId: "garden-quiet-spaces",
      position: [-18, 8, -55],
      cameraPresetId: "inner-court",
      description: {
        zh: "较小的院落、立面节奏和阴影让宫城阅读变得更安静。",
        en: "Smaller court scale, facade rhythm, and shadow make the palace reading calmer.",
      },
    },
    {
      id: "imperial-garden",
      label: {
        zh: "御花园停留",
        en: "Imperial Garden pause",
      },
      kind: "garden",
      placeSlug: "shoukang-gong",
      routeId: "garden-quiet-spaces",
      position: [0, 7, -77],
      cameraPresetId: "garden",
      description: {
        zh: "树影、停留和较慢的路线节奏把体验从仪式转向观察。",
        en: "Trees, pause, and slower route rhythm shift the experience from ceremony toward observation.",
      },
      challengePrompt: {
        zh: "寻找从建筑秩序转向花园停留的视觉线索。",
        en: "Find the visual cues that shift the palace from order into garden pause.",
      },
    },
  ],
  routeOverlays: [
    {
      id: "ceremonial-axis",
      label: {
        zh: "中轴礼制",
        en: "Ceremonial Axis",
      },
      color: "#f1c76f",
      cameraPresetId: "axis",
      points: [
        [0, 0.35, 55],
        [0, 0.35, 42],
        [0, 0.35, 22],
        [0, 0.35, 1],
        [0, 0.35, -15],
        [0, 0.35, -29],
        [0, 0.35, -42],
      ],
      stopHotspotIds: [
        "wumen-gate",
        "taihe-roof",
        "zhonghe-sequence",
        "baohe-court",
        "qianqing-threshold",
      ],
      description: {
        zh: "以门序、前场、台基和屋顶层级串联外朝礼制空间。",
        en: "Connect gates, forecourts, terraces, and roof hierarchy along the formal outer-court spine.",
      },
    },
    {
      id: "inner-court-life",
      label: {
        zh: "内廷起居",
        en: "Inner Court Life",
      },
      color: "#ff747c",
      cameraPresetId: "inner-court",
      points: [
        [0, 0.45, -42],
        [0, 0.45, -50],
        [16, 0.45, -54],
        [6, 0.45, -62],
        [20, 0.45, -68],
      ],
      stopHotspotIds: ["qianqing-threshold", "yangxin-court"],
      description: {
        zh: "从门阈进入更亲密的起居、治理与日常宫廷空间。",
        en: "Move through thresholds into the more intimate spaces of residence, governance, and daily court life.",
      },
    },
    {
      id: "garden-quiet-spaces",
      label: {
        zh: "园林静观",
        en: "Garden & Quiet Spaces",
      },
      color: "#91b58f",
      cameraPresetId: "garden",
      points: [
        [0, 0.5, -50],
        [-18, 0.5, -55],
        [-12, 0.5, -70],
        [0, 0.5, -77],
        [16, 0.5, -70],
      ],
      stopHotspotIds: ["jingren-quiet-court", "imperial-garden"],
      description: {
        zh: "以树影、院落和较慢节奏呈现安静的观察路线。",
        en: "Use trees, courts, and slower rhythm to read the quieter palace route.",
      },
    },
  ],
  informationLayers: [
    {
      id: "routes",
      label: {
        zh: "路线叠加",
        en: "Route overlays",
      },
      description: {
        zh: "在模型上直接显示三条主要导览路线。",
        en: "Show the three primary guide routes directly on the model.",
      },
    },
    {
      id: "hotspots",
      label: {
        zh: "知识热点",
        en: "Learning hotspots",
      },
      description: {
        zh: "点击屋顶、门、院落和花园节点查看说明。",
        en: "Click roofs, gates, courtyards, and garden nodes for annotations.",
      },
    },
    {
      id: "hierarchy",
      label: {
        zh: "建筑层级",
        en: "Architectural hierarchy",
      },
      description: {
        zh: "高亮台基、屋顶层级和中轴秩序。",
        en: "Highlight terraces, roof tiers, and central-axis order.",
      },
    },
    {
      id: "defense",
      label: {
        zh: "防御结构",
        en: "Defensive frame",
      },
      description: {
        zh: "显示城墙、角楼和宫城边界。",
        en: "Show walls, watchtowers, and palace boundary logic.",
      },
    },
    {
      id: "courtyard-reveal",
      label: {
        zh: "院落透视",
        en: "Courtyard reveal",
      },
      description: {
        zh: "淡化体量，突出院落和行走空间关系。",
        en: "Fade volumes and emphasize courtyards and movement space.",
      },
    },
    {
      id: "measure",
      label: {
        zh: "方向与比例",
        en: "Orientation tools",
      },
      description: {
        zh: "显示北向、比例尺和小地图定位。",
        en: "Show north orientation, a scale guide, and minimap context.",
      },
    },
  ],
  lightingModes: [
    { id: "morning", label: { zh: "清晨", en: "Morning" } },
    { id: "noon", label: { zh: "正午", en: "Noon" } },
    { id: "sunset", label: { zh: "夕照", en: "Sunset" } },
    { id: "night", label: { zh: "夜景", en: "Night" } },
  ],
  seasonModes: [
    { id: "summer", label: { zh: "夏季", en: "Summer" } },
    { id: "winter", label: { zh: "冬季", en: "Winter" } },
  ],
  qualityModes: [
    { id: "low", label: { zh: "低", en: "Low" } },
    { id: "medium", label: { zh: "中", en: "Medium" } },
    { id: "high", label: { zh: "高", en: "High" } },
  ],
  orbitLimits: {
    minDistance: 16,
    maxDistance: 68,
    minPolarAngle: 0.58,
    maxPolarAngle: 1.38,
  },
};
