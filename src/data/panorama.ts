import { HERITAGE_SCENE_ID, PALACE_PANORAMA_PLACEHOLDER_SRC } from "@/lib/constants";
import type { PanoramaScene } from "@/types/content";

export const heroPanoramaScene: PanoramaScene = {
  id: HERITAGE_SCENE_ID,
  routeLabel: {
    zh: "探索与导览",
    en: "Explore & Tour",
  },
  title: {
    zh: "太和殿广场全景",
    en: "Hero panorama of the Hall of Supreme Harmony precinct",
  },
  subtitle: {
    zh: "以一幕沉浸视角阅读紫禁城礼序、尺度与中轴叙事。",
    en: "Read the palace through one immersive scene shaped by axis, scale, and ceremonial sequence.",
  },
  sceneLabel: {
    zh: "太和殿",
    en: "Hall of Supreme Harmony",
  },
  location: {
    zh: "紫禁城外朝核心",
    en: "Ceremonial heart of the outer court",
  },
  assetSrc: PALACE_PANORAMA_PLACEHOLDER_SRC,
  panelMedia: {
    src: PALACE_PANORAMA_PLACEHOLDER_SRC,
    alt: {
      zh: "故宫主场景占位全景图",
      en: "Placeholder panorama artwork for the palace main scene",
    },
  },
  hotspots: [
    {
      id: "meridian-gate",
      anchor: { x: 18, y: 58 },
      markerLabel: {
        zh: "午门",
        en: "Meridian Gate",
      },
      panelEyebrow: {
        zh: "南向礼制入口",
        en: "Southern ceremonial threshold",
      },
      title: {
        zh: "午门 Meridian Gate",
        en: "Meridian Gate",
      },
      summary: {
        zh: "午门不是普通入口，而是从城市空间进入帝王秩序的第一道礼制门槛。",
        en: "Meridian Gate is not a casual entrance. It is the first ceremonial threshold where city space gives way to imperial order.",
      },
      story: {
        zh: "从这里开始，视线被中轴固定，行进被仪式化，进入故宫意味着进入一套被精确安排的空间叙事。",
        en: "From here, the axis fixes orientation and movement becomes ritualized, turning entry into a carefully staged spatial narrative.",
      },
      panelMedia: {
        src: PALACE_PANORAMA_PLACEHOLDER_SRC,
        alt: {
          zh: "午门热点展示图",
          en: "Meridian Gate hotspot artwork",
        },
      },
      facts: [
        {
          id: "meridian-axis",
          title: {
            zh: "中轴起点",
            en: "Axis origin",
          },
          body: {
            zh: "午门确立了游客对紫禁城中轴线的第一印象。",
            en: "The gate establishes the visitor's first reading of the palace's central axis.",
          },
        },
        {
          id: "meridian-threshold",
          title: {
            zh: "礼制门槛",
            en: "Ceremonial threshold",
          },
          body: {
            zh: "建筑在这里将到达感转化为仪式性的进入感。",
            en: "Architecture turns arrival into a formalized act of entry.",
          },
        },
      ],
    },
    {
      id: "taihe-gate",
      anchor: { x: 37, y: 52 },
      markerLabel: {
        zh: "太和门",
        en: "Gate of Supreme Harmony",
      },
      panelEyebrow: {
        zh: "外朝递进门槛",
        en: "Outer court progression gate",
      },
      title: {
        zh: "太和门 Gate of Supreme Harmony",
        en: "Gate of Supreme Harmony",
      },
      summary: {
        zh: "太和门通过压缩与释放空间节奏，让外朝的礼制气氛进一步加强。",
        en: "The gate intensifies the outer court by compressing movement and then releasing it into a larger ceremonial field.",
      },
      story: {
        zh: "这一层门槛说明故宫并不是一眼望尽的空间，而是通过层层递进建立等级与期待。",
        en: "This threshold shows that the palace is not meant to be read at a glance. It builds hierarchy through staged progression.",
      },
      panelMedia: {
        src: PALACE_PANORAMA_PLACEHOLDER_SRC,
        alt: {
          zh: "太和门热点展示图",
          en: "Gate of Supreme Harmony hotspot artwork",
        },
      },
      facts: [
        {
          id: "taihe-compression",
          title: {
            zh: "压缩与展开",
            en: "Compression and release",
          },
          body: {
            zh: "门与庭院的组合控制了步行节奏与视线展开方式。",
            en: "The gate-courtyard sequence controls both walking pace and visual release.",
          },
        },
        {
          id: "taihe-hierarchy",
          title: {
            zh: "等级递进",
            en: "Escalating hierarchy",
          },
          body: {
            zh: "每穿过一道门，建筑的礼制等级都会更清晰。",
            en: "Each new threshold clarifies a higher level of ceremonial hierarchy.",
          },
        },
      ],
    },
    {
      id: "hall-of-supreme-harmony",
      anchor: { x: 56, y: 46 },
      markerLabel: {
        zh: "太和殿",
        en: "Hall of Supreme Harmony",
      },
      panelEyebrow: {
        zh: "外朝礼制高点",
        en: "Ceremonial climax of the outer court",
      },
      title: {
        zh: "太和殿 Hall of Supreme Harmony",
        en: "Hall of Supreme Harmony",
      },
      summary: {
        zh: "太和殿以高台、尺度和正面性构成外朝最强的视觉与礼制中心。",
        en: "The hall dominates the outer court through terrace height, scale, and frontal symmetry, forming its strongest ceremonial center.",
      },
      story: {
        zh: "这里是整条路线的高潮点，建筑不再只是空间背景，而成为礼制权力的直接表达。",
        en: "This is the climax of the route, where architecture stops behaving like background and reads as a direct expression of imperial authority.",
      },
      panelMedia: {
        src: PALACE_PANORAMA_PLACEHOLDER_SRC,
        alt: {
          zh: "太和殿热点展示图",
          en: "Hall of Supreme Harmony hotspot artwork",
        },
      },
      facts: [
        {
          id: "taihedian-scale",
          title: {
            zh: "高台与尺度",
            en: "Terrace and scale",
          },
          body: {
            zh: "高台把建筑从地面人群中抬升为礼制核心。",
            en: "The elevated terrace lifts the hall above the plaza and turns it into the ceremonial focus.",
          },
        },
        {
          id: "taihedian-symmetry",
          title: {
            zh: "正面性",
            en: "Frontal authority",
          },
          body: {
            zh: "正对中轴的构图让太和殿成为最明确的权力形象。",
            en: "Its direct frontal relationship to the axis creates the clearest image of authority in the precinct.",
          },
        },
      ],
    },
    {
      id: "inner-court-threshold",
      anchor: { x: 79, y: 56 },
      markerLabel: {
        zh: "内廷过渡",
        en: "Inner Court Threshold",
      },
      panelEyebrow: {
        zh: "由外朝转入内廷",
        en: "Transition toward the inner court",
      },
      title: {
        zh: "内廷过渡 Inner Court Threshold",
        en: "Transition toward the Inner Court",
      },
      summary: {
        zh: "离开太和殿后，路线从宏大的国家礼仪空间，收束到更内向、更贴近宫廷生活的空间层次。",
        en: "Beyond the great ceremonial core, the route narrows toward a more inward sequence connected to residence and court life.",
      },
      story: {
        zh: "这一过渡提醒观者，故宫的秩序并非单一宏伟，而是通过由外到内的层级变化塑造完整体验。",
        en: "This transition reminds the viewer that the palace is not a single grand space. It is a layered world that changes register from outer to inner court.",
      },
      panelMedia: {
        src: PALACE_PANORAMA_PLACEHOLDER_SRC,
        alt: {
          zh: "内廷过渡热点展示图",
          en: "Inner court threshold hotspot artwork",
        },
      },
      facts: [
        {
          id: "inner-register",
          title: {
            zh: "空间收束",
            en: "Spatial tightening",
          },
          body: {
            zh: "建筑尺度和节奏在此开始由公开仪式转向内向秩序。",
            en: "Scale and rhythm start shifting from public spectacle to a more inward order.",
          },
        },
        {
          id: "inner-meaning",
          title: {
            zh: "功能转变",
            en: "Functional shift",
          },
          body: {
            zh: "外朝强调国家礼制，内廷则更加贴近治理与日常宫廷生活。",
            en: "The outer court emphasizes state ritual, while the inner court moves closer to governance and daily palace life.",
          },
        },
      ],
    },
  ],
};
