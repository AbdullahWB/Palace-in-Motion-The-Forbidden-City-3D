import {
  getExploreJourneyById,
  getExploreJourneyStopIndex,
  getExplorePhotoById,
  getExplorePlaceBySlug,
  normalizeExploreSearchState,
} from "@/data/panorama";
import { pickLocalizedText } from "@/lib/i18n";
import type {
  GuideIntent,
  GuideMode,
  GuideRequest,
  GuideResponse,
  GuideSiteActionPayload,
} from "@/types/ai-guide";
import type { ExploreJourneyRouteId, ExplorePlaceSlug } from "@/types/content";
import type { AppLanguage } from "@/types/preferences";

export const COMPANION_HISTORY_STORAGE_KEY = "palace-companion-chat-v1";
export const COMPANION_HISTORY_LIMIT = 30;

export type LocalizedCopy = {
  zh: string;
  en: string;
};

export type CompanionLensId = "palace" | "axis" | "ritual" | "scenery";

export type CompanionLens = {
  id: CompanionLensId;
  glyph: string;
  label: LocalizedCopy;
  title: LocalizedCopy;
  description: LocalizedCopy;
  contextHint: LocalizedCopy;
  focusId: GuideRequest["focusId"];
};

export type CompanionChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string | null;
  response?: GuideResponse | null;
  createdAt: number;
};

export type CompanionRouteContext = {
  key: string;
  kind: "home" | "welcome" | "map" | "place" | "tour" | "model" | "companion";
  label: LocalizedCopy;
  title: LocalizedCopy;
  intro: LocalizedCopy;
  placeSlug?: ExplorePlaceSlug | null;
  routeId?: ExploreJourneyRouteId | null;
  journeyTitle?: string | null;
  journeyDescription?: string | null;
  journeyStopIndex?: number | null;
  journeyStopTotal?: number | null;
  frameCaption?: string | null;
};

type SearchParamsLike = {
  get: (name: string) => string | null;
};

export function localized(zh: string, en: string): LocalizedCopy {
  return { zh, en };
}

export const companionGuideModes: Array<{
  value: GuideMode;
  label: LocalizedCopy;
}> = [
  { value: "short", label: localized("简短", "Short") },
  { value: "detailed", label: localized("详细", "Detailed") },
  { value: "fun", label: localized("趣味", "Fun") },
  { value: "child", label: localized("儿童", "Child") },
  { value: "academic", label: localized("学术", "Academic") },
  { value: "tourist", label: localized("游客", "Tourist") },
  { value: "quiz", label: localized("测验", "Quiz") },
];

export const companionLenses: CompanionLens[] = [
  {
    id: "palace",
    glyph: "P",
    label: localized("宫城", "Palace"),
    title: localized("宫城总览", "Palace overview"),
    description: localized(
      "适合询问整体导览、主要空间和故宫路线结构。",
      "Use this lens for broad orientation, major spaces, and how the full palace route fits together."
    ),
    contextHint: localized(
      "宫城总览，关注整体导览、主要空间与路线结构。",
      "Palace overview focused on broad orientation, major spaces, and route structure."
    ),
    focusId: null,
  },
  {
    id: "axis",
    glyph: "A",
    label: localized("中轴", "Axis"),
    title: localized("中轴秩序", "Central axis"),
    description: localized(
      "适合询问对称、门序、阈限和沿中轴推进的空间逻辑。",
      "Use this lens for alignment, thresholds, procession, and the logic of movement through the palace."
    ),
    contextHint: localized(
      "中轴视角，关注对称、门序、阈限与轴线秩序。",
      "Central axis lens focused on procession, symmetry, thresholds, and axial order."
    ),
    focusId: "central-axis",
  },
  {
    id: "ritual",
    glyph: "R",
    label: localized("礼制", "Ritual"),
    title: localized("礼制意义", "Ritual meaning"),
    description: localized(
      "适合询问朝会等级、礼仪秩序、皇权象征和正式空间意义。",
      "Use this lens for court hierarchy, ceremonial order, imperial symbolism, and formal spatial meaning."
    ),
    contextHint: localized(
      "礼制视角，关注朝会等级、礼仪秩序、皇权象征与空间意义。",
      "Ritual lens focused on court hierarchy, ceremony, imperial symbolism, and formal spatial meaning."
    ),
    focusId: "hall-of-supreme-harmony",
  },
  {
    id: "scenery",
    glyph: "S",
    label: localized("景观", "Scenery"),
    title: localized("景观阅读", "Scenic reading"),
    description: localized(
      "适合询问庭院氛围、取景、光线、层次和视觉记忆点。",
      "Use this lens for atmosphere, courtyards, framing, light, mood, and visual memory."
    ),
    contextHint: localized(
      "景观视角，关注庭院氛围、取景、光线与视觉层次。",
      "Scenery lens focused on atmosphere, courtyards, framing, light, and visual mood."
    ),
    focusId: null,
  },
];

