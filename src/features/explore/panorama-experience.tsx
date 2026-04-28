"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "@/components/ui/hydration-safe-image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { LanguageToggleButton } from "@/components/preferences/language-toggle-button";
import { MusicToggleButton } from "@/components/media/music-toggle-button";
import { ThemeToggleButton } from "@/components/preferences/theme-toggle-button";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { ImmersiveAssetLoadingOverlay } from "@/components/ui/app-status-screens";
import {
  exploreExperience,
  getCompletedJourneyRouteIds,
  getExplorePhotoById,
  getExploreJourneyById,
  getExploreJourneyPlaces,
  getExploreJourneyStopIndex,
  getExploreJourneyVisitedCount,
  getExplorePassportSealByRouteId,
  getExplorePlaceBySlug,
  getUnlockedPassportSealIds,
  normalizeExploreSearchState,
} from "@/data/panorama";
import {
  buildCustomTourRecommendation,
  getPalaceKnowledgeByPlaceSlug,
  getQuizQuestionForPlace,
} from "@/data/palace-knowledge";
import { getPostcardFrameIdForJourneyRoute } from "@/data/selfie";
import { SelfieStudio } from "@/features/selfie/selfie-studio";
import { pickLocalizedText } from "@/lib/i18n";
import { buildTravelDiaryText } from "@/lib/travel-diary";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type {
  ExploreJourneyRoute,
  ExplorePlace,
  ExplorePlacePhoto,
  ExplorePlaceSlug,
  ExploreSearchState,
} from "@/types/content";
import type {
  CustomTourState,
  GuideQuizPayload,
  GuideResponse,
  GuideSiteActionPayload,
  PassportMissionState,
  TourBuilderInterest,
} from "@/types/ai-guide";
import type { AppLanguage } from "@/types/preferences";

type PanoramaExperienceProps = {
  initialState: ExploreSearchState;
};

type ExploreUiCopy = (typeof exploreUiCopy)[keyof typeof exploreUiCopy];
type JourneyProgress = {
  visitedStops: number;
  totalStops: number;
  completionRate: number;
  isCompleted: boolean;
};

type JourneyOnboardingStep = {
  title: string;
  body: string;
};

type PlaceInfoPanelProps = {
  place: ExplorePlace;
  activePhoto: ExplorePlacePhoto;
  language: AppLanguage;
  copy: ExploreUiCopy;
  theme: "dark" | "light";
  compact?: boolean;
};

const exploreUiCopy = {
  zh: {
    brandTitle: "全景故宫",
    brandSubtitle: "全景故宫博物馆",
    home: "首页",
    preparedPlaces: "已准备场景",
    welcome: "欢迎",
    palaceMap: "宫城地图",
    mapInstruction: "拖动或缩放地图，然后点击一个场所进入视图。",
    mappedPlaces: "地点已映射",
    closeMap: "关闭宫城地图",
    zoomOut: "缩小地图",
    zoomIn: "放大地图",
    backToWelcome: "返回欢迎",
    placeView: "场所视图",
    backToMap: "返回地图",
    close: "关闭",
    selfie: "合影",
    sceneFrames: "场景序列",
    views: "张视图",
    activeFrame: "当前画面",
    closeSelfieModal: "关闭合影弹窗",
    threeDView: "3D 视图",
    autoTour: "自动导览",
    tourPaused: "暂停中",
    tourNarrating: "讲解中",
    tourLoading: "生成讲解…",
    tourResume: "继续",
    tourPause: "暂停",
    tourNext: "下一处",
    tourBack: "上一处",
    tourExit: "退出导览",
    tourVoiceOn: "语音开",
    tourVoiceOff: "语音关",
    tourStopTitle: "导览进度",
    tourPhotoLabel: "画面",
  },
  en: {
    brandTitle: "Panoramic Palace",
    brandSubtitle: "The Panoramic Palace Museum",
    home: "Home",
    preparedPlaces: "Prepared places",
    welcome: "Welcome",
    palaceMap: "Palace map",
    mapInstruction: "Drag or zoom the map, then click one place to enter its view.",
    mappedPlaces: "mapped places",
    closeMap: "Close palace map",
    zoomOut: "Zoom out map",
    zoomIn: "Zoom in map",
    backToWelcome: "Back to welcome",
    placeView: "Place view",
    backToMap: "Back to map",
    close: "Close",
    selfie: "Selfie",
    sceneFrames: "Scene frames",
    views: "views",
    activeFrame: "Active frame",
    closeSelfieModal: "Close selfie modal",
    threeDView: "3D View",
    autoTour: "Auto tour",
    tourPaused: "Paused",
    tourNarrating: "Narrating",
    tourLoading: "Generating narration...",
    tourResume: "Resume",
    tourPause: "Pause",
    tourNext: "Next",
    tourBack: "Back",
    tourExit: "Exit tour",
    tourVoiceOn: "Voice on",
    tourVoiceOff: "Voice off",
    tourStopTitle: "Tour progress",
    tourPhotoLabel: "Frame",
  },
} as const;

const journeyUiCopy = {
  zh: {
    passport: "行旅簿",
    startJourney: "开始路线",
    journeyRoutes: "推荐路线",
    journeyReady: "已选路线",
    journeyStops: "站点",
    startRoute: "开始路线",
    clearRoute: "清除路线",
    nextStop: "下一站",
    routeMap: "路线地图",
    freePalace: "全宫浏览",
  },
  en: {
    passport: "Passport",
    startJourney: "Start a journey",
    journeyRoutes: "Journey routes",
    journeyReady: "Journey selected",
    journeyStops: "stops",
    startRoute: "Start route",
    clearRoute: "Clear route",
    nextStop: "Next stop",
    routeMap: "Route map",
    freePalace: "Full palace",
  },
} as const;

const passportActionCopy = {
  zh: {
    openPlace: "打开场所",
    continueRoute: "继续路线",
    nextUnvisited: "下一站",
    mapFallback: "地图图像加载延迟，场所标记仍可使用。",
  },
  en: {
    openPlace: "Open place",
    continueRoute: "Continue route",
    nextUnvisited: "Next stop",
    mapFallback: "Map artwork is delayed. Place markers are still available.",
  },
} as const;

const tourBuilderCopy = {
  zh: {
    eyebrow: "智能路线规划",
    title: "规划我的路线",
    body: "选择时间和兴趣，系统会用本地导览内容与现有宫殿站点生成一条短路线。",
    timeLabel: "时间",
    interestLabel: "兴趣",
    build: "生成路线",
    building: "生成中...",
    start: "开始自定义路线",
    continue: "继续自定义路线",
    active: "当前自定义路线",
    saved: "已保存智能路线",
    fallbackError: "AI 暂不可用，已使用本地导览内容生成路线。",
  },
  en: {
    eyebrow: "Smart tour builder",
    title: "Build my tour",
    body: "Choose your time and interest. The route uses local guide content and existing palace stops.",
    timeLabel: "Time",
    interestLabel: "Interest",
    build: "Build tour",
    building: "Building...",
    start: "Start custom tour",
    continue: "Continue custom tour",
    active: "Active custom tour",
    saved: "Saved smart tour",
    fallbackError: "Tour builder used local guide content because AI was unavailable.",
  },
} as const;

const passportMissionCopy = {
  zh: {
    completion: "完成度",
    quizStamps: "问答印记",
    continueLast: "从上次位置继续",
    missionTitle: "行旅簿问答任务",
    missionBody: "回答一个基于导览内容的问题即可解锁问答印记；到访场所也会解锁到访印记。",
    correct: "回答正确，印记已解锁。",
    incorrect: "还不正确。可以先阅读导览提示，再尝试其他场所。",
    source: "导览来源",
    earned: "已获印记",
    locked: "未盖印",
  },
  en: {
    completion: "Completion",
    quizStamps: "Quiz stamps",
    continueLast: "Continue from last place",
    missionTitle: "Passport quiz missions",
    missionBody: "Answer one grounded question to unlock a quiz stamp. Visiting a place also unlocks its visit stamp.",
    correct: "Correct. Stamp unlocked.",
    incorrect: "Not yet. Review the guide note and try another place.",
    source: "Guide source",
    earned: "Stamp earned",
    locked: "Not stamped",
  },
} as const;

const tourBuilderInterestOptions: Array<{
  value: TourBuilderInterest;
  label: Record<AppLanguage, string>;
}> = [
  { value: "architecture", label: { zh: "建筑", en: "Architecture" } },
  { value: "history", label: { zh: "历史", en: "History" } },
  { value: "gardens", label: { zh: "园林", en: "Gardens" } },
  { value: "photography", label: { zh: "摄影", en: "Photography" } },
  { value: "overview", label: { zh: "快速总览", en: "Quick overview" } },
];

const journeyOnboardingSteps: Record<AppLanguage, JourneyOnboardingStep[]> = {
  zh: [
    {
      title: "选择路线",
      body: "先选一条旅程，地图会突出显示主要站点。",
    },
    {
      title: "进入地图",
      body: "可以手动打开标记，也可以从地图开始路线。",
    },
    {
      title: "收集印记",
      body: "每到访一个场所，行旅簿都会更新并推进路线徽记。",
    },
  ],
  en: [
    {
      title: "Pick a route",
      body: "Choose one journey so the map can highlight its main stops.",
    },
    {
      title: "Enter the map",
      body: "Open a marker manually or start the guided route from the map.",
    },
    {
      title: "Collect stamps",
      body: "Every visited place updates the Passport and unlocks route seals.",
    },
  ],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toSearchString(searchState: ExploreSearchState) {
  const params = new URLSearchParams();

  params.set("view", searchState.view);

  if (searchState.placeSlug) {
    params.set("place", searchState.placeSlug);
  }

  if (searchState.photoId) {
    params.set("photo", searchState.photoId);
  }

  if (searchState.routeId) {
    params.set("route", searchState.routeId);
  }

  return params.toString();
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function estimateNarrationMs(text: string, language: AppLanguage) {
  const trimmed = text.trim();
  if (!trimmed) {
    return 3500;
  }

  if (language === "zh") {
    const charCount = trimmed.replace(/\s+/g, "").length;
    return Math.max(3500, Math.round((charCount / 4.2) * 1000));
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  return Math.max(3500, Math.round(wordCount * 420));
}

function formatJourneyProgressLabel(
  progress: JourneyProgress,
  journeyStopsLabel: string,
  language: AppLanguage
) {
  if (progress.isCompleted) {
    return `${
      language === "zh" ? "å·²å®Œæˆ" : "Completed"
    } · ${progress.visitedStops}/${progress.totalStops} ${journeyStopsLabel}`;
  }

  if (progress.visitedStops > 0) {
    return `${progress.visitedStops}/${progress.totalStops} ${
      language === "zh" ? "å·²è®¿ç«™ç‚¹" : "stops visited"
    }`;
  }

  return `${progress.totalStops} ${
    language === "zh" ? "ç«™å¾…æŽ¢ç´¢" : "stops to explore"
  }`;
}

function getMissionForPlace(
  missionStates: PassportMissionState[],
  placeSlug: ExplorePlaceSlug
) {
  return (
    missionStates.find((mission) => mission.placeSlug === placeSlug) ?? null
  );
}

function isPlaceStamped({
  placeSlug,
  visitedSet,
  missionStates,
}: {
  placeSlug: ExplorePlaceSlug;
  visitedSet: Set<ExplorePlaceSlug>;
  missionStates: PassportMissionState[];
}) {
  return (
    visitedSet.has(placeSlug) ||
    getMissionForPlace(missionStates, placeSlug)?.stampUnlocked === true
  );
}

function buildLocalizedQuizPayload(
  placeSlug: ExplorePlaceSlug,
  language: AppLanguage
): GuideQuizPayload | null {
  const question = getQuizQuestionForPlace(placeSlug);
  const knowledge = getPalaceKnowledgeByPlaceSlug(placeSlug);

  if (!question || !knowledge) {
    return null;
  }

  return {
    placeSlug,
    questionId: question.id,
    question: pickLocalizedText(question.question, language),
    options: question.options.map((option) => ({
      id: option.id,
      text: pickLocalizedText(option.text, language),
    })),
    correctOptionId: question.correctOptionId,
    explanation: pickLocalizedText(question.explanation, language),
    stampLabel: pickLocalizedText(question.stampLabel, language),
    sourceNote: pickLocalizedText(knowledge.sourceNote, language),
  };
}

function PlaceInfoPanel({
  place,
  activePhoto,
  language,
  copy,
  theme,
  compact = false,
}: PlaceInfoPanelProps) {
  const isDarkTheme = theme === "dark";
  const knowledge = getPalaceKnowledgeByPlaceSlug(place.slug);
  const accentTextClass = isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft";
  const paragraphTextClass = isDarkTheme ? "text-white" : "text-foreground";
  const secondaryParagraphTextClass = isDarkTheme
    ? "text-white/76"
    : "text-foreground/78";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.8rem] border shadow-[0_28px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl",
        isDarkTheme
          ? "border-[#d6b071]/28 bg-[rgba(8,12,20,0.76)] text-white"
          : "border-border/70 bg-[rgba(255,248,240,0.86)] text-foreground",
        compact ? "max-h-[32svh]" : "max-h-[70svh]"
      )}
    >
      <div
        className={cn(
          "h-full overflow-y-auto",
          compact ? "px-4 py-4" : "px-6 py-6"
        )}
      >
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.28em]",
            accentTextClass
          )}
        >
          {pickLocalizedText(place.badgeLabel, language)}
        </p>

        <p
          className={cn(
            "mt-4 font-display",
            paragraphTextClass,
            compact ? "text-3xl" : "text-4xl leading-tight"
          )}
        >
          {pickLocalizedText(place.title, language)}
        </p>

        <div
          className={cn(
            "mt-5 rounded-[1.35rem] border p-4",
            isDarkTheme ? "border-white/10 bg-white/7" : "border-border/80 bg-background/82"
          )}
        >
          <p className={cn("text-sm leading-7", paragraphTextClass)}>
            {pickLocalizedText(place.shortDescription, language)}
          </p>
        </div>

        <div
          className={cn(
            "mt-5 rounded-[1.35rem] border p-4",
            isDarkTheme ? "border-[#d6b071]/20 bg-[#d6b071]/8" : "border-accent-soft/20 bg-accent-soft/8"
          )}
        >
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", accentTextClass)}>
            {copy.activeFrame}
          </p>
          <p className={cn("mt-3 text-sm font-semibold", paragraphTextClass)}>
            {pickLocalizedText(activePhoto.caption, language)}
          </p>
        </div>

        <p className={cn("mt-5 text-sm leading-8", secondaryParagraphTextClass)}>
          {pickLocalizedText(place.longDescription, language)}
        </p>

        {knowledge ? (
          <div
            className={cn(
              "mt-5 rounded-[1.35rem] border p-4",
              isDarkTheme
                ? "border-[#d6b071]/20 bg-[#d6b071]/8"
                : "border-accent-soft/20 bg-accent-soft/8"
            )}
          >
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", accentTextClass)}>
              {language === "zh" ? "遗产保护说明" : "Preservation note"}
            </p>
            <p className={cn("mt-3 text-sm leading-7", secondaryParagraphTextClass)}>
              {pickLocalizedText(knowledge.preservationNote, language)}
            </p>
            <p className={cn("mt-3 text-[11px] font-semibold uppercase tracking-[0.18em]", accentTextClass)}>
              {language === "zh" ? "来源" : "Source"}:{" "}
              {pickLocalizedText(knowledge.sourceTitle, language)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type JourneyRouteCardProps = {
  journey: ExploreJourneyRoute;
  progress: JourneyProgress;
  language: AppLanguage;
  journeyStopsLabel: string;
  theme: "dark" | "light";
  isSelected: boolean;
  compact?: boolean;
  onSelect: (routeId: ExploreJourneyRoute["id"]) => void;
};

function JourneyRouteCard({
  journey,
  progress,
  language,
  journeyStopsLabel,
  theme,
  isSelected,
  compact = false,
  onSelect,
}: JourneyRouteCardProps) {
  const isDarkTheme = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => onSelect(journey.id)}
      className={cn(
        "group relative overflow-hidden rounded-[1.35rem] border text-left transition-transform hover:-translate-y-0.5",
        compact ? "w-full p-3" : "min-h-44 p-3",
        isSelected
          ? isDarkTheme
            ? "border-[#f1d8b2]/50 bg-white/12"
            : "border-accent-soft/40 bg-accent-soft/10"
          : isDarkTheme
            ? "border-white/10 bg-white/6 hover:bg-white/10"
            : "border-border/70 bg-background/72 hover:bg-background/88"
      )}
    >
      <div className={cn("relative overflow-hidden rounded-[1rem]", compact ? "h-20" : "h-28")}>
        <Image
          src={encodeURI(journey.coverSrc)}
          alt={pickLocalizedText(journey.title, language)}
          fill
          sizes={compact ? "12rem" : "(max-width: 768px) 100vw, 18rem"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,14,0.02),rgba(7,9,14,0.68))]" />
        <span
          className="absolute left-3 top-3 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#24170d]"
          style={{ backgroundColor: journey.accent }}
          suppressHydrationWarning
        >
          {pickLocalizedText(journey.title, language)}
        </span>
      </div>
      <div className="mt-3">
        <p className={cn("text-sm font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
          {pickLocalizedText(journey.description, language)}
        </p>
        <div className="mt-3">
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.18em]",
              progress.isCompleted
                ? isDarkTheme
                  ? "text-[#f1d8b2]"
                  : "text-accent-soft"
                : isDarkTheme
                  ? "text-white/62"
                  : "text-foreground/58"
            )}
          >
            {formatJourneyProgressLabel(progress, journeyStopsLabel, language)}
          </p>
          <div
            className={cn(
              "mt-2 h-1.5 overflow-hidden rounded-full",
              isDarkTheme ? "bg-white/10" : "bg-black/8"
            )}
          >
            <div
              className="h-full rounded-full transition-[width]"
              style={{
                width: `${progress.completionRate}%`,
                backgroundColor: journey.accent,
              }}
              suppressHydrationWarning
            />
          </div>
        </div>
        {!compact ? (
          <p
            className={cn(
              "mt-2 text-xs leading-6",
              isDarkTheme ? "text-white/72" : "text-foreground/70"
            )}
          >
            {pickLocalizedText(journey.intro, language)}
          </p>
        ) : null}
      </div>
    </button>
  );
}