export function getCompanionCopy(language: AppLanguage) {
  if (language === "zh") {
    return {
      title: "AI Palace Companion",
      subtitle: "完整导览中枢",
      miniTitle: "AI Palace Companion",
      openFull: "打开完整助手",
      close: "关闭",
      askPlaceholder: "询问故宫路线、地图、护照或下一站...",
      send: "发送",
      loading: "正在生成回答...",
      error: "AI 助手暂时无法回答。",
      empty: "选择一个提示，或直接询问当前故宫体验。",
      history: "本地聊天记录",
      passport: "护照",
      routes: "路线",
      tools: "工具",
      tourBuilder: "智能路线",
      clearHistory: "清空记录",
      aiLabel: "AI-generated explanation based on palace guide content.",
    };
  }

  return {
    title: "AI Palace Companion",
    subtitle: "Full guide command center",
    miniTitle: "AI Palace Companion",
    openFull: "Open full Companion",
    close: "Close",
    askPlaceholder: "Ask about routes, map, Passport, or the next stop...",
    send: "Send",
    loading: "Generating answer...",
    error: "The AI guide could not answer right now.",
    empty: "Choose a prompt, or ask directly about the current palace experience.",
    history: "Local chat history",
    passport: "Passport",
    routes: "Routes",
    tools: "Tools",
    tourBuilder: "Smart tour",
    clearHistory: "Clear history",
    aiLabel: "AI-generated explanation based on palace guide content.",
  };
}

export function getLensById(lensId: CompanionLensId) {
  return companionLenses.find((lens) => lens.id === lensId) ?? companionLenses[0];
}

export function getDefaultLensId(context: CompanionRouteContext): CompanionLensId {
  if (context.kind === "map") {
    return "axis";
  }

  if (context.kind === "model") {
    return "scenery";
  }

  return "palace";
}

export function buildRouteContextFromUrl(
  pathname: string,
  searchParams: SearchParamsLike,
  language: AppLanguage
): CompanionRouteContext {
  if (pathname === "/3d-view") {
    return {
      key: "three-d-view",
      kind: "model",
      label: localized("3D 视图", "3D view"),
      title: localized("故宫三维模型", "Forbidden City 3D model"),
      intro: localized(
        "询问三维视图如何表达中轴、屋顶层次和宫城空间。",
        "Ask how the 3D view expresses the axis, roof hierarchy, and palace space."
      ),
    };
  }

  if (pathname === "/companion") {
    return {
      key: "companion",
      kind: "companion",
      label: localized("助手中枢", "Companion center"),
      title: localized("AI Palace Companion", "AI Palace Companion"),
      intro: localized(
        "在这里可以集中使用聊天、路线、护照和测验。",
        "Use chat, routes, Passport, and quizzes from one comfortable page."
      ),
    };
  }

  if (pathname === "/" || pathname === "/explore") {
    const searchState = normalizeExploreSearchState({
      view: searchParams.get("view") ?? undefined,
      place: searchParams.get("place") ?? undefined,
      photo: searchParams.get("photo") ?? undefined,
      route: searchParams.get("route") ?? undefined,
    });
    const activeJourney = getExploreJourneyById(searchState.routeId);
    const activePlace = getExplorePlaceBySlug(searchState.placeSlug);
    const activePhoto = getExplorePhotoById(activePlace, searchState.photoId);
    const stopIndex =
      activeJourney && activePlace
        ? getExploreJourneyStopIndex(activeJourney, activePlace.slug)
        : -1;

    if (searchState.view === "place" && activePlace) {
      return {
        key: `place:${activePlace.slug}`,
        kind: "place",
        label: localized("当前场所", "Current place"),
        title: activePlace.title,
        intro: localized(
          "询问这个场所的空间气质、礼制意义或路线位置。",
          "Ask about this place's mood, ritual meaning, or route position."
        ),
        placeSlug: activePlace.slug,
        routeId: activeJourney?.id ?? null,
        journeyTitle: pickLocalizedText(activeJourney?.title, language),
        journeyDescription: pickLocalizedText(
          activeJourney?.description ?? activeJourney?.intro,
          language
        ),
        journeyStopIndex: stopIndex >= 0 ? stopIndex + 1 : null,
        journeyStopTotal: activeJourney?.placeOrder.length ?? null,
        frameCaption: pickLocalizedText(activePhoto?.caption, language),
      };
    }

    if (searchState.view === "map") {
      return {
        key: `map:${activeJourney?.id ?? "all"}`,
        kind: "map",
        label: localized("地图视图", "Map view"),
        title: localized("宫城地图", "Palace map"),
        intro: localized(
          "询问如何读地图、从哪里开始或路线如何展开。",
          "Ask how to read the map, where to begin, or how the route is structured."
        ),
        routeId: activeJourney?.id ?? null,
        journeyTitle: pickLocalizedText(activeJourney?.title, language),
        journeyDescription: pickLocalizedText(
          activeJourney?.description ?? activeJourney?.intro,
          language
        ),
        journeyStopTotal: activeJourney?.placeOrder.length ?? null,
      };
    }

    return {
      key: "explore:welcome",
      kind: "welcome",
      label: localized("探索入口", "Explore welcome"),
      title: localized("入境故宫", "Enter the Palace"),
      intro: localized(
        "先获得快速导览，再打开地图进入主要宫殿场所。",
        "Get a quick orientation before opening the map and entering palace places."
      ),
      routeId: activeJourney?.id ?? null,
    };
  }

  return {
    key: "home",
    kind: "home",
    label: localized("首页", "Home"),
    title: localized("Palace in Motion", "Palace in Motion"),
    intro: localized(
      "询问应用结构、路线或探索功能。",
      "Ask about the app structure, routes, or exploration features."
    ),
  };
}

export function getStarterPrompts(context: CompanionRouteContext) {
  const placeSuffix = context.kind === "place" ? ` (${context.title.en})` : "";

  return [
    localized("打开宫城地图", "Open the palace map"),
    localized("继续我的路线", "Continue my journey"),
    localized("带我去下一站", "Move to the next stop"),
    localized("考考我", "Quiz me"),
    localized("为我规划一条 10 分钟路线", "Build a 10-minute tour"),
    localized("打开护照", "Open Passport"),
    localized("切换到英文", "Switch language to English"),
    localized(
      `解释当前场景${context.kind === "place" ? `：${context.title.zh}` : ""}`,
      `Explain the current context${placeSuffix}`
    ),
  ];
}

export function inferGuideIntent(question: string, mode: GuideMode): GuideIntent {
  const normalizedQuestion = question.toLowerCase();

  if (mode === "quiz" || /quiz|test|question|考|测验/.test(normalizedQuestion)) {
    return "quiz";
  }

  if (
    /build.*tour|tour.*build|short tour|custom tour|recommend.*route|route.*recommend|路线|规划/.test(
      normalizedQuestion
    )
  ) {
    return "tour_builder";
  }

  if (
    /open.*map|show.*map|go.*map|passport|start route|start tour|continue route|next stop|next place|switch.*language|change.*language|set.*language|use.*language|switch.*english|switch.*chinese|switch.*mode|change.*mode|set.*mode|use.*mode|打开.*地图|打开.*护照|行旅簿|护照|下一站|下一处|切换.*语言|切换.*模式/.test(
      normalizedQuestion
    )
  ) {
    return "site_action";
  }

  return "answer";
}

export function formatGuideResponse(data: GuideResponse) {
  if (data.quiz) {
    return [
      data.quiz.question,
      ...data.quiz.options.map(
        (option) => `${option.id.toUpperCase()}. ${option.text}`
      ),
      "",
      `Stamp: ${data.quiz.stampLabel}`,
    ].join("\n");
  }

  if (data.siteAction) {
    return data.siteAction.label;
  }

  return data.answer;
}

export function getSiteActionHref(
  action: GuideSiteActionPayload,
  fallbackRouteId?: ExploreJourneyRouteId | null
) {
  const routeId = action.routeId ?? fallbackRouteId ?? null;
  const routeQuery = routeId ? `&route=${routeId}` : "";

  if (action.command === "open_map") {
    return routeId ? `/?view=map&route=${routeId}` : "/?view=map";
  }

  if (action.command === "open_place" && action.placeSlug) {
    return `/?view=place&place=${action.placeSlug}${routeQuery}`;
  }

  if (
    action.command === "start_route" ||
    action.command === "continue_route" ||
    action.command === "next_stop"
  ) {
    return routeId ? `/?view=map&route=${routeId}` : "/?view=map";
  }

  return null;
}

export function createCompanionMessage(
  role: CompanionChatMessage["role"],
  content: string,
  meta?: string | null,
  response?: GuideResponse | null
): CompanionChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    meta,
    response,
    createdAt: Date.now(),
  };
}

export function sanitizeStoredMessages(value: unknown): CompanionChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((message): message is CompanionChatMessage => {
      if (!message || typeof message !== "object") {
        return false;
      }

      const candidate = message as CompanionChatMessage;
      return (
        (candidate.role === "user" || candidate.role === "assistant") &&
        typeof candidate.content === "string" &&
        typeof candidate.id === "string"
      );
    })
    .slice(-COMPANION_HISTORY_LIMIT);
}