type PersonalizedTourBuilderProps = {
  language: AppLanguage;
  theme: "dark" | "light";
  selectedTimeBudget: 5 | 10 | 20;
  selectedInterests: TourBuilderInterest[];
  customTour: CustomTourState | null;
  isBuilding: boolean;
  error: string | null;
  onTimeBudgetChange: (timeBudget: 5 | 10 | 20) => void;
  onToggleInterest: (interest: TourBuilderInterest) => void;
  onBuildTour: () => void;
  onStartTour: () => void;
};

function PersonalizedTourBuilder({
  language,
  theme,
  selectedTimeBudget,
  selectedInterests,
  customTour,
  isBuilding,
  error,
  onTimeBudgetChange,
  onToggleInterest,
  onBuildTour,
  onStartTour,
}: PersonalizedTourBuilderProps) {
  const isDarkTheme = theme === "dark";
  const copy = tourBuilderCopy[language];

  return (
    <section
      className={cn(
        "rounded-[1.55rem] border p-4 text-left",
        isDarkTheme
          ? "border-[#d6b071]/20 bg-[#d6b071]/8"
          : "border-accent-soft/20 bg-accent-soft/8"
      )}
    >
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.24em]",
          isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
        )}
      >
        {copy.eyebrow}
      </p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className={cn("text-xl font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
            {copy.title}
          </h3>
          <p className={cn("mt-2 text-sm leading-7", isDarkTheme ? "text-white/72" : "text-foreground/70")}>
            {copy.body}
          </p>
        </div>
        {customTour ? (
          <span
            className={cn(
              "w-fit rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isDarkTheme
                ? "border-[#d6b071]/24 bg-[#d6b071]/12 text-[#f5ddb4]"
                : "border-accent-soft/24 bg-background/74 text-accent-strong"
            )}
          >
            {copy.saved}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", isDarkTheme ? "text-white/58" : "text-foreground/58")}>
            {copy.timeLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[5, 10, 20].map((timeBudget) => {
              const isActive = selectedTimeBudget === timeBudget;

              return (
                <button
                  key={timeBudget}
                  type="button"
                  onClick={() => onTimeBudgetChange(timeBudget as 5 | 10 | 20)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    isActive
                      ? isDarkTheme
                        ? "border-[#d6b071] bg-[#d6b071] text-black"
                        : "border-accent bg-accent text-white"
                      : isDarkTheme
                        ? "border-white/12 bg-white/8 text-white/72 hover:bg-white/12"
                        : "border-border/70 bg-background/72 text-foreground/72 hover:bg-background"
                  )}
                >
                  {timeBudget} min
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", isDarkTheme ? "text-white/58" : "text-foreground/58")}>
            {copy.interestLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tourBuilderInterestOptions.map((option) => {
              const isActive = selectedInterests.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggleInterest(option.value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    isActive
                      ? isDarkTheme
                        ? "border-[#d6b071] bg-[#d6b071] text-black"
                        : "border-accent bg-accent text-white"
                      : isDarkTheme
                        ? "border-white/12 bg-white/8 text-white/72 hover:bg-white/12"
                        : "border-border/70 bg-background/72 text-foreground/72 hover:bg-background"
                  )}
                >
                  {option.label[language]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {customTour ? (
        <div
          className={cn(
            "mt-4 rounded-[1.15rem] border p-4",
            isDarkTheme ? "border-white/10 bg-white/7" : "border-border/70 bg-background/74"
          )}
        >
          <p className={cn("text-sm font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
            {customTour.title}
          </p>
          <p className={cn("mt-2 text-sm leading-7", isDarkTheme ? "text-white/72" : "text-foreground/70")}>
            {customTour.explanation}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {customTour.orderedPlaceSlugs.map((placeSlug, index) => {
              const place = getExplorePlaceBySlug(placeSlug);

              return (
                <span
                  key={placeSlug}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                    isDarkTheme
                      ? "border-white/12 bg-white/8 text-white/72"
                      : "border-border/70 bg-background/72 text-foreground/72"
                  )}
                >
                  {index + 1}. {pickLocalizedText(place?.title, language)}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className={cn("mt-3 text-xs font-semibold", isDarkTheme ? "text-[#f5ddb4]" : "text-accent-strong")}>
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBuildTour}
          disabled={isBuilding}
          className={cn(
            "rounded-full border px-5 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-60",
            isDarkTheme
              ? "border-[#d6b071]/30 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
              : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
          )}
        >
          {isBuilding ? copy.building : copy.build}
        </button>
        {customTour ? (
          <button
            type="button"
            onClick={onStartTour}
            className={cn(
              "rounded-full border px-5 py-3 text-sm font-semibold",
              isDarkTheme
                ? "border-white/14 bg-white/10 text-white hover:bg-white/16"
                : "border-border/70 bg-background/80 text-foreground hover:bg-background"
            )}
          >
            {copy.start}
          </button>
        ) : null}
      </div>
    </section>
  );
}

type PassportDrawerProps = {
  language: AppLanguage;
  theme: "dark" | "light";
  visitedPlaceSlugs: ExplorePlaceSlug[];
  completedRouteIds: ExploreJourneyRoute["id"][];
  unlockedSealIds: string[];
  journeyProgressById: Map<ExploreJourneyRoute["id"], JourneyProgress>;
  missionStates: PassportMissionState[];
  activeCustomTour: CustomTourState | null;
  customTours: CustomTourState[];
  activeCustomTourId: string | null;
  activeExploreRouteId: ExploreJourneyRoute["id"] | null;
  overallCompletionRate: number;
  onOpenPlace: (placeSlug: ExplorePlaceSlug) => void;
  onOpenRouteMap: (routeId: ExploreJourneyRoute["id"]) => void;
  onContinueRoute: (routeId: ExploreJourneyRoute["id"]) => void;
  onContinueFromLastPlace: () => void;
  onAnswerQuiz: (placeSlug: ExplorePlaceSlug, isCorrect: boolean) => void;
  onClose: () => void;
  onReset: () => void;
};

function PassportDrawer({
  language,
  theme,
  visitedPlaceSlugs,
  completedRouteIds,
  unlockedSealIds,
  journeyProgressById,
  missionStates,
  activeCustomTour,
  customTours,
  activeCustomTourId,
  activeExploreRouteId,
  overallCompletionRate,
  onOpenPlace,
  onOpenRouteMap,
  onContinueRoute,
  onContinueFromLastPlace,
  onAnswerQuiz,
  onClose,
  onReset,
}: PassportDrawerProps) {
  const isDarkTheme = theme === "dark";
  const passport = exploreExperience.passport;
  const actionCopy = passportActionCopy[language];
  const missionCopy = passportMissionCopy[language];
  const visitedSet = new Set(visitedPlaceSlugs);
  const completedSet = new Set(completedRouteIds);
  const unlockedSealSet = new Set(unlockedSealIds);
  const quizStampCount = missionStates.filter((mission) => mission.stampUnlocked).length;
  const selectedQuizPlaceSlug =
    exploreExperience.places.find(
      (place) =>
        !isPlaceStamped({
          placeSlug: place.slug,
          visitedSet,
          missionStates,
        })
    )?.slug ?? exploreExperience.places[0]?.slug;
  const selectedQuiz = selectedQuizPlaceSlug
    ? buildLocalizedQuizPayload(selectedQuizPlaceSlug, language)
    : null;
  const [diaryGeneratedAt, setDiaryGeneratedAt] = useState(0);
  const [diaryCopyStatus, setDiaryCopyStatus] = useState<
    "idle" | "copied" | "error"
  >("idle");
  const travelDiaryText = useMemo(
    () =>
      buildTravelDiaryText({
        language,
        visitedPlaceSlugs,
        passportMissions: missionStates,
        customTours,
        activeCustomTourId,
        activeExploreRouteId,
        generatedAt: diaryGeneratedAt,
      }),
    [
      activeCustomTourId,
      activeExploreRouteId,
      customTours,
      diaryGeneratedAt,
      language,
      missionStates,
      visitedPlaceSlugs,
    ]
  );

  async function copyTravelDiary() {
    try {
      await window.navigator.clipboard.writeText(travelDiaryText);
      setDiaryCopyStatus("copied");
    } catch {
      setDiaryCopyStatus("error");
    }
  }

  function printTravelDiary() {
    const printWindow = window.open("", "palace-travel-diary", "width=820,height=920");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Palace in Motion Travel Diary</title>
          <style>
            body { font-family: Georgia, serif; padding: 32px; line-height: 1.7; color: #211712; }
            pre { white-space: pre-wrap; font: inherit; }
          </style>
        </head>
        <body><pre>${travelDiaryText
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden border-l shadow-[-24px_0_90px_rgba(0,0,0,0.26)] backdrop-blur-2xl",
        isDarkTheme
          ? "border-white/12 bg-[rgba(8,12,20,0.9)] text-white"
          : "border-border/70 bg-[rgba(255,248,240,0.94)] text-foreground"
      )}
      role="dialog"
      aria-modal="true"
      aria-label={pickLocalizedText(passport.title, language)}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.28em]",
                  isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
                )}
              >
                {pickLocalizedText(passport.title, language)}
              </p>
              <p className={cn("mt-3 text-sm leading-7", isDarkTheme ? "text-white/76" : "text-foreground/74")}>
                {pickLocalizedText(passport.subtitle, language)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border text-lg",
                isDarkTheme
                  ? "border-white/14 bg-white/10 text-white hover:bg-white/16"
                  : "border-border/70 bg-background/82 text-foreground hover:bg-background"
              )}
              aria-label={pickLocalizedText(passport.closeLabel, language)}
            >
              ×
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div
              className={cn(
                "rounded-[1.25rem] border px-4 py-4",
                isDarkTheme ? "border-white/10 bg-white/6" : "border-border/70 bg-background/72"
              )}
            >
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
                {pickLocalizedText(passport.visitedSummaryLabel, language)}
              </p>
              <p className={cn("mt-3 text-2xl font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
                {visitedPlaceSlugs.length}/{exploreExperience.places.length}
              </p>
            </div>
            <div
              className={cn(
                "rounded-[1.25rem] border px-4 py-4",
                isDarkTheme ? "border-white/10 bg-white/6" : "border-border/70 bg-background/72"
              )}
            >
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
                {pickLocalizedText(passport.completedSummaryLabel, language)}
              </p>
              <p className={cn("mt-3 text-2xl font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
                {completedRouteIds.length}/{exploreExperience.journeys.length}
              </p>
            </div>
            <div
              className={cn(
                "rounded-[1.25rem] border px-4 py-4",
                isDarkTheme ? "border-white/10 bg-white/6" : "border-border/70 bg-background/72"
              )}
            >
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
                {missionCopy.quizStamps}
              </p>
              <p className={cn("mt-3 text-2xl font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
                {quizStampCount}/{exploreExperience.places.length}
              </p>
            </div>
            <div
              className={cn(
                "rounded-[1.25rem] border px-4 py-4",
                isDarkTheme ? "border-white/10 bg-white/6" : "border-border/70 bg-background/72"
              )}
            >
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
                {missionCopy.completion}
              </p>
              <p className={cn("mt-3 text-2xl font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
                {overallCompletionRate}%
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinueFromLastPlace}
            className={cn(
              "mt-4 w-full rounded-full border px-4 py-3 text-sm font-semibold",
              isDarkTheme
                ? "border-[#d6b071]/28 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
                : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
            )}
          >
            {activeCustomTour
              ? `${missionCopy.continueLast}: ${activeCustomTour.title}`
              : missionCopy.continueLast}
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section>
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
              {pickLocalizedText(passport.placeCollectionLabel, language)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {exploreExperience.places.map((place) => {
                const isVisited = visitedSet.has(place.slug);
                const mission = getMissionForPlace(missionStates, place.slug);
                const isStamped =
                  isVisited || mission?.stampUnlocked === true;

                return (
                  <button
                    type="button"
                    onClick={() => onOpenPlace(place.slug)}
                    aria-label={`${actionCopy.openPlace}: ${pickLocalizedText(place.title, language)}`}
                    key={place.slug}
                    className={cn(
                      "overflow-hidden rounded-[1.15rem] border text-left transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d6b071]",
                      isStamped
                        ? isDarkTheme
                          ? "border-[#f1d8b2]/26 bg-white/6"
                          : "border-accent-soft/28 bg-accent-soft/10"
                        : isDarkTheme
                          ? "border-white/8 bg-white/4"
                          : "border-border/70 bg-background/58"
                    )}
                  >
                    <div className="relative h-20">
                      <Image
                        src={encodeURI(place.coverSrc)}
                        alt={pickLocalizedText(place.title, language)}
                        fill
                        sizes="10rem"
                        className={cn("object-cover", isStamped ? "opacity-100" : "opacity-45 grayscale")}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,14,0.04),rgba(7,9,14,0.72))]" />
                    </div>
                    <div className="px-3 py-3">
                      <p className={cn("text-sm font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
                        {pickLocalizedText(place.title, language)}
                      </p>
                      <p className={cn("mt-1 text-[11px] uppercase tracking-[0.18em]", isStamped ? (isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft") : (isDarkTheme ? "text-white/42" : "text-foreground/46"))}>
                        {isVisited
                          ? pickLocalizedText(passport.completedLabel, language)
                          : mission?.stampUnlocked
                            ? missionCopy.earned
                            : `${place.gallery.length} ${language === "zh" ? "画面" : "frames"}`}
                      </p>
                      <p className={cn("mt-2 text-[11px] font-semibold", isDarkTheme ? "text-white/58" : "text-foreground/58")}>
                        {actionCopy.openPlace}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
              {missionCopy.missionTitle}
            </p>
            <p className={cn("mt-2 text-sm leading-7", isDarkTheme ? "text-white/72" : "text-foreground/70")}>
              {missionCopy.missionBody}
            </p>
            {selectedQuiz && selectedQuizPlaceSlug ? (
              <div
                className={cn(
                  "mt-4 rounded-[1.2rem] border px-4 py-4",
                  isDarkTheme ? "border-white/10 bg-white/6" : "border-border/70 bg-background/68"
                )}
              >
                <p className={cn("text-sm font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
                  {pickLocalizedText(
                    getExplorePlaceBySlug(selectedQuizPlaceSlug)?.title,
                    language
                  )}
                </p>
                <p className={cn("mt-3 text-sm leading-7", isDarkTheme ? "text-white/76" : "text-foreground/76")}>
                  {selectedQuiz.question}
                </p>
                <div className="mt-3 grid gap-2">
                  {selectedQuiz.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        onAnswerQuiz(
                          selectedQuiz.placeSlug,
                          option.id === selectedQuiz.correctOptionId
                        )
                      }
                      className={cn(
                        "rounded-[1rem] border px-3 py-3 text-left text-sm font-semibold",
                        isDarkTheme
                          ? "border-white/10 bg-white/8 text-white/78 hover:bg-white/12"
                          : "border-border/70 bg-background/80 text-foreground/78 hover:bg-background"
                      )}
                    >
                      {option.id.toUpperCase()}. {option.text}
                    </button>
                  ))}
                </div>
                <p className={cn("mt-3 text-xs leading-6", isDarkTheme ? "text-white/58" : "text-foreground/58")}>
                  {missionCopy.source}: {selectedQuiz.sourceNote}
                </p>
              </div>
            ) : null}
          </section>

          <section>
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
              Travel diary
            </p>
            <div
              className={cn(
                "mt-4 rounded-[1.2rem] border px-4 py-4",
                isDarkTheme
                  ? "border-[#d6b071]/22 bg-[#d6b071]/8"
                  : "border-accent-soft/24 bg-accent-soft/8"
              )}
            >
              <p className={cn("max-h-52 overflow-y-auto whitespace-pre-wrap text-sm leading-7", isDarkTheme ? "text-white/76" : "text-foreground/76")}>
                {travelDiaryText}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyTravelDiary}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold",
                    isDarkTheme
                      ? "border-white/14 bg-white/10 text-white hover:bg-white/16"
                      : "border-border/70 bg-background/80 text-foreground hover:bg-background"
                  )}
                >
                  {diaryCopyStatus === "copied" ? "Copied" : "Copy diary"}
                </button>
                <button
                  type="button"
                  onClick={printTravelDiary}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold",
                    isDarkTheme
                      ? "border-white/14 bg-white/10 text-white hover:bg-white/16"
                      : "border-border/70 bg-background/80 text-foreground hover:bg-background"
                  )}
                >
                  Print / PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiaryGeneratedAt(Date.now());
                    setDiaryCopyStatus("idle");
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold",
                    isDarkTheme
                      ? "border-[#d6b071]/30 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
                      : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
                  )}
                >
                  Regenerate
                </button>
              </div>
              {diaryCopyStatus === "error" ? (
                <p className="mt-3 text-xs text-red-400">
                  Copy failed. Use Print / PDF instead.
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
              {pickLocalizedText(passport.routeSealsLabel, language)}
            </p>
            <div className="mt-4 space-y-3">
              {passport.routeSeals.map((seal) => {
                const isUnlocked = unlockedSealSet.has(seal.id) || completedSet.has(seal.routeId);
                const route = getExploreJourneyById(seal.routeId);
                const nextPlaceSlug =
                  route?.placeOrder.find((placeSlug) => !visitedSet.has(placeSlug)) ??
                  route?.placeOrder[0] ??
                  null;
                const nextPlace = getExplorePlaceBySlug(nextPlaceSlug);
                const progress = journeyProgressById.get(seal.routeId) ?? {
                  visitedStops: 0,
                  totalStops: getExploreJourneyById(seal.routeId)?.placeOrder.length ?? 0,
                  completionRate: 0,
                  isCompleted: false,
                };

                return (
                  <div
                    key={seal.id}
                    className={cn(
                      "rounded-[1.2rem] border px-4 py-4",
                      isUnlocked
                        ? isDarkTheme
                          ? "border-white/14 bg-white/8"
                          : "border-accent-soft/24 bg-accent-soft/10"
                        : isDarkTheme
                          ? "border-white/8 bg-white/4"
                          : "border-border/70 bg-background/58"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 h-12 w-12 shrink-0 rounded-full border"
                        style={{
                          backgroundColor: `${seal.accent}${isUnlocked ? "22" : "14"}`,
                          borderColor: `${seal.accent}${isUnlocked ? "aa" : "55"}`,
                        }}
                        suppressHydrationWarning
                      />
                      <div>
                        <p className={cn("text-sm font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
                          {pickLocalizedText(seal.title, language)}
                        </p>
                        <p className={cn("mt-2 text-xs leading-6", isDarkTheme ? "text-white/72" : "text-foreground/70")}>
                          {pickLocalizedText(seal.description, language)}
                        </p>
                        <p className={cn("mt-2 text-[11px] uppercase tracking-[0.18em]", isUnlocked ? (isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft") : (isDarkTheme ? "text-white/42" : "text-foreground/46"))}>
                          {formatJourneyProgressLabel(
                            progress,
                            language === "zh" ? "ç«™ç‚¹" : "stops",
                            language
                          )}
                        </p>
                        {nextPlace ? (
                          <p className={cn("mt-2 text-xs", isDarkTheme ? "text-white/62" : "text-foreground/62")}>
                            {actionCopy.nextUnvisited}: {pickLocalizedText(nextPlace.title, language)}
                          </p>
                        ) : null}
                        <div
                          className={cn(
                            "mt-3 h-1.5 overflow-hidden rounded-full",
                            isDarkTheme ? "bg-white/10" : "bg-black/8"
                          )}
                        >
                          <div
                            className="h-full rounded-full transition-[width]"
                            style={{
                              width: `${progress.completionRate}%`,
                              backgroundColor: seal.accent,
                            }}
                            suppressHydrationWarning
                          />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onContinueRoute(seal.routeId)}
                            className={cn(
                              "rounded-full border px-3 py-2 text-xs font-semibold",
                              isDarkTheme
                                ? "border-[#d6b071]/28 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
                                : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
                            )}
                          >
                            {actionCopy.continueRoute}
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenRouteMap(seal.routeId)}
                            className={cn(
                              "rounded-full border px-3 py-2 text-xs font-semibold",
                              isDarkTheme
                                ? "border-white/14 bg-white/10 text-white hover:bg-white/16"
                                : "border-border/70 bg-background/80 text-foreground hover:bg-background"
                            )}
                          >
                            {journeyUiCopy[language].routeMap}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onReset}
            className={cn(
              "w-full rounded-full border px-4 py-3 text-sm font-semibold",
              isDarkTheme
                ? "border-white/14 bg-white/10 text-white hover:bg-white/16"
                : "border-border/70 bg-background/80 text-foreground hover:bg-background"
            )}
          >
            {pickLocalizedText(passport.resetLabel, language)}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PanoramaExperience({
  initialState,
}: PanoramaExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { language, theme } = useSitePreferences();
  const ui = exploreUiCopy[language];
  const journeyUi = journeyUiCopy[language];
  const isDarkTheme = theme === "dark";

  const visitedExplorePlaceSlugs = useAppStore(
    (state) => state.visitedExplorePlaceSlugs
  );
  const markExplorePlaceVisited = useAppStore(
    (state) => state.markExplorePlaceVisited
  );
  const activeExploreRouteId = useAppStore((state) => state.activeExploreRouteId);
  const setActiveExploreRoute = useAppStore((state) => state.setActiveExploreRoute);
  const passportMissions = useAppStore((state) => state.passportMissions);
  const answerPassportMission = useAppStore(
    (state) => state.answerPassportMission
  );
  const customTours = useAppStore((state) => state.customTours);
  const activeCustomTourId = useAppStore((state) => state.activeCustomTourId);
  const saveCustomTour = useAppStore((state) => state.saveCustomTour);
  const setActiveCustomTour = useAppStore((state) => state.setActiveCustomTour);
  const setCustomTourProgress = useAppStore(
    (state) => state.setCustomTourProgress
  );
  const resetExploreProgress = useAppStore((state) => state.resetExploreProgress);
  const accessibilityPreferences = useAppStore(
    (state) => state.accessibilityPreferences
  );
  const reduceMotion =
    prefersReducedMotion || accessibilityPreferences.reduceMotion;

  const [mapScale, setMapScale] = useState(exploreExperience.map.initialScale);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isAutoTourActive, setIsAutoTourActive] = useState(false);
  const [isAutoTourPaused, setIsAutoTourPaused] = useState(false);
  const [autoTourPlaceIndex, setAutoTourPlaceIndex] = useState(0);
  const [autoTourPhotoIndex, setAutoTourPhotoIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoTourNarration, setAutoTourNarration] = useState("");
  const [autoTourError, setAutoTourError] = useState("");
  const [isAutoTourLoading, setIsAutoTourLoading] = useState(false);
  const [isBackdropImageLoaded, setIsBackdropImageLoaded] = useState(false);
  const [isWelcomeVideoLoaded, setIsWelcomeVideoLoaded] = useState(false);
  const [isMapImageLoaded, setIsMapImageLoaded] = useState(false);
  const [mapImageError, setMapImageError] = useState(false);
  const [selectedTourTimeBudget, setSelectedTourTimeBudget] =
    useState<5 | 10 | 20>(10);
  const [selectedTourInterests, setSelectedTourInterests] = useState<
    TourBuilderInterest[]
  >(["overview"]);
  const [isBuildingCustomTour, setIsBuildingCustomTour] = useState(false);
  const [customTourError, setCustomTourError] = useState<string | null>(null);

  const mapDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);

  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const smoothX = useSpring(panX, { stiffness: 90, damping: 22, mass: 0.5 });
  const smoothY = useSpring(panY, { stiffness: 90, damping: 22, mass: 0.5 });
  const narrationCacheRef = useRef<Map<string, string>>(new Map());
  const autoTourTimerRef = useRef<number | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const searchKey = searchParams.toString();
  const liveSearchState = normalizeExploreSearchState({
    view: searchParams.get("view") ?? undefined,
    place: searchParams.get("place") ?? undefined,
    photo: searchParams.get("photo") ?? undefined,
    route: searchParams.get("route") ?? undefined,
  });
  const searchState = searchKey ? liveSearchState : initialState;

  const activeJourney =
    getExploreJourneyById(searchState.routeId) ??
    getExploreJourneyById(activeExploreRouteId) ??
    null;
  const activeCustomTour =
    customTours.find((tour) => tour.id === activeCustomTourId) ?? null;
  const activePlace = getExplorePlaceBySlug(searchState.placeSlug);
  const deferredPhotoId = useDeferredValue(searchState.photoId);
  const activePhoto = getExplorePhotoById(activePlace, deferredPhotoId);
  const activeJourneyPlaces = useMemo(
    () => getExploreJourneyPlaces(activeJourney),
    [activeJourney]
  );
  const activeJourneyPlaceSet = useMemo(
    () => new Set(activeJourney?.placeOrder ?? []),
    [activeJourney]
  );
  const activeMapPlaceSet = useMemo(
    () =>
      new Set(
        activeCustomTour?.orderedPlaceSlugs ?? activeJourney?.placeOrder ?? []
      ),
    [activeCustomTour, activeJourney]
  );
  const activeMapOrderMap = useMemo(
    () =>
      new Map(
        (activeCustomTour?.orderedPlaceSlugs ?? activeJourney?.placeOrder ?? []).map(
          (placeSlug, index) => [placeSlug, index + 1]
        )
      ),
    [activeCustomTour, activeJourney]
  );
  const hasMapRouteFocus = Boolean(activeCustomTour || activeJourney);
  const completedExploreRouteIds = useMemo(
    () => getCompletedJourneyRouteIds(visitedExplorePlaceSlugs),
    [visitedExplorePlaceSlugs]
  );
  const unlockedPassportSealIds = useMemo(
    () => getUnlockedPassportSealIds(completedExploreRouteIds),
    [completedExploreRouteIds]
  );
  const stampedPlaceCount = useMemo(() => {
    const visitedSet = new Set(visitedExplorePlaceSlugs);

    return exploreExperience.places.filter((place) =>
      isPlaceStamped({
        placeSlug: place.slug,
        visitedSet,
        missionStates: passportMissions,
      })
    ).length;
  }, [passportMissions, visitedExplorePlaceSlugs]);
  const overallPassportCompletionRate = useMemo(() => {
    const totalUnits =
      exploreExperience.places.length + exploreExperience.journeys.length;
    const earnedUnits = stampedPlaceCount + completedExploreRouteIds.length;

    return totalUnits ? Math.round((earnedUnits / totalUnits) * 100) : 0;
  }, [completedExploreRouteIds.length, stampedPlaceCount]);
  const journeyProgressById = useMemo(
    () =>
      new Map(
        exploreExperience.journeys.map((journey) => {
          const visitedStops = getExploreJourneyVisitedCount(
            journey,
            visitedExplorePlaceSlugs
          );
          const totalStops = journey.placeOrder.length;

          return [
            journey.id,
            {
              visitedStops,
              totalStops,
              completionRate: totalStops
                ? Math.round((visitedStops / totalStops) * 100)
                : 0,
              isCompleted: visitedStops === totalStops,
            },
          ] as const;
        })
      ),
    [visitedExplorePlaceSlugs]
  );
  const activeJourneyProgress = activeJourney
    ? journeyProgressById.get(activeJourney.id) ?? null
    : null;
  const activeJourneySeal = getExplorePassportSealByRouteId(activeJourney?.id);
  const isActiveJourneyCompleted = activeJourney
    ? completedExploreRouteIds.includes(activeJourney.id)
    : false;
  const activeJourneyStopIndex =
    activePlace && activeJourney
      ? getExploreJourneyStopIndex(activeJourney, activePlace.slug)
      : -1;
  const visitedCount = visitedExplorePlaceSlugs.length;
  const showWelcomeVideo =
    searchState.view === "welcome" &&
    Boolean(exploreExperience.welcome.heroVideoSrc);
  const normalizeImageSrc = (src: string | null | undefined) =>
    src ? encodeURI(src) : src;
  const activePhotoSrc = normalizeImageSrc(activePhoto?.src);
  const activeCoverSrc = normalizeImageSrc(activePlace?.coverSrc);
  const welcomeHeroSrc = normalizeImageSrc(exploreExperience.welcome.heroSrc);
  const mapImageSrc =
    normalizeImageSrc(exploreExperience.map.imageSrc) ?? exploreExperience.map.imageSrc;
  const fullTourPlaces = useMemo(() => {
    const placeMap = new Map(
      exploreExperience.places.map((place) => [place.slug, place])
    );

    return exploreExperience.map.markers
      .map((marker) => placeMap.get(marker.placeSlug))
      .filter((place): place is ExplorePlace => Boolean(place));
  }, []);
  const activeCustomTourPlaces = useMemo(
    () =>
      activeCustomTour?.orderedPlaceSlugs
        .map((placeSlug) => getExplorePlaceBySlug(placeSlug))
        .filter((place): place is ExplorePlace => Boolean(place)) ?? [],
    [activeCustomTour]
  );
  const tourPlaces = activeCustomTour
    ? activeCustomTourPlaces
    : activeJourney
      ? activeJourneyPlaces
      : fullTourPlaces;
  const totalTourPlaces = tourPlaces.length;
  const activeTourPlace = tourPlaces[autoTourPlaceIndex] ?? null;
  const activeTourPhoto =
    activeTourPlace?.gallery[autoTourPhotoIndex] ??
    activeTourPlace?.gallery[0] ??
    null;
  const syncAutoTourPlace = useEffectEvent(
    (placeSlug: ExplorePlaceSlug, photoId: string) => {
      openPlaceInJourney(placeSlug, photoId, activeJourney?.id ?? null);
    }
  );
  const advanceAutoTourEvent = useEffectEvent((direction: 1 | -1) => {
    advanceAutoTour(direction);
  });

  useEffect(() => {
    setActiveExploreRoute(searchState.routeId ?? null);
    if (searchState.routeId) {
      setActiveCustomTour(null);
    }
  }, [searchState.routeId, setActiveCustomTour, setActiveExploreRoute]);

  useEffect(() => {
    if (searchState.view === "place" && activePlace) {
      markExplorePlaceVisited(activePlace.slug);
    }
  }, [activePlace, markExplorePlaceVisited, searchState.view]);

  useEffect(() => {
    if (searchState.view !== "place" || !activePlace || !activeCustomTour) {
      return;
    }

    const customStopIndex = activeCustomTour.orderedPlaceSlugs.findIndex(
      (placeSlug) => placeSlug === activePlace.slug
    );

    if (
      customStopIndex >= 0 &&
      customStopIndex !== activeCustomTour.currentStopIndex
    ) {
      setCustomTourProgress(activeCustomTour.id, customStopIndex);
    }
  }, [
    activeCustomTour,
    activePlace,
    searchState.view,
    setCustomTourProgress,
  ]);

  useEffect(() => {
    if (!isSelfieModalOpen && !isPassportOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSelfieModalOpen(false);
        setIsPassportOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPassportOpen, isSelfieModalOpen]);

  useEffect(() => {
    function handleSiteAction(event: Event) {
      const detail = (event as CustomEvent<GuideSiteActionPayload>).detail;

      if (!detail) {
        return;
      }

      if (detail.command === "open_passport") {
        openPassport();
        return;
      }

      if (detail.command === "open_map") {
        if (detail.routeId) {
          selectJourney(detail.routeId);
        } else {
          openMap();
        }
        return;
      }

      if (detail.command === "start_route") {
        startRoute();
        return;
      }

      if (detail.command === "continue_route") {
        if (detail.routeId) {
          continueRouteFromPassport(detail.routeId);
        } else {
          continueFromLastPlace();
        }
        return;
      }

      if (detail.command === "next_stop") {
        goToNextJourneyStop();
        return;
      }

      if (detail.command === "open_place" && detail.placeSlug) {
        openPlaceInJourney(detail.placeSlug, null, detail.routeId ?? activeJourney?.id ?? null);
      }
    }

    window.addEventListener("palace:site-action", handleSiteAction);

    return () => {
      window.removeEventListener("palace:site-action", handleSiteAction);
    };
  });

  useEffect(() => {
    if (!isAutoTourActive) {
      return;
    }

    if (!activeTourPlace || !activeTourPhoto) {
      return;
    }

    if (
      searchState.view !== "place" ||
      activePlace?.slug !== activeTourPlace.slug ||
      activePhoto?.id !== activeTourPhoto.id
    ) {
      syncAutoTourPlace(activeTourPlace.slug, activeTourPhoto.id);
    }
  }, [
    isAutoTourActive,
    searchState.view,
    activePlace?.slug,
    activePhoto?.id,
    activeTourPlace,
    activeTourPhoto,
  ]);

  useEffect(() => {
    if (!isAutoTourActive || !activeTourPlace || !activeTourPhoto) {
      return;
    }

    const key = `${activeJourney?.id ?? "full"}:${activeTourPlace.slug}:${activeTourPhoto.id}:${language}`;
    const cachedNarration = narrationCacheRef.current.get(key);

    if (cachedNarration) {
      setAutoTourNarration(cachedNarration);
      setIsAutoTourLoading(false);
      setAutoTourError("");
      return;
    }

    let cancelled = false;

    async function fetchNarration() {
      setIsAutoTourLoading(true);
      setAutoTourError("");
      setAutoTourNarration("");

      const placeTitle = pickLocalizedText(activeTourPlace.title, language);
      const shortDesc = pickLocalizedText(
        activeTourPlace.shortDescription,
        language
      );
      const longDesc = pickLocalizedText(
        activeTourPlace.longDescription,
        language
      );
      const photoCaption = pickLocalizedText(activeTourPhoto.caption, language);
      const routeTitle = activeJourney
        ? pickLocalizedText(activeJourney.title, language)
        : null;
      const routeDescription = activeJourney
        ? pickLocalizedText(activeJourney.intro, language)
        : null;
      const isFirstPhoto = autoTourPhotoIndex === 0;
      const isFirstStop = autoTourPlaceIndex === 0;

      const question =
        language === "zh"
          ? truncateText(
              isFirstPhoto
                ? `请先用1到2句话概述“${placeTitle}”的整体特色，然后聚焦讲解当前子场景“${photoCaption}”。参考描述：${shortDesc}。补充细节：${longDesc}。不要添加虚构人物或地点。`
                : `请聚焦讲解当前子场景“${photoCaption}”，用4到6句话描述画面与空间特征，不要重复总体概述。参考描述：${shortDesc}。补充细节：${longDesc}。不要添加虚构人物或地点。`,
              360
            )
          : truncateText(
              isFirstPhoto
                ? `Start with a 1–2 sentence overview of "${placeTitle}", then focus on the sub-place in this frame: "${photoCaption}". Reference: ${shortDesc}. Add detail from: ${longDesc}. Do not invent people or locations.`
                : `Focus on the sub-place in this frame: "${photoCaption}". Use 4–6 sentences describing the scene and spatial cues; do not repeat the overall place overview. Reference: ${shortDesc}. Add detail from: ${longDesc}. Do not invent people or locations.`,
              360
            );

      const narrationQuestion =
        language === "zh"
          ? truncateText(
              isFirstPhoto
                ? `${
                    activeJourney && isFirstStop
                      ? `请先用1到2句话介绍路线“${routeTitle}”，说明它的观察重点。然后概述“${placeTitle}”的整体特征，再聚焦讲解当前子场景“${photoCaption}”。`
                      : activeJourney
                        ? `请先用1句说明当前仍位于路线“${routeTitle}”中，然后概述“${placeTitle}”的整体特征，再聚焦讲解当前子场景“${photoCaption}”。`
                        : `请先用1到2句话概述“${placeTitle}”的整体特征，然后聚焦讲解当前子场景“${photoCaption}”。`
                  }参考描述：${shortDesc}。补充细节：${longDesc}。不要添加虚构人物或地点。`
                : `请聚焦讲解当前子场景“${photoCaption}”，用4到6句话描述画面与空间特征，不要重复总体概述。参考描述：${shortDesc}。补充细节：${longDesc}。不要添加虚构人物或地点。`,
              360
            )
          : truncateText(
              isFirstPhoto
                ? `${
                    activeJourney && isFirstStop
                      ? `Start with a 1-2 sentence introduction to the journey "${routeTitle}" and what it reveals. Then give a short overview of "${placeTitle}" before focusing on the sub-place in this frame: "${photoCaption}".`
                      : activeJourney
                        ? `Briefly connect this stop back to the journey "${routeTitle}", then give a short overview of "${placeTitle}" before focusing on the sub-place in this frame: "${photoCaption}".`
                        : `Start with a 1-2 sentence overview of "${placeTitle}", then focus on the sub-place in this frame: "${photoCaption}".`
                  } Reference: ${shortDesc}. Add detail from: ${longDesc}. Do not invent people or locations.`
                : `Focus on the sub-place in this frame: "${photoCaption}". Use 4-6 sentences describing the scene and spatial cues; do not repeat the overall place overview. Reference: ${shortDesc}. Add detail from: ${longDesc}. Do not invent people or locations.`,
              360
            );

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "detailed",
            intent: "answer",
            language,
            question: narrationQuestion ?? question,
            title: activeJourney && routeTitle ? `${routeTitle} - ${placeTitle}` : placeTitle,
            journeyRouteId: activeJourney?.id ?? null,
            journeyTitle: routeTitle,
            journeyDescription: routeDescription,
            journeyStopIndex: activeJourney ? autoTourPlaceIndex + 1 : null,
            journeyStopTotal: activeJourney ? totalTourPlaces : null,
            frameCaption: photoCaption,
          }),
        });

        const data = (await response.json()) as { answer?: string; error?: string };

        if (!response.ok || !data.answer) {
          throw new Error(data.error ?? "Failed to generate narration.");
        }

        if (cancelled) {
          return;
        }

        narrationCacheRef.current.set(key, data.answer);
        setAutoTourNarration(data.answer);
        setIsAutoTourLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const fallbackNarration = language === "zh"
          ? isFirstPhoto
            ? `${placeTitle}。${shortDesc}。当前画面为：${photoCaption}。${longDesc}`
            : `当前画面为：${photoCaption}。${shortDesc}。${longDesc}`
          : isFirstPhoto
            ? `${placeTitle}. ${shortDesc}. Current frame: ${photoCaption}. ${longDesc}`
            : `Current frame: ${photoCaption}. ${shortDesc}. ${longDesc}`;

        const routeAwareFallbackNarration =
          activeJourney && isFirstPhoto
            ? language === "zh"
              ? `${
                  routeTitle && routeDescription
                    ? isFirstStop
                      ? `è·¯çº¿ã€Œ${routeTitle}ã€ä»Žè¿™ä¸€ç«™å±•å¼€ï¼Œé‡ç‚¹æ˜¯${routeDescription}ã€‚`
                      : `çŽ°åœ¨ç»§ç»­ã€Œ${routeTitle}ã€è·¯çº¿çš„ä¸‹ä¸€ç«™ã€‚`
                    : ""
                }${placeTitle}ã€‚${shortDesc}ã€‚å½“å‰å­åœºæ™¯ä¸ºï¼š${photoCaption}ã€‚${longDesc}`
              : `${
                  routeTitle && routeDescription
                    ? isFirstStop
                      ? `The journey "${routeTitle}" begins here and focuses on ${routeDescription}. `
                      : `This stop continues the journey "${routeTitle}". `
                    : ""
                }${placeTitle}. ${shortDesc}. Current sub-scene: ${photoCaption}. ${longDesc}`
            : fallbackNarration;

        setAutoTourNarration(routeAwareFallbackNarration);
        setAutoTourError(
          error instanceof Error ? error.message : "Narration unavailable."
        );
        setIsAutoTourLoading(false);
      }
    }

    fetchNarration();

    return () => {
      cancelled = true;
    };
  }, [
    activeJourney,
    activeTourPlace,
    activeTourPhoto,
    autoTourPlaceIndex,
    autoTourPhotoIndex,
    isAutoTourActive,
    language,
    totalTourPlaces,
  ]);

  useEffect(() => {
    if (!isAutoTourActive) {
      return;
    }

    if (!autoTourNarration || isAutoTourLoading) {
      return;
    }

    if (isAutoTourPaused) {
      return;
    }

    if (!voiceEnabled) {
      clearAutoTourTimer();
      const delayMs = estimateNarrationMs(autoTourNarration, language);
      autoTourTimerRef.current = window.setTimeout(() => {
        advanceAutoTourEvent(1);
      }, delayMs);
      return;
    }

    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(autoTourNarration);
    utterance.lang = language === "zh" ? "zh-CN" : "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      clearAutoTourTimer();
      autoTourTimerRef.current = window.setTimeout(() => {
        advanceAutoTourEvent(1);
      }, 1200);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      clearAutoTourTimer();
      autoTourTimerRef.current = window.setTimeout(() => {
        advanceAutoTourEvent(1);
      }, 1200);
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [
    autoTourNarration,
    isAutoTourActive,
    isAutoTourLoading,
    isAutoTourPaused,
    language,
    voiceEnabled,
  ]);

  useEffect(() => {
    if (!isAutoTourActive) {
      return;
    }

    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    if (voiceEnabled) {
      if (isAutoTourPaused) {
        clearAutoTourTimer();
        window.speechSynthesis.pause();
      } else {
        window.speechSynthesis.resume();
      }
    }
  }, [isAutoTourPaused, isAutoTourActive, voiceEnabled]);

  useEffect(() => {
    if (!isAutoTourActive) {
      return;
    }

    stopSpeech();
    clearAutoTourTimer();
    setAutoTourNarration("");
  }, [isAutoTourActive, language]);

  const backdropSrc =
    searchState.view === "place"
      ? activePhotoSrc ?? activeCoverSrc ?? welcomeHeroSrc
      : welcomeHeroSrc;
  const localize = (copy: { zh: string; en: string }) =>
    pickLocalizedText(copy, language);
  const showSceneMediaLoader = Boolean(backdropSrc) && !isBackdropImageLoaded;
  const showWelcomeVideoStatus =
    showWelcomeVideo && isBackdropImageLoaded && !isWelcomeVideoLoaded;

  useEffect(() => {
    setIsBackdropImageLoaded(!backdropSrc);
  }, [backdropSrc]);

  useEffect(() => {
    setIsWelcomeVideoLoaded(!showWelcomeVideo);
  }, [showWelcomeVideo]);

  useEffect(() => {
    if (searchState.view !== "map") {
      setIsMapImageLoaded(true);
      setMapImageError(false);
      return;
    }

    const image = mapImageRef.current;

    if (image?.complete) {
      setMapImageError(image.naturalWidth === 0);
      setIsMapImageLoaded(true);
      return;
    }

    setIsMapImageLoaded(false);
    setMapImageError(false);

    const fallbackTimer = window.setTimeout(() => {
      const latestImage = mapImageRef.current;
      setMapImageError(!latestImage?.complete || latestImage.naturalWidth === 0);
      setIsMapImageLoaded(true);
    }, 6500);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [mapImageSrc, searchState.view]);

  function clampMapOffset(
    nextOffset: {
      x: number;
      y: number;
    },
    scale: number
  ) {
    const limitX = Math.max(0, (scale - 1) * 360);
    const limitY = Math.max(0, (scale - 1) * 260);

    return {
      x: clamp(nextOffset.x, -limitX, limitX),
      y: clamp(nextOffset.y, -limitY, limitY),
    };
  }

  function navigate(nextState: ExploreSearchState) {
    const nextSearch = toSearchString(nextState);
    const nextHref = nextSearch ? `${pathname}?${nextSearch}` : pathname;
    setIsPassportOpen(false);

    startTransition(() => {
      router.push(nextHref, { scroll: false });
    });
  }

  function openPassport() {
    setIsSelfieModalOpen(false);
    setIsPassportOpen(true);

    if (isAutoTourActive) {
      setIsAutoTourPaused(true);
      clearAutoTourTimer();
      stopSpeech();
    }
  }

  function toggleTourInterest(interest: TourBuilderInterest) {
    setSelectedTourInterests((currentInterests) => {
      if (currentInterests.includes(interest)) {
        const nextInterests = currentInterests.filter(
          (currentInterest) => currentInterest !== interest
        );

        return nextInterests.length ? nextInterests : ["overview"];
      }

      return [...currentInterests, interest];
    });
  }

  async function buildPersonalizedTour() {
    setIsBuildingCustomTour(true);
    setCustomTourError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "tourist",
          intent: "tour_builder",
          language,
          question: "Build a personalized palace tour.",
          timeBudget: selectedTourTimeBudget,
          interests: selectedTourInterests,
        }),
      });
      const data = (await response.json()) as GuideResponse & { error?: string };

      if (!response.ok || !data.customTour) {
        throw new Error(data.error ?? tourBuilderCopy[language].fallbackError);
      }

      saveCustomTour(data.customTour);
    } catch (error) {
      const fallbackTour = buildCustomTourRecommendation({
        timeBudget: selectedTourTimeBudget,
        interests: selectedTourInterests,
        language,
      });
      saveCustomTour(fallbackTour);
      setCustomTourError(
        error instanceof Error
          ? error.message
          : tourBuilderCopy[language].fallbackError
      );
    } finally {
      setIsBuildingCustomTour(false);
    }
  }

  function startCustomTour(tour: CustomTourState | null = activeCustomTour) {
    if (!tour || !tour.orderedPlaceSlugs.length) {
      return;
    }

    setActiveCustomTour(tour.id);
    setActiveExploreRoute(null);
    const stopIndex = clamp(
      tour.currentStopIndex,
      0,
      Math.max(0, tour.orderedPlaceSlugs.length - 1)
    );
    const placeSlug = tour.orderedPlaceSlugs[stopIndex];

    if (placeSlug) {
      openPlaceInJourney(placeSlug, null, null);
    }
  }

  function continueFromLastPlace() {
    if (activeCustomTour) {
      startCustomTour(activeCustomTour);
      setIsPassportOpen(false);
      return;
    }

    if (activeJourney) {
      continueRouteFromPassport(activeJourney.id);
      return;
    }

    const lastVisitedPlaceSlug =
      visitedExplorePlaceSlugs[visitedExplorePlaceSlugs.length - 1] ??
      exploreExperience.places[0]?.slug;

    if (lastVisitedPlaceSlug) {
      setIsPassportOpen(false);
      openPlace(lastVisitedPlaceSlug);
    }
  }

  function answerPassportQuiz(placeSlug: ExplorePlaceSlug, isCorrect: boolean) {
    answerPassportMission(placeSlug, isCorrect);
  }

  function openWelcome() {
    setIsSelfieModalOpen(false);
    navigate({
      view: "welcome",
      placeSlug: null,
      photoId: null,
      routeId: activeJourney?.id ?? null,
    });
  }

  function openMap() {
    setIsSelfieModalOpen(false);
    setMapScale(exploreExperience.map.initialScale);
    setMapOffset({ x: 0, y: 0 });
    navigate({
      view: "map",
      placeSlug: null,
      photoId: null,
      routeId: activeJourney?.id ?? null,
    });
  }

  function selectJourney(routeId: ExploreJourneyRoute["id"]) {
    setActiveCustomTour(null);
    setMapScale(exploreExperience.map.initialScale);
    setMapOffset({ x: 0, y: 0 });
    navigate({
      view: "map",
      placeSlug: null,
      photoId: null,
      routeId,
    });
  }

  function clearJourney() {
    if (isAutoTourActive) {
      stopAutoTour();
    }

    setActiveCustomTour(null);
    navigate({
      view: searchState.view === "place" ? "map" : searchState.view,
      placeSlug: searchState.view === "place" ? null : searchState.placeSlug,
      photoId: searchState.view === "place" ? null : searchState.photoId,
      routeId: null,
    });
  }

  function openRouteMapFromPassport(routeId: ExploreJourneyRoute["id"]) {
    setIsPassportOpen(false);
    selectJourney(routeId);
  }

  function continueRouteFromPassport(routeId: ExploreJourneyRoute["id"]) {
    const journey = getExploreJourneyById(routeId);

    if (!journey) {
      openRouteMapFromPassport(routeId);
      return;
    }

    const nextPlaceSlug =
      journey.placeOrder.find(
        (placeSlug) => !visitedExplorePlaceSlugs.includes(placeSlug)
      ) ?? journey.placeOrder[0];

    if (!nextPlaceSlug) {
      openRouteMapFromPassport(routeId);
      return;
    }

    setIsPassportOpen(false);
    openPlaceInJourney(nextPlaceSlug, null, routeId);
  }

  function openPlace(placeSlug: ExplorePlaceSlug, photoId?: string | null) {
    const place = getExplorePlaceBySlug(placeSlug);
    const placePhoto = getExplorePhotoById(
      place,
      photoId ?? place?.defaultPhotoId ?? null
    );

    if (!place || !placePhoto) {
      openMap();
      return;
    }

    navigate({
      view: "place",
      placeSlug: place.slug,
      photoId: placePhoto.id,
      routeId: activeJourney?.id ?? null,
    });
  }

  function openPlaceInJourney(
    placeSlug: ExplorePlaceSlug,
    photoId?: string | null,
    routeId: ExploreJourneyRoute["id"] | null = activeJourney?.id ?? null
  ) {
    const place = getExplorePlaceBySlug(placeSlug);
    const placePhoto = getExplorePhotoById(
      place,
      photoId ?? place?.defaultPhotoId ?? null
    );

    if (!place || !placePhoto) {
      openMap();
      return;
    }

    navigate({
      view: "place",
      placeSlug: place.slug,
      photoId: placePhoto.id,
      routeId,
    });
  }

  function selectPhoto(photoId: string) {
    if (!activePlace) {
      return;
    }

    openPlaceInJourney(activePlace.slug, photoId);
  }

  function clearAutoTourTimer() {
    if (autoTourTimerRef.current) {
      window.clearTimeout(autoTourTimerRef.current);
      autoTourTimerRef.current = null;
    }
  }

  function stopSpeech() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    currentUtteranceRef.current = null;
    setIsSpeaking(false);
  }

  function startRoute() {
    if (!activeJourney || !activeJourneyPlaces.length) {
      return;
    }

    const firstPlace = activeJourneyPlaces[0];
    const firstPhoto = getExplorePhotoById(firstPlace, firstPlace.defaultPhotoId);

    if (!firstPlace || !firstPhoto) {
      return;
    }

    openPlaceInJourney(firstPlace.slug, firstPhoto.id, activeJourney.id);
  }

  function goToNextJourneyStop() {
    if (!activeJourney || activeJourneyStopIndex < 0) {
      return;
    }

    const nextPlaceSlug = activeJourney.placeOrder[activeJourneyStopIndex + 1];
    if (!nextPlaceSlug) {
      return;
    }

    openPlaceInJourney(nextPlaceSlug, null, activeJourney.id);
  }

  function startAutoTour() {
    if (!totalTourPlaces) {
      return;
    }

    setIsSelfieModalOpen(false);
    setIsAutoTourActive(true);
    setIsAutoTourPaused(false);

    if (activeCustomTour) {
      setAutoTourPlaceIndex(
        clamp(
          activeCustomTour.currentStopIndex,
          0,
          Math.max(0, activeCustomTour.orderedPlaceSlugs.length - 1)
        )
      );
      setAutoTourPhotoIndex(0);
      return;
    }

    if (
      activeJourney &&
      searchState.view === "place" &&
      activePlace &&
      activeJourneyPlaceSet.has(activePlace.slug)
    ) {
      const journeyPlaceIndex = activeJourney.placeOrder.findIndex(
        (placeSlug) => placeSlug === activePlace.slug
      );
      const photoIndex = activePlace.gallery.findIndex(
        (photo) => photo.id === activePhoto?.id
      );

      setAutoTourPlaceIndex(Math.max(0, journeyPlaceIndex));
      setAutoTourPhotoIndex(Math.max(0, photoIndex));
      return;
    }

    setAutoTourPlaceIndex(0);
    setAutoTourPhotoIndex(0);
  }

  function stopAutoTour() {
    setIsAutoTourActive(false);
    setIsAutoTourPaused(false);
    setAutoTourNarration("");
    setAutoTourError("");
    clearAutoTourTimer();
    stopSpeech();
  }

  function advanceAutoTour(direction: 1 | -1) {
    clearAutoTourTimer();
    stopSpeech();

    const currentPlaceIndex = autoTourPlaceIndex;
    const currentPhotoIndex = autoTourPhotoIndex;
    const place = tourPlaces[currentPlaceIndex];
    const photoCount = place?.gallery.length ?? 0;
    let nextPlaceIndex = currentPlaceIndex;
    let nextPhotoIndex = currentPhotoIndex;

    if (direction === -1) {
      if (nextPhotoIndex > 0) {
        nextPhotoIndex -= 1;
      } else if (currentPlaceIndex > 0) {
        nextPlaceIndex = currentPlaceIndex - 1;
        const prevPlace = tourPlaces[nextPlaceIndex];
        nextPhotoIndex = Math.max(0, (prevPlace?.gallery.length ?? 1) - 1);
      }
    } else {
      if (nextPhotoIndex + 1 < photoCount) {
        nextPhotoIndex += 1;
      } else if (currentPlaceIndex + 1 < totalTourPlaces) {
        nextPlaceIndex = currentPlaceIndex + 1;
        nextPhotoIndex = 0;
      } else {
        stopAutoTour();
        return;
      }
    }

    setAutoTourPlaceIndex(nextPlaceIndex);
    setAutoTourPhotoIndex(nextPhotoIndex);
  }

  function handleScenePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (reduceMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratioX = (event.clientX - bounds.left) / bounds.width;
    const ratioY = (event.clientY - bounds.top) / bounds.height;
    const intensity = searchState.view === "place" ? 34 : 14;

    panX.set((0.5 - ratioX) * intensity);
    panY.set((0.5 - ratioY) * intensity * 0.66);
  }

  function handleScenePointerLeave() {
    panX.set(0);
    panY.set(0);
  }

  function adjustMapScale(nextScale: number) {
    const clampedScale = clamp(
      nextScale,
      exploreExperience.map.minScale,
      exploreExperience.map.maxScale
    );

    setMapScale(clampedScale);
    setMapOffset((currentOffset) => clampMapOffset(currentOffset, clampedScale));
  }

  function handleMapWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    adjustMapScale(mapScale + (event.deltaY < 0 ? 0.16 : -0.16));
  }

  function handleMapPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    mapDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: mapOffset.x,
      originY: mapOffset.y,
    };
  }

  function handleMapPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!mapDragRef.current || mapDragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const nextX =
      mapDragRef.current.originX + event.clientX - mapDragRef.current.startX;
    const nextY =
      mapDragRef.current.originY + event.clientY - mapDragRef.current.startY;

    setMapOffset(clampMapOffset({ x: nextX, y: nextY }, mapScale));
  }

  function handleMapPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (mapDragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      mapDragRef.current = null;
    }
  }

  return (
    <section
      className={cn(
        "relative h-[100svh] overflow-hidden",
        accessibilityPreferences.textScale === "extra-large"
          ? "text-[1.13rem]"
          : accessibilityPreferences.textScale === "large"
            ? "text-[1.07rem]"
            : "",
        accessibilityPreferences.contrast === "high"
          ? "contrast-125 saturate-110"
          : "",
        accessibilityPreferences.simplified ? "[&_p]:leading-8" : "",
        isDarkTheme ? "bg-[#05070d] text-white" : "bg-background text-foreground"
      )}
      onPointerMove={handleScenePointerMove}
      onPointerLeave={handleScenePointerLeave}
    >
      <motion.div
        className="absolute inset-[-6%]"
        style={reduceMotion ? { scale: 1.06 } : { x: smoothX, y: smoothY }}
        animate={reduceMotion ? undefined : { scale: [1.05, 1.09, 1.06] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 18, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
        }
      >
        {backdropSrc ? (
          <Image
            key={backdropSrc}
            src={backdropSrc}
            alt=""
            aria-hidden="true"
            fill
            priority={searchState.view !== "place"}
            sizes="100vw"
            className={cn(
              "object-cover transition-opacity duration-700",
              isBackdropImageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsBackdropImageLoaded(true)}
          />
        ) : null}
        {showWelcomeVideo ? (
          <video
            key={exploreExperience.welcome.heroVideoSrc}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              isWelcomeVideoLoaded ? "opacity-100" : "opacity-0"
            )}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={
              exploreExperience.welcome.heroVideoPosterSrc ??
              exploreExperience.welcome.heroSrc
            }
            onLoadedData={() => setIsWelcomeVideoLoaded(true)}
            onCanPlay={() => setIsWelcomeVideoLoaded(true)}
          >
            <source
              src={exploreExperience.welcome.heroVideoSrc}
              type="video/mp4"
            />
          </video>
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(38,94,164,0.5),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(227,178,96,0.24),transparent_34%),linear-gradient(180deg,rgba(8,10,15,0.12),rgba(8,10,15,0.3)_48%,rgba(5,7,12,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,14,0.32),transparent_22%,transparent_78%,rgba(6,8,14,0.36))]" />
      </motion.div>

        {searchState.view === "place" && activePhotoSrc ? (
          <motion.div
            className="absolute inset-[-4%] opacity-50 blur-2xl"
            style={reduceMotion ? { scale: 1.08 } : { x: smoothX, y: smoothY, scale: 1.1 }}
          >
            <Image
              key={`${activePhotoSrc}-glow`}
              src={activePhotoSrc}
              alt=""
              aria-hidden="true"
              fill
              sizes="100vw"
              className={cn(
                "object-cover mix-blend-screen transition-opacity duration-700",
                isBackdropImageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          </motion.div>
        ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_56%,rgba(4,6,10,0.48)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(5,7,12,0)_0%,rgba(5,7,12,0.18)_30%,rgba(5,7,12,0.82)_100%)]" />
      <ImmersiveAssetLoadingOverlay
        visible={showSceneMediaLoader}
        eyebrow={{ zh: "场景资源", en: "Scene assets" }}
        title={
          searchState.view === "place"
            ? { zh: "正在加载当前场景画面…", en: "Loading the current scene frame..." }
            : searchState.view === "map"
              ? { zh: "正在准备地图背景场景…", en: "Preparing the map backdrop..." }
              : { zh: "正在加载欢迎场景…", en: "Loading the welcome scene..." }
        }
        description={
          searchState.view === "place"
            ? { zh: "正在同步当前地点的主画面与景深层，加载完成后会平滑淡入。", en: "Syncing the active place frame and depth layer. The scene will fade in once the media is ready." }
            : searchState.view === "map"
              ? { zh: "正在准备地图入口的背景资源，避免在慢网络下出现空白场景。", en: "Preparing the map entry backdrop so the scene does not flash blank on slower connections." }
              : { zh: "正在准备欢迎画面和入口背景资源。", en: "Preparing the welcome artwork and entry background media." }
        }
      />
      {showWelcomeVideoStatus ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-6">
          <div
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl",
              isDarkTheme
                ? "border-[#d6b071]/24 bg-[rgba(8,12,20,0.72)] text-[#f1d8b2]"
                : "border-border/80 bg-[rgba(255,248,240,0.86)] text-accent-soft"
            )}
          >
            {language === "zh"
              ? "欢迎影片正在缓冲"
              : "Welcome film buffering"}
          </div>
        </div>
      ) : null}

      {searchState.view === "welcome" ? (
        <div className="absolute left-4 top-4 z-30 w-[min(22rem,calc(100vw-2rem))] md:left-6 md:top-6">
          <div
            className={cn(
              "rounded-[1.8rem] border p-5 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.22)]",
              isDarkTheme
                ? "border-white/14 bg-[rgba(8,10,14,0.44)] text-white"
                : "border-border/70 bg-[rgba(255,248,240,0.82)] text-foreground"
            )}
          >
            <p
              className={cn(
                "text-3xl font-semibold tracking-[0.12em]",
                isDarkTheme ? "text-[#f4dcae]" : "text-accent"
              )}
            >
              {ui.brandTitle}
            </p>
            <p
              className={cn(
                "mt-2 text-[11px] font-semibold uppercase tracking-[0.28em]",
                isDarkTheme ? "text-white/62" : "text-foreground/62"
              )}
            >
              {ui.brandSubtitle}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                  isDarkTheme
                    ? "border-white/16 bg-white/10 text-white"
                    : "border-border/70 bg-background/76 text-foreground"
                )}
              >
                {ui.home}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <LanguageToggleButton tone={isDarkTheme ? "dark" : "light"} />
              <ThemeToggleButton tone={isDarkTheme ? "dark" : "light"} />
              <button
                type="button"
                onClick={openPassport}
                aria-label={journeyUi.passport}
                className={cn(
                  "rounded-full border px-4 py-3 text-sm font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {journeyUi.passport}
              </button>
            </div>

            <p
              className={cn(
                "mt-6 text-[11px] font-semibold uppercase tracking-[0.24em]",
                isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
              )}
            >
              {ui.preparedPlaces}
            </p>
            <p
              className={cn(
                "mt-2 text-sm",
                isDarkTheme ? "text-white/76" : "text-foreground/74"
              )}
            >
              {visitedCount} / {exploreExperience.places.length}
            </p>
          </div>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {searchState.view === "welcome" ? (
          <motion.div
            key="welcome"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -18 }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
            }
            className="absolute inset-0 z-20 flex items-center justify-center px-4"
          >
            <div
              className={cn(
                "max-h-[calc(100svh-2rem)] w-full max-w-3xl overflow-y-auto rounded-[2.1rem] border px-6 py-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl md:px-10 md:py-10",
                isDarkTheme
                  ? "border-white/14 bg-[rgba(8,10,14,0.42)] text-white"
                  : "border-border/70 bg-[rgba(255,248,240,0.78)] text-foreground"
              )}
            >
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.32em]",
                  isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
                )}
              >
                {ui.welcome}
              </p>

              <p
                className={cn(
                  "mt-5 font-display text-5xl leading-none md:text-7xl",
                  isDarkTheme ? "text-white" : "text-foreground"
                )}
              >
                {localize(exploreExperience.welcome.title)}
              </p>

              <p
                className={cn(
                  "mx-auto mt-6 max-w-2xl text-base leading-8",
                  isDarkTheme ? "text-white/86" : "text-foreground/80"
                )}
              >
                {localize(exploreExperience.welcome.subtitle)}
              </p>

              <div className="mx-auto mt-7 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
                {journeyOnboardingSteps[language].map((step, index) => (
                  <div
                    key={step.title}
                    className={cn(
                      "rounded-[1.15rem] border px-4 py-4",
                      isDarkTheme
                        ? "border-white/12 bg-white/8"
                        : "border-border/70 bg-background/68"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                        isDarkTheme
                          ? "bg-[#d6b071]/18 text-[#f1d8b2]"
                          : "bg-accent-soft/14 text-accent-strong"
                      )}
                    >
                      {index + 1}
                    </span>
                    <p className={cn("mt-3 text-sm font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
                      {step.title}
                    </p>
                    <p className={cn("mt-2 text-xs leading-6", isDarkTheme ? "text-white/68" : "text-foreground/68")}>
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={openMap}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full border px-7 py-4 text-center shadow-[0_18px_40px_rgba(14,10,6,0.18)]",
                    isDarkTheme
                      ? "border-[#d6b071]/34 bg-[#d6b071]/16 hover:bg-[#d6b071]/24"
                      : "border-accent-soft/28 bg-accent-soft/16 hover:bg-accent-soft/24"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkTheme ? "text-[#f6dfb8]" : "text-accent-strong"
                    )}
                  >
                    {localize(exploreExperience.welcome.ctaLabel)}
                  </span>
                </button>

                <Link
                  href="/3d-view"
                  prefetch={false}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full border px-7 py-4 text-center shadow-[0_18px_40px_rgba(14,10,6,0.18)]",
                    isDarkTheme
                      ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                      : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                  )}
                >
                  <span className="text-sm font-semibold">{ui.threeDView}</span>
                </Link>

                <MusicToggleButton tone={isDarkTheme ? "dark" : "light"} />
              </div>

              <div className="hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.28em]",
                        isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
                      )}
                    >
                      {journeyUi.journeyRoutes}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-sm leading-7",
                        isDarkTheme ? "text-white/72" : "text-foreground/70"
                      )}
                    >
                      {activeJourney
                        ? `${journeyUi.journeyReady}: ${localize(activeJourney.title)}`
                        : localize({
                            zh: "é€‰æ‹©ä¸€æ¡è·¯çº¿ï¼Œè®©åœ°å›¾å…ˆä¸ºä½ é«˜äº®ä¸»è¦åœç‚¹ã€‚",
                            en: "Choose a route first and let the map highlight the main stops for you.",
                          })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openPassport}
                    aria-label={journeyUi.passport}
                    className={cn(
                      "rounded-full border px-4 py-3 text-sm font-semibold",
                      isDarkTheme
                        ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                        : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                    )}
                  >
                    {journeyUi.passport}
                  </button>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {exploreExperience.journeys.map((journey) => (
                    <JourneyRouteCard
                      key={journey.id}
                      journey={journey}
                      progress={
                        journeyProgressById.get(journey.id) ?? {
                          visitedStops: 0,
                          totalStops: journey.placeOrder.length,
                          completionRate: 0,
                          isCompleted: false,
                        }
                      }
                      language={language}
                      journeyStopsLabel={journeyUi.journeyStops}
                      theme={theme}
                      isSelected={activeJourney?.id === journey.id}
                      onSelect={selectJourney}
                    />
                  ))}
                </div>

                <div className="mt-5">
                  <PersonalizedTourBuilder
                    language={language}
                    theme={theme}
                    selectedTimeBudget={selectedTourTimeBudget}
                    selectedInterests={selectedTourInterests}
                    customTour={activeCustomTour ?? customTours[0] ?? null}
                    isBuilding={isBuildingCustomTour}
                    error={customTourError}
                    onTimeBudgetChange={setSelectedTourTimeBudget}
                    onToggleInterest={toggleTourInterest}
                    onBuildTour={() => {
                      void buildPersonalizedTour();
                    }}
                    onStartTour={() =>
                      startCustomTour(activeCustomTour ?? customTours[0] ?? null)
                    }
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {searchState.view === "map" ? (
          <motion.div
            key="map"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.24 }}
            className="absolute inset-0 z-40 flex items-center justify-center px-3 py-3 sm:px-4 sm:py-6"
          >
            <div className="absolute inset-0 bg-[rgba(4,6,10,0.46)] backdrop-blur-[10px]" />

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 18 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
              }
              className={cn(
                "journey-scrollbar relative z-10 max-h-[calc(100svh-1.5rem)] w-full max-w-[92rem] overflow-y-auto rounded-[2rem] border p-3 shadow-[0_32px_90px_rgba(0,0,0,0.26)] backdrop-blur-2xl sm:p-4 lg:overflow-hidden",
                isDarkTheme
                  ? "border-[#d6b071]/22 bg-[rgba(8,12,20,0.78)] text-white"
                  : "border-border/70 bg-[rgba(255,248,240,0.86)] text-foreground"
              )}
            >
              <div className="flex flex-col items-stretch justify-between gap-4 px-2 pb-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.28em]",
                        isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
                      )}
                    >
                      {ui.palaceMap}
                    </p>
                    <button
                      type="button"
                      onClick={startAutoTour}
                      className={cn(
                        "rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]",
                        isDarkTheme
                          ? "border-[#d6b071]/28 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
                          : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
                      )}
                    >
                      {ui.autoTour}
                    </button>
                    <button
                      type="button"
                      onClick={openPassport}
                      aria-label={journeyUi.passport}
                      className={cn(
                        "rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]",
                        isDarkTheme
                          ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                          : "border-border/70 bg-background/82 text-foreground hover:bg-background"
                      )}
                    >
                      {journeyUi.passport}
                    </button>
                  </div>
                  <p
                    className={cn(
                      "mt-2 text-sm",
                      isDarkTheme ? "text-white/72" : "text-foreground/72"
                    )}
                  >
                    {ui.mapInstruction}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openWelcome}
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full border text-lg",
                    isDarkTheme
                      ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                      : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                  )}
                  aria-label={ui.closeMap}
                >
                  ×
                </button>
              </div>

              <div className="grid min-h-0 gap-4 lg:grid-cols-[21rem_minmax(0,1fr)]">
                <div
                  className={cn(
                    "journey-scrollbar min-h-0 overflow-y-auto rounded-[1.55rem] border p-4 lg:max-h-[min(68svh,44rem)]",
                    isDarkTheme
                      ? "border-white/10 bg-white/6"
                      : "border-border/70 bg-background/66"
                  )}
                >
                  {activeJourney ? (
                  <div className="flex flex-col gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#24170d]"
                          style={{ backgroundColor: activeJourney.accent }}
                          suppressHydrationWarning
                        >
                          {localize(activeJourney.title)}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold uppercase tracking-[0.18em]",
                            isDarkTheme ? "text-white/58" : "text-foreground/58"
                          )}
                        >
                          {activeJourney.placeOrder.length} {journeyUi.journeyStops}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mt-3 text-sm font-semibold",
                          isDarkTheme ? "text-white" : "text-foreground"
                        )}
                      >
                        {localize(activeJourney.description)}
                      </p>
                      <p
                        className={cn(
                          "mt-2 text-sm leading-7",
                          isDarkTheme ? "text-white/72" : "text-foreground/72"
                        )}
                      >
                        {localize(activeJourney.intro)}
                      </p>
                      {activeJourneyProgress ? (
                        <div className="mt-4 max-w-xl">
                          <div className="flex items-center justify-between gap-3">
                            <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
                              {formatJourneyProgressLabel(
                                activeJourneyProgress,
                                journeyUi.journeyStops,
                                language
                              )}
                            </p>
                            <p className={cn("text-xs font-semibold", isDarkTheme ? "text-white/58" : "text-foreground/58")}>
                              {activeJourneyProgress.completionRate}%
                            </p>
                          </div>
                          <div className={cn("mt-2 h-2 overflow-hidden rounded-full", isDarkTheme ? "bg-white/10" : "bg-black/8")}>
                            <div
                              className="h-full rounded-full transition-[width]"
                              style={{
                                width: `${activeJourneyProgress.completionRate}%`,
                                backgroundColor: activeJourney.accent,
                              }}
                              suppressHydrationWarning
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={startRoute}
                        className={cn(
                          "rounded-full border px-4 py-3 text-sm font-semibold",
                          isDarkTheme
                            ? "border-[#d6b071]/28 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
                            : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
                        )}
                      >
                        {journeyUi.startRoute}
                      </button>
                      <button
                        type="button"
                        onClick={startAutoTour}
                        className={cn(
                          "rounded-full border px-4 py-3 text-sm font-semibold",
                          isDarkTheme
                            ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                            : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                        )}
                      >
                        {ui.autoTour}
                      </button>
                      <button
                        type="button"
                        onClick={clearJourney}
                        className={cn(
                          "rounded-full border px-4 py-3 text-sm font-semibold",
                          isDarkTheme
                            ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                            : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                        )}
                      >
                        {journeyUi.clearRoute}
                      </button>
                    </div>
                  </div>
                  ) : (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p
                          className={cn(
                            "text-[11px] font-semibold uppercase tracking-[0.24em]",
                            isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
                          )}
                        >
                          {journeyUi.journeyRoutes}
                        </p>
                        <p
                          className={cn(
                            "mt-2 text-sm leading-7",
                            isDarkTheme ? "text-white/72" : "text-foreground/72"
                          )}
                        >
                          {localize({
                            zh: "å…ˆé€‰ä¸€æ¡è·¯çº¿ï¼Œå†å†³å®šæ˜¯è‡ªä¸»è¿›å…¥è¿˜æ˜¯ç›´æŽ¥å¼€å§‹è‡ªåŠ¨å¯¼è§ˆã€‚",
                            en: "Choose a journey first, then decide whether to enter it manually or begin the auto tour.",
                          })}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                          isDarkTheme
                            ? "border-white/12 bg-white/8 text-white/78"
                            : "border-border/70 bg-background/72 text-foreground/72"
                        )}
                      >
                        {journeyUi.freePalace}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {exploreExperience.journeys.map((journey) => (
                        <JourneyRouteCard
                          key={journey.id}
                          journey={journey}
                          progress={
                            journeyProgressById.get(journey.id) ?? {
                              visitedStops: 0,
                              totalStops: journey.placeOrder.length,
                              completionRate: 0,
                              isCompleted: false,
                            }
                          }
                          language={language}
                          journeyStopsLabel={journeyUi.journeyStops}
                          theme={theme}
                          compact
                          isSelected={false}
                          onSelect={selectJourney}
                        />
                      ))}
                    </div>

                    <div className="mt-4">
                      <PersonalizedTourBuilder
                        language={language}
                        theme={theme}
                        selectedTimeBudget={selectedTourTimeBudget}
                        selectedInterests={selectedTourInterests}
                        customTour={activeCustomTour ?? customTours[0] ?? null}
                        isBuilding={isBuildingCustomTour}
                        error={customTourError}
                        onTimeBudgetChange={setSelectedTourTimeBudget}
                        onToggleInterest={toggleTourInterest}
                        onBuildTour={() => {
                          void buildPersonalizedTour();
                        }}
                        onStartTour={() =>
                          startCustomTour(activeCustomTour ?? customTours[0] ?? null)
                        }
                      />
                    </div>
                  </div>
                  )}
                </div>

                <div className="relative min-h-[26rem] overflow-hidden rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,246,227,0.9),rgba(246,233,208,0.78))] lg:h-[min(68svh,44rem)]">
                <div
                  className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
                  onWheel={handleMapWheel}
                  onPointerDown={handleMapPointerDown}
                  onPointerMove={handleMapPointerMove}
                  onPointerUp={handleMapPointerUp}
                  onPointerCancel={handleMapPointerUp}
                >
                  <div
                    className="absolute left-1/2 top-1/2 h-[90%] w-[min(92%,70rem)]"
                    style={{
                      transform: `translate(-50%, -50%) translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapScale})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <div className="relative h-full w-full">
                      <Image
                        ref={mapImageRef}
                        src={mapImageSrc}
                        alt={localize(exploreExperience.map.alt)}
                        fill
                        priority
                        sizes="(max-width: 1024px) 92vw, 70rem"
                        className="object-contain select-none"
                        onLoad={() => {
                          setMapImageError(false);
                          setIsMapImageLoaded(true);
                        }}
                        onError={() => {
                          setMapImageError(true);
                          setIsMapImageLoaded(true);
                        }}
                      />

                      {exploreExperience.map.markers.map((marker, index) => {
                        const isInRoute = activeMapPlaceSet.has(marker.placeSlug);
                        const routeOrder = activeMapOrderMap.get(marker.placeSlug);

                        return (
                          <button
                            key={marker.placeSlug}
                            type="button"
                            onClick={() => openPlace(marker.placeSlug)}
                            aria-label={`${passportActionCopy[language].openPlace}: ${localize(marker.label)}`}
                            className={cn(
                              "absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d6b071]",
                              hasMapRouteFocus && !isInRoute ? "opacity-45" : "opacity-100"
                            )}
                            style={{
                              left: `${marker.x}%`,
                              top: `${marker.y}%`,
                            }}
                          >
                            <span
                              className={cn(
                                "relative inline-flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold text-white shadow-[0_12px_24px_rgba(45,24,14,0.28)]",
                                hasMapRouteFocus && isInRoute
                                  ? "border-white bg-[#d2ae6d]"
                                  : "border-white/70 bg-[#ff7c41]"
                              )}
                            >
                              {routeOrder ?? index + 1}
                            </span>
                            <span
                              className={cn(
                                "absolute left-1/2 top-full mt-2 min-w-28 -translate-x-1/2 rounded-xl border px-3 py-2 text-center shadow-[0_12px_28px_rgba(45,24,14,0.18)]",
                                hasMapRouteFocus && isInRoute
                                  ? "border-[#d6b071]/40 bg-[rgba(255,248,240,0.96)]"
                                  : "border-[#d6b071]/24 bg-white/92"
                              )}
                            >
                              <span className="block text-xs font-semibold text-[#8e4c1d]">
                                {localize(marker.label)}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <ImmersiveAssetLoadingOverlay
                  visible={!isMapImageLoaded}
                  compact
                  eyebrow={{ zh: "地图资源", en: "Map assets" }}
                  title={{ zh: "正在加载宫城地图…", en: "Loading the palace map..." }}
                  description={{
                    zh: "地图标记和场所入口已就绪，正在等待地图画面完成显示。",
                    en: "Markers and place entry points are ready. Waiting for the palace map image to finish loading.",
                  }}
                />
                {mapImageError ? (
                  <div
                    role="status"
                    className={cn(
                      "absolute left-1/2 top-4 z-10 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border px-4 py-2 text-center text-xs font-semibold backdrop-blur-md",
                      isDarkTheme
                        ? "border-[#d6b071]/24 bg-[rgba(8,12,20,0.78)] text-[#f6dfb8]"
                        : "border-border/80 bg-[rgba(255,248,240,0.9)] text-accent-strong"
                    )}
                  >
                    {passportActionCopy[language].mapFallback}
                  </div>
                ) : null}

                <div
                  className={cn(
                    "absolute bottom-4 left-4 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md",
                    isDarkTheme
                      ? "border-[#d6b071]/24 bg-[rgba(8,12,20,0.72)] text-white/82"
                      : "border-border/80 bg-[rgba(255,248,240,0.82)] text-foreground/82"
                  )}
                >
                  {visitedCount} / {exploreExperience.places.length} {ui.mappedPlaces}
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustMapScale(mapScale - 0.18)}
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-full border text-xl backdrop-blur-md",
                      isDarkTheme
                        ? "border-[#d6b071]/28 bg-[rgba(8,12,20,0.72)] text-[#f6dfb8] hover:bg-[rgba(8,12,20,0.82)]"
                        : "border-border/80 bg-[rgba(255,248,240,0.82)] text-accent-strong hover:bg-[rgba(255,248,240,0.96)]"
                    )}
                    aria-label={ui.zoomOut}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustMapScale(mapScale + 0.18)}
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-full border text-xl backdrop-blur-md",
                      isDarkTheme
                        ? "border-[#d6b071]/28 bg-[rgba(8,12,20,0.72)] text-[#f6dfb8] hover:bg-[rgba(8,12,20,0.82)]"
                        : "border-border/80 bg-[rgba(255,248,240,0.82)] text-accent-strong hover:bg-[rgba(255,248,240,0.96)]"
                    )}
                    aria-label={ui.zoomIn}
                  >
                    +
                  </button>
                </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
                <MusicToggleButton tone={isDarkTheme ? "dark" : "light"} compact />
                <button
                  type="button"
                  onClick={openWelcome}
                  className={cn(
                    "rounded-full border px-4 py-3 text-sm font-semibold",
                    isDarkTheme
                      ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                      : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                  )}
                >
                  {ui.backToWelcome}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {searchState.view === "place" && activePlace && activePhoto ? (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <div
              className="rounded-[1.25rem] border border-white/14 bg-[rgba(8,12,20,0.58)] px-3 py-5 text-center text-[#f5ddb4] backdrop-blur-xl"
              style={{ writingMode: "vertical-rl" }}
            >
              <p className="text-2xl font-semibold tracking-[0.18em]">
                {localize(activePlace.title)}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "absolute left-4 top-4 z-30 max-w-[min(18rem,calc(100vw-2rem))] rounded-[1.4rem] border px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl",
              isDarkTheme
                ? "border-white/14 bg-[rgba(8,12,20,0.5)]"
                : "border-border/70 bg-[rgba(255,248,240,0.84)]"
            )}
          >
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.28em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
              {ui.placeView}
            </p>
            <p className={cn("mt-2 text-sm font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
              {localize(activePlace.title)}
            </p>
            {activeJourney ? (
              <div className="mt-3 space-y-2">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#24170d]"
                  style={{ backgroundColor: activeJourney.accent }}
                  suppressHydrationWarning
                >
                  {localize(activeJourney.title)}
                </span>
                <p
                  className={cn(
                    "text-xs",
                    isDarkTheme ? "text-white/68" : "text-foreground/68"
                  )}
                >
                  {activeJourneyStopIndex >= 0
                    ? `${activeJourneyStopIndex + 1} / ${activeJourney.placeOrder.length}`
                    : `0 / ${activeJourney.placeOrder.length}`}
                </p>
              </div>
            ) : null}
          </div>

          <div className="absolute right-4 top-4 z-30 hidden w-[min(27rem,34vw)] lg:block">
            <PlaceInfoPanel
              place={activePlace}
              activePhoto={activePhoto}
              language={language}
              copy={ui}
              theme={theme}
            />
          </div>

          <div className="absolute inset-x-4 bottom-44 z-30 lg:hidden">
            <PlaceInfoPanel
              place={activePlace}
              activePhoto={activePhoto}
              language={language}
              copy={ui}
              theme={theme}
              compact
            />
          </div>

          <div className="absolute inset-x-3 bottom-3 z-30 flex max-h-[46svh] flex-col gap-2 overflow-y-auto lg:left-1/2 lg:right-auto lg:w-[min(78rem,calc(100vw-2rem))] lg:max-h-none lg:-translate-x-1/2 lg:overflow-visible">
            <div
              className={cn(
                "journey-scrollbar flex items-center gap-2 overflow-x-auto rounded-[1.5rem] border px-3 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:justify-center sm:gap-3 sm:px-4",
                isDarkTheme
                  ? "border-white/12 bg-[rgba(8,12,20,0.54)]"
                  : "border-border/70 bg-[rgba(255,248,240,0.84)]"
              )}
            >
              <button
                type="button"
                onClick={openMap}
                className={cn(
                    "shrink-0 rounded-full border px-4 py-3 text-sm font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-[rgba(8,12,20,0.56)] text-white hover:bg-[rgba(8,12,20,0.68)]"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {activeJourney ? journeyUi.routeMap : ui.backToMap}
              </button>
              {activeJourney ? (
                <button
                  type="button"
                  onClick={goToNextJourneyStop}
                  disabled={
                    activeJourneyStopIndex < 0 ||
                    activeJourneyStopIndex + 1 >= activeJourney.placeOrder.length
                  }
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45",
                    isDarkTheme
                      ? "border-[#d6b071]/30 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
                      : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
                  )}
                >
                  {journeyUi.nextStop}
                </button>
              ) : null}
              <button
                type="button"
                onClick={openWelcome}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-3 text-sm font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-[rgba(8,12,20,0.56)] text-white hover:bg-[rgba(8,12,20,0.68)]"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {ui.close}
              </button>
              <button
                type="button"
                onClick={startAutoTour}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-3 text-sm font-semibold",
                  isDarkTheme
                    ? "border-[#f5ddb4]/30 bg-[#f5ddb4]/14 text-[#f5ddb4] hover:bg-[#f5ddb4]/22"
                    : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
                )}
              >
                {ui.autoTour}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPassportOpen(false);
                  setIsSelfieModalOpen(true);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-3 text-sm font-semibold",
                  isDarkTheme
                    ? "border-[#d6b071]/30 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
                    : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
                )}
              >
                {ui.selfie}
              </button>
              <button
                type="button"
                onClick={openPassport}
                aria-label={journeyUi.passport}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-3 text-sm font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-[rgba(8,12,20,0.56)] text-white hover:bg-[rgba(8,12,20,0.68)]"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {journeyUi.passport}
              </button>
              <MusicToggleButton tone={isDarkTheme ? "dark" : "light"} compact />
              <LanguageToggleButton tone={isDarkTheme ? "dark" : "light"} />
              <ThemeToggleButton tone={isDarkTheme ? "dark" : "light"} />
            </div>

            <div
              className={cn(
                "w-full rounded-[1.45rem] border p-3 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl",
                isDarkTheme
                  ? "border-white/12 bg-[rgba(8,12,20,0.54)]"
                  : "border-border/70 bg-[rgba(255,248,240,0.84)]"
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
                  {ui.sceneFrames}
                </p>
                <div className="flex items-center gap-3">
                  {activeJourney ? (
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#24170d]"
                      style={{ backgroundColor: activeJourney.accent }}
                      suppressHydrationWarning
                    >
                      {localize(activeJourney.title)}
                    </span>
                  ) : null}
                  <p className={cn("text-xs", isDarkTheme ? "text-white/68" : "text-foreground/66")}>
                    {activePlace.gallery.length} {ui.views}
                  </p>
                </div>
              </div>

              <div className="journey-scrollbar flex w-full gap-2 overflow-x-auto pb-1">
                {activePlace.gallery.map((photo) => {
                  const isActive = photo.id === activePhoto.id;

                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => selectPhoto(photo.id)}
                      className={cn(
                        "group relative h-16 w-28 shrink-0 overflow-hidden rounded-[0.9rem] border transition-transform hover:-translate-y-0.5 sm:h-20 sm:w-32",
                        isActive
                          ? "border-[#f5ddb4]/70 ring-2 ring-[#f5ddb4]/30"
                          : "border-white/10"
                      )}
                    >
                      <Image
                        src={normalizeImageSrc(photo.src) ?? photo.src}
                        alt={localize(photo.alt)}
                        fill
                        sizes="8rem"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,12,0.04),rgba(6,8,12,0.74))]" />
                      <div className="absolute inset-x-0 bottom-0 p-2 text-left">
                        <p className="truncate text-xs font-semibold text-white">
                          {localize(photo.caption)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {isAutoTourActive && activeTourPlace && activeTourPhoto ? (
        <div className="absolute left-4 top-[7.25rem] z-40 w-[min(23rem,calc(100vw-2rem))]">
          <div
            className={cn(
              "rounded-[1.5rem] border px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
              isDarkTheme
                ? "border-[#d6b071]/24 bg-[rgba(8,12,20,0.76)] text-white"
                : "border-border/70 bg-[rgba(255,248,240,0.9)] text-foreground"
            )}
            aria-busy={isAutoTourLoading || isSpeaking}
          >
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.28em]",
                isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
              )}
            >
              {ui.tourStopTitle}
            </p>
            {activeJourney ? (
              <p
                className={cn(
                  "mt-2 text-[11px] font-semibold uppercase tracking-[0.22em]",
                  isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft"
                )}
              >
                {localize(activeJourney.title)}
              </p>
            ) : null}
            <p className={cn("mt-2 text-lg font-semibold", isDarkTheme ? "text-white" : "text-foreground")}>
              {localize(activeTourPlace.title)}
            </p>
            <p className={cn("mt-1 text-sm", isDarkTheme ? "text-white/70" : "text-foreground/70")}>
              {ui.tourPhotoLabel} {autoTourPhotoIndex + 1}/{activeTourPlace.gallery.length} · {autoTourPlaceIndex + 1}/{totalTourPlaces}
            </p>

            <p className={cn("mt-3 text-xs uppercase tracking-[0.2em]", isDarkTheme ? "text-[#f1d8b2]" : "text-accent-soft")}>
              {isAutoTourPaused ? ui.tourPaused : isAutoTourLoading ? ui.tourLoading : ui.tourNarrating}
            </p>
            <p className={cn("mt-2 text-sm leading-6", isDarkTheme ? "text-white/78" : "text-foreground/78")}>
              {isAutoTourLoading ? "" : autoTourNarration}
            </p>
            {autoTourError ? (
              <p className="mt-2 text-xs text-red-400">{autoTourError}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoTourPaused((current) => !current)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {isAutoTourPaused ? ui.tourResume : ui.tourPause}
              </button>
              <button
                type="button"
                onClick={() => advanceAutoTour(-1)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {ui.tourBack}
              </button>
              <button
                type="button"
                onClick={() => advanceAutoTour(1)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {ui.tourNext}
              </button>
              <button
                type="button"
                onClick={() => setVoiceEnabled((current) => !current)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold",
                  isDarkTheme
                    ? "border-[#d6b071]/30 bg-[#d6b071]/14 text-[#f5ddb4] hover:bg-[#d6b071]/22"
                    : "border-accent-soft/30 bg-accent-soft/14 text-accent-strong hover:bg-accent-soft/22"
                )}
              >
                {voiceEnabled ? ui.tourVoiceOn : ui.tourVoiceOff}
              </button>
              <button
                type="button"
                onClick={stopAutoTour}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold",
                  isDarkTheme
                    ? "border-white/16 bg-white/10 text-white hover:bg-white/16"
                    : "border-border/80 bg-background/82 text-foreground hover:bg-background"
                )}
              >
                {ui.tourExit}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {isPassportOpen ? (
          <motion.div
            key="passport-drawer"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.22 }}
            className="absolute inset-0 z-[80]"
          >
            <button
              type="button"
              onClick={() => setIsPassportOpen(false)}
              className="absolute inset-0 z-0 bg-[rgba(4,6,10,0.56)] backdrop-blur-[10px]"
              aria-label={pickLocalizedText(exploreExperience.passport.closeLabel, language)}
            />
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: 20 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
              }
              className="absolute inset-y-0 right-0 z-10 w-full max-w-[min(28rem,100vw)]"
            >
              <PassportDrawer
                language={language}
                theme={theme}
                visitedPlaceSlugs={visitedExplorePlaceSlugs}
                completedRouteIds={completedExploreRouteIds}
                unlockedSealIds={unlockedPassportSealIds}
                journeyProgressById={journeyProgressById}
                missionStates={passportMissions}
                activeCustomTour={activeCustomTour}
                customTours={customTours}
                activeCustomTourId={activeCustomTourId}
                activeExploreRouteId={activeJourney?.id ?? activeExploreRouteId}
                overallCompletionRate={overallPassportCompletionRate}
                onOpenPlace={openPlace}
                onOpenRouteMap={openRouteMapFromPassport}
                onContinueRoute={continueRouteFromPassport}
                onContinueFromLastPlace={continueFromLastPlace}
                onAnswerQuiz={answerPassportQuiz}
                onClose={() => setIsPassportOpen(false)}
                onReset={() => {
                  resetExploreProgress();
                  setIsPassportOpen(false);
                }}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {searchState.view === "place" &&
        activePlace &&
        activePhoto &&
        isSelfieModalOpen ? (
          <motion.div
            key="explore-selfie-modal"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.22 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          >
            <button
              type="button"
              onClick={() => setIsSelfieModalOpen(false)}
              className="absolute inset-0 bg-[rgba(4,6,10,0.72)] backdrop-blur-[14px]"
              aria-label={ui.closeSelfieModal}
            />

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 20 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
              }
              className={cn(
                "relative z-10 h-[min(92svh,60rem)] w-full max-w-[92rem] overflow-hidden rounded-[2rem] border shadow-[0_36px_120px_rgba(0,0,0,0.34)]",
                isDarkTheme
                  ? "border-[#d6b071]/24 bg-[rgba(8,12,20,0.84)]"
                  : "border-border/70 bg-[rgba(255,248,240,0.9)]"
              )}
              role="dialog"
              aria-modal="true"
              aria-label={`${ui.selfie}: ${localize(activePlace.title)}`}
            >
              <SelfieStudio
                key={`${activePlace.slug}:${activePhoto.id}`}
                mode="modal"
                onClose={() => setIsSelfieModalOpen(false)}
                initialBackdrop={{
                  imageUrl: activePhotoSrc ?? activePhoto.src,
                  label: localize(activePhoto.caption),
                }}
                initialTitle={localize(activePlace.title)}
                initialCaption={localize(activePlace.shortDescription)}
                placeLabel={localize(activePlace.title)}
                journey={
                  activeJourney
                    ? {
                        routeId: activeJourney.id,
                        title: localize(activeJourney.title),
                        frameId: getPostcardFrameIdForJourneyRoute(activeJourney.id),
                        sealLabel: activeJourneySeal
                          ? localize(activeJourneySeal.title)
                          : null,
                        isCompleted: isActiveJourneyCompleted,
                      }
                    : null
                }
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
