"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { getExplorePlaceBySlug, normalizeExploreSearchState } from "@/data/panorama";
import { pickLocalizedText } from "@/lib/i18n";
import { HERITAGE_SCENE_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { GuideMode, GuideRequest, GuideResponse } from "@/types/ai-guide";
import type { AppLanguage } from "@/types/preferences";

type SearchParamsLike = {
  get: (name: string) => string | null;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string | null;
};

type AssistantRouteContext = {
  key: string;
  kind: "home" | "welcome" | "map" | "place" | "tour";
  label: LocalizedCopy;
  title: LocalizedCopy;
  intro: LocalizedCopy;
  starters: LocalizedCopy[];
};

type AssistantLensId = "palace" | "axis" | "ritual" | "scenery";

type LocalizedCopy = {
  zh: string;
  en: string;
};

type AssistantLens = {
  id: AssistantLensId;
  glyph: string;
  label: LocalizedCopy;
  title: LocalizedCopy;
  description: LocalizedCopy;
  contextHint: LocalizedCopy;
  focusId: GuideRequest["focusId"];
  buildStarters: (routeContext: AssistantRouteContext) => LocalizedCopy[];
};

function localized(zh: string, en: string): LocalizedCopy {
  return { zh, en };
}

function getAssistantCopy(language: AppLanguage) {
  if (language === "zh") {
    return {
      dialogLabel: "故宫 AI 助手",
      openLabel: "打开故宫 AI 助手",
      closeLabel: "关闭故宫 AI 助手",
      guideProvider: "导览",
      askAboutRoute: "问一个与当前宫殿路线有关的问题。",
      minLengthError: "至少输入 2 个字符，或直接点一个提示问题。",
      requestFailed: "AI 助手暂时无法回答。",
      askWithLens: (lens: string) => `试试从“${lens}”角度提问...`,
      starterHeading: "建议问题",
      loading: "正在调用 DeepSeek...",
      sendLabel: "发送问题给故宫 AI 助手",
      emptyStateLabel: "当前观察维度",
    };
  }

  return {
    dialogLabel: "Palace AI assistant",
    openLabel: "Open palace AI assistant",
    closeLabel: "Close palace AI assistant",
    guideProvider: "guide",
    askAboutRoute: "Ask a question about the current palace route.",
    minLengthError: "Try at least 2 characters, or use one of the starter prompts.",
    requestFailed: "The AI guide could not answer right now.",
    askWithLens: (lens: string) => `Ask with the ${lens} lens...`,
    starterHeading: "Starter prompts",
    loading: "Consulting DeepSeek...",
    sendLabel: "Send question to palace AI assistant",
    emptyStateLabel: "Current lens",
  };
}

const guideModes: Array<{ value: GuideMode; label: LocalizedCopy }> = [
  { value: "short", label: localized("简答", "Short") },
  { value: "detailed", label: localized("详细", "Detailed") },
  { value: "fun", label: localized("趣味", "Fun") },
];

const assistantLenses: AssistantLens[] = [
  {
    id: "palace",
    glyph: "\u5bab",
    label: localized("整体", "Palace"),
    title: localized("宫城总览", "Palace overview"),
    description: localized(
      "适合询问整体导览、主要场所和这条故宫路线的阅读方式。",
      "Use this lens for broad orientation, major spaces, and how the full palace route fits together."
    ),
    contextHint: localized(
      "宫城总览，关注整体导览、主要场所与路线结构。",
      "Palace overview focused on broad orientation, major spaces, and route structure."
    ),
    focusId: null,
    buildStarters: (routeContext) => [
      localized(
        `请简要介绍一下${routeContext.title.zh}。`,
        `Give me a short overview of ${routeContext.title.en}.`
      ),
      localized(
        "我应该怎样理解这条故宫路线？",
        "What is the best way to understand this palace route?"
      ),
      localized(
        "第一次看这里应该注意什么？",
        "What should a first-time visitor pay attention to here?"
      ),
    ],
  },
  {
    id: "axis",
    glyph: "\u8f74",
    label: localized("中轴", "Axis"),
    title: localized("中轴秩序", "Central axis"),
    description: localized(
      "适合询问对称、门序、空间推进和沿中轴展开的观看逻辑。",
      "Use this lens for alignment, procession, thresholds, and the logic of movement through the palace."
    ),
    contextHint: localized(
      "中轴视角，关注对称、门序、阈限与轴线秩序。",
      "Central axis lens focused on procession, symmetry, thresholds, and axial order."
    ),
    focusId: "central-axis",
    buildStarters: (routeContext) => [
      localized(
        `中轴线如何塑造${routeContext.title.zh}？`,
        `How does the central axis shape ${routeContext.title.en}?`
      ),
      localized(
        "为什么中轴秩序在故宫里这么重要？",
        "Why is axial order so important in the Forbidden City?"
      ),
      localized(
        "这条路线怎样体现等级和进深？",
        "What does this route reveal about hierarchy and procession?"
      ),
    ],
  },
  {
    id: "ritual",
    glyph: "\u793c",
    label: localized("礼制", "Ritual"),
    title: localized("礼制意义", "Ritual meaning"),
    description: localized(
      "适合询问朝会等级、礼仪秩序、皇权象征和正式空间的意义。",
      "Use this lens for court hierarchy, ceremonial order, imperial symbolism, and formal spatial meaning."
    ),
    contextHint: localized(
      "礼制视角，关注朝会等级、礼仪秩序、皇权象征与空间意义。",
      "Ritual lens focused on court hierarchy, ceremony, imperial symbolism, and formal spatial meaning."
    ),
    focusId: "hall-of-supreme-harmony",
    buildStarters: (routeContext) => [
      localized(
        `${routeContext.title.zh}可以读出哪些礼制意义？`,
        `What ritual meaning should I read in ${routeContext.title.en}?`
      ),
      localized(
        "这个场所如何表现礼仪等级？",
        "How does this place express ceremonial hierarchy?"
      ),
      localized(
        "尺度和抬高台基在礼制上意味着什么？",
        "What does scale or elevation mean in imperial ritual space?"
      ),
    ],
  },
  {
    id: "scenery",
    glyph: "\u666f",
    label: localized("景观", "Scenery"),
    title: localized("景观阅读", "Scenic reading"),
    description: localized(
      "适合询问庭院氛围、取景、光线、层次和这个场所为何具有视觉记忆点。",
      "Use this lens for atmosphere, courtyards, framing, light, mood, and what makes a place visually memorable."
    ),
    contextHint: localized(
      "景观视角，关注庭院氛围、取景、光线与视觉层次。",
      "Scenery lens focused on atmosphere, courtyards, framing, light, and visual mood."
    ),
    focusId: null,
    buildStarters: (routeContext) => [
      localized(
        `请描述一下${routeContext.title.zh}的视觉氛围。`,
        `Describe the visual mood of ${routeContext.title.en}.`
      ),
      localized(
        "这里为什么会让人印象深刻？",
        "What makes this place feel memorable or cinematic?"
      ),
      localized(
        "哪些细节让这个场景更有辨识度？",
        "What details make this palace scene visually distinctive?"
      ),
    ],
  },
];

function buildRouteContext(
  pathname: string,
  searchParams: SearchParamsLike
): AssistantRouteContext {
  if (pathname === "/" || pathname === "/explore") {
    const searchState = normalizeExploreSearchState({
      view: searchParams.get("view") ?? undefined,
      place: searchParams.get("place") ?? undefined,
      photo: searchParams.get("photo") ?? undefined,
    });
    const activePlace = getExplorePlaceBySlug(searchState.placeSlug);

    if (searchState.view === "place" && activePlace) {
      return {
        key: `explore:${activePlace.slug}`,
        kind: "place",
        label: localized("当前场所", "Current place"),
        title: activePlace.title,
        intro: localized(
          `你现在位于${activePlace.title.zh}。可以询问它的空间气质、礼制意义，或它如何连接整条故宫路线。`,
          `You are currently in ${activePlace.title.en}. Ask about its mood, ceremonial meaning, or how it fits into the broader Forbidden City route.`
        ),
        starters: [
          localized(
            `${activePlace.title.zh}最值得先注意什么？`,
            `What should I notice first at ${activePlace.title.en}?`
          ),
          localized(
            `${activePlace.title.zh}在故宫中为什么重要？`,
            `Why is ${activePlace.title.en} important in the Forbidden City?`
          ),
          localized(
            `请给我一句对${activePlace.title.zh}的文化解读。`,
            `Give me a short cultural reading of ${activePlace.title.en}.`
          ),
        ],
      };
    }

    if (searchState.view === "map") {
      return {
        key: "explore:map",
        kind: "map",
        label: localized("地图视图", "Map view"),
        title: localized("宫城地图", "Palace map"),
        intro: localized(
          "可以询问如何阅读宫城地图、从哪里开始，或者这条路线如何展开。",
          "Ask about how to read the palace map, where to begin, or how the route is structured."
        ),
        starters: [
          localized("我应该从宫城地图的哪里开始？", "Where should I begin on the palace map?"),
          localized("主殿路线是怎样推进的？", "How does the route move through the main halls?"),
          localized("这张地图讲述了什么故事？", "What story does this map help tell?"),
        ],
      };
    }

    return {
      key: "explore:welcome",
      kind: "welcome",
      label: localized("探索欢迎", "Explore welcome"),
      title: localized("入境故宫", "Enter the Palace"),
      intro: localized(
        "可以先问一个总览问题，再打开地图进入主要宫殿场所。",
        "Ask for a quick orientation before opening the map and entering the main palace places."
      ),
      starters: [
        localized("先给我一个简短的探索路线介绍。", "Give me a quick introduction to the Explore route."),
        localized("这个宫城体验里可以发现什么？", "What can I discover in this palace experience?"),
        localized("我应该如何阅读这条故宫叙事路线？", "How should I move through the palace story?"),
      ],
    };
  }

  if (pathname === "/tour") {
    return {
      key: "tour",
      kind: "tour",
      label: localized("导览路线", "Guided route"),
      title: localized("礼制导览", "Guided route"),
      intro: localized(
        "可以询问中轴、礼制秩序，或外朝到内廷的空间变化。",
        "Ask about ceremonial meaning, axial order, or how the main palace route is designed to be read."
      ),
      starters: [
        localized("中轴线为什么重要？", "What is the central axis?"),
        localized("故宫中的对称想表达什么？", "Why does symmetry matter in the palace?"),
        localized("外朝和内廷的区别是什么？", "What changes from the outer court to the inner court?"),
      ],
    };
  }

  return {
    key: "home",
    kind: "home",
    label: localized("首页", "Home"),
    title: localized("故宫动境", "Palace in Motion"),
    intro: localized(
      "可以询问应用结构、故宫路线，或探索与合影功能如何配合。",
      "Ask about the app, the Forbidden City route, or how the Explore and selfie flow work."
    ),
    starters: [
      localized("故宫动境里我可以做什么？", "What can I do in Palace in Motion?"),
      localized("这条故宫路线有什么特色？", "What is special about the Forbidden City route?"),
      localized("探索里的合影模式怎么用？", "How does the integrated selfie feature work?"),
    ],
  };
}

function getLensById(lensId: AssistantLensId) {
  return assistantLenses.find((lens) => lens.id === lensId) ?? assistantLenses[0];
}

function getDefaultLensId(routeContext: AssistantRouteContext): AssistantLensId {
  if (routeContext.kind === "place") {
    return "palace";
  }

  if (routeContext.kind === "map") {
    return "axis";
  }

  return "palace";
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h11" />
      <path d="M11 6l6 6-6 6" />
    </svg>
  );
}

export function FloatingAIAssistant() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion() ?? false;
  const { language, theme } = useSitePreferences();
  const copy = getAssistantCopy(language);
  const isDarkTheme = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<GuideMode>("detailed");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLensId, setActiveLensId] = useState<AssistantLensId>("palace");
  const messageViewportRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const routeContext = useMemo(
    () => buildRouteContext(pathname, searchParams),
    [pathname, searchParams]
  );

  const activeLens = getLensById(activeLensId);
  const localizedRouteLabel = pickLocalizedText(routeContext.label, language);
  const localizedRouteTitle = pickLocalizedText(routeContext.title, language);
  const localizedRouteIntro = pickLocalizedText(routeContext.intro, language);
  const localizedLensLabel = pickLocalizedText(activeLens.label, language);
  const localizedLensTitle = pickLocalizedText(activeLens.title, language);
  const localizedLensDescription = pickLocalizedText(activeLens.description, language);
  const starterQuestions = useMemo(() => {
    const lensStarters = activeLens.buildStarters(routeContext);
    return [...lensStarters, ...routeContext.starters]
      .slice(0, 4)
      .map((starter) => pickLocalizedText(starter, language));
  }, [activeLens, language, routeContext]);

  useEffect(() => {
    setMessages([]);
    setError(null);
    setQuestion("");
    setActiveLensId(getDefaultLensId(routeContext));
  }, [routeContext]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    textareaRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !messageViewportRef.current) {
      return;
    }

    messageViewportRef.current.scrollTo({
      top: messageViewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function submitQuestion(nextQuestion: string) {
    const trimmedQuestion = nextQuestion.trim();

    if (!trimmedQuestion) {
      setError(copy.askAboutRoute);
      return;
    }

    if (trimmedQuestion.length < 2) {
      setError(copy.minLengthError);
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
      meta: localizedLensTitle,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: GuideRequest = {
        sceneId: HERITAGE_SCENE_ID,
        focusId: activeLens.focusId,
        contextHint: pickLocalizedText(activeLens.contextHint, language),
        title: `${localizedRouteTitle} - ${localizedLensTitle}`,
        language,
        question: trimmedQuestion,
        mode,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as GuideResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? copy.requestFailed);
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          meta: `${localizedLensTitle} | ${data.meta?.provider ?? copy.guideProvider}`,
        },
      ]);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : copy.requestFailed
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStarterClick(starter: string) {
    setQuestion(starter);
    setError(null);
    textareaRef.current?.focus();
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(question);
  }

  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitQuestion(question);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[45]">
      <AnimatePresence>
        {isOpen ? (
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.97 }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
            }
            className={cn(
              "pointer-events-auto mb-4 flex h-[min(42rem,calc(100svh-6rem))] w-[min(26rem,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-[2rem] border-[3px] shadow-[0_30px_100px_rgba(0,0,0,0.3)]",
              isDarkTheme
                ? "border-[#221915] bg-[#171414] text-white"
                : "border-border bg-[rgba(255,248,240,0.96)] text-foreground"
            )}
            role="dialog"
            aria-modal="false"
            aria-label={copy.dialogLabel}
          >
            <div
              className={cn(
                "relative overflow-hidden border-b px-4 py-4",
                isDarkTheme
                  ? "border-[#f2bf8d]/12 bg-[linear-gradient(135deg,#221915_0%,#1a1718_45%,#0f1115_100%)]"
                  : "border-border/70 bg-[linear-gradient(135deg,rgba(255,248,240,0.96)_0%,rgba(249,238,224,0.94)_46%,rgba(241,225,203,0.9)_100%)]"
              )}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,132,111,0.7),transparent)]" />
              <div className="absolute -right-10 top-2 h-24 w-24 rounded-full bg-[#ff6c72]/12 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-20 w-20 rounded-full bg-[#b8874d]/12 blur-3xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-[3px] border-[#ff6c72] shadow-[0_10px_28px_rgba(123,21,36,0.36)]">
                    <Image
                      src="/assistant/avatar.jpg"
                      alt={copy.dialogLabel}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-2xl font-black uppercase tracking-[0.04em]",
                        isDarkTheme ? "text-white" : "text-foreground"
                      )}
                    >
                      Palace A.
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
                        isDarkTheme ? "text-white/54" : "text-foreground/58"
                      )}
                    >
                      {localizedRouteLabel}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-sm",
                        isDarkTheme ? "text-[#f3d5be]" : "text-accent-strong"
                      )}
                    >
                      {localizedRouteTitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] text-2xl font-black shadow-[0_10px_24px_rgba(255,108,114,0.22)]",
                    isDarkTheme
                      ? "border-black bg-[#ff6c72] text-black"
                      : "border-[#9a3243] bg-[#ff7d82] text-[#241515]"
                  )}
                  aria-label={copy.closeLabel}
                >
                  ×
                </button>
              </div>

              <div className="relative mt-4 flex flex-wrap items-center gap-2">
                {assistantLenses.map((lens) => {
                  const isActive = lens.id === activeLens.id;

                  return (
                    <button
                      key={lens.id}
                      type="button"
                      onClick={() => {
                        setActiveLensId(lens.id);
                        setError(null);
                      }}
                      className={cn(
                        "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-transform hover:-translate-y-0.5",
                        isActive
                          ? isDarkTheme
                            ? "border-[#ff6c72] bg-[#321119] text-[#ffb0b4] shadow-[0_10px_20px_rgba(123,21,36,0.2)]"
                            : "border-[#ff6c72] bg-[#ffebe9] text-[#8f2638]"
                          : isDarkTheme
                            ? "border-white/12 bg-white/6 text-white/54 hover:bg-white/10"
                            : "border-border/70 bg-white/60 text-foreground/62 hover:bg-white"
                      )}
                      aria-pressed={isActive}
                      aria-label={pickLocalizedText(lens.title, language)}
                      title={`${pickLocalizedText(lens.title, language)}: ${pickLocalizedText(lens.description, language)}`}
                    >
                      {lens.glyph}
                    </button>
                  );
                })}
              </div>

              <div
                className={cn(
                  "relative mt-3 rounded-[1.15rem] border px-3 py-3",
                  isDarkTheme
                    ? "border-white/10 bg-white/5"
                    : "border-border/70 bg-white/56"
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.22em]",
                    isDarkTheme ? "text-[#ff9aa0]" : "text-accent"
                  )}
                >
                  {localizedLensLabel}
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm leading-6",
                    isDarkTheme ? "text-white/72" : "text-foreground/74"
                  )}
                >
                  {localizedLensDescription}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "border-b px-4 py-3",
                isDarkTheme ? "border-white/8 bg-[#151416]" : "border-border/70 bg-background/78"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                {guideModes.map((guideMode) => {
                  const isActive = mode === guideMode.value;

                  return (
                    <button
                      key={guideMode.value}
                      type="button"
                      onClick={() => setMode(guideMode.value)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors",
                        isActive
                          ? isDarkTheme
                            ? "border-[#ff6c72] bg-[#ff6c72] text-black"
                            : "border-accent bg-accent text-white"
                          : isDarkTheme
                            ? "border-white/10 bg-white/5 text-white/64 hover:bg-white/10"
                            : "border-border/70 bg-white/64 text-foreground/72 hover:bg-white"
                      )}
                    >
                      {pickLocalizedText(guideMode.label, language)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              ref={messageViewportRef}
              className={cn(
                "flex-1 space-y-4 overflow-y-auto px-4 py-4",
                isDarkTheme
                  ? "bg-[linear-gradient(180deg,#262324_0%,#201d1f_100%)]"
                  : "bg-[linear-gradient(180deg,rgba(255,248,240,0.96)_0%,rgba(246,236,223,0.98)_100%)]"
              )}
            >
              {messages.length ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="relative mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-[#ff6c72]/80">
                        <Image
                          src="/assistant/avatar.jpg"
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    <div
                      className={cn(
                        "max-w-[84%] rounded-[1.45rem] border-[3px] px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.18)]",
                        message.role === "user"
                          ? "rounded-br-md border-black bg-[#ff6c72] text-black"
                          : isDarkTheme
                            ? "rounded-bl-md border-black bg-[#121214] text-white"
                            : "rounded-bl-md border-border bg-white/82 text-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm font-semibold leading-7">
                        {message.content}
                      </p>
                      {message.meta ? (
                        <p
                          className={cn(
                            "mt-2 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            message.role === "user"
                              ? "text-black/62"
                              : isDarkTheme
                                ? "text-white/42"
                                : "text-foreground/48"
                          )}
                        >
                          {message.meta}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={cn(
                    "rounded-[1.5rem] border-[3px] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]",
                    isDarkTheme ? "border-black bg-[#121214]" : "border-border bg-white/82"
                  )}
                >
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.22em]",
                      isDarkTheme ? "text-[#ff9aa0]" : "text-accent"
                    )}
                  >
                    {copy.emptyStateLabel}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-base font-semibold",
                      isDarkTheme ? "text-white" : "text-foreground"
                    )}
                  >
                    {localizedLensTitle}
                  </p>
                  <p
                    className={cn(
                      "mt-3 text-sm leading-7",
                      isDarkTheme ? "text-white/80" : "text-foreground/78"
                    )}
                  >
                    {localizedRouteIntro}
                  </p>
                  <p
                    className={cn(
                      "mt-4 text-[11px] font-semibold uppercase tracking-[0.22em]",
                      isDarkTheme ? "text-white/44" : "text-foreground/48"
                    )}
                  >
                    {copy.starterHeading}
                  </p>
                  <div className="mt-4 grid gap-2">
                    {starterQuestions.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => handleStarterClick(starter)}
                        className={cn(
                          "rounded-[1rem] border px-3 py-3 text-left text-sm font-medium",
                          isDarkTheme
                            ? "border-white/10 bg-white/6 text-white/82 hover:bg-white/10"
                            : "border-border/70 bg-white/72 text-foreground/86 hover:bg-white"
                        )}
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isSubmitting ? (
                <div className="flex justify-start gap-3">
                  <div className="relative mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-[#ff6c72]/80">
                    <Image
                      src="/assistant/avatar.jpg"
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <div
                    className={cn(
                      "rounded-[1.35rem] rounded-bl-md border-[3px] px-4 py-3 text-sm font-semibold",
                      isDarkTheme
                        ? "border-black bg-[#121214] text-white/72"
                        : "border-border bg-white/82 text-foreground/72"
                    )}
                  >
                    {copy.loading}
                  </div>
                </div>
              ) : null}

              {error ? (
                <div
                  className={cn(
                    "rounded-[1.35rem] border-[3px] px-4 py-3 text-sm font-semibold leading-6",
                    isDarkTheme
                      ? "border-black bg-[#3a1820] text-[#ffd6d8]"
                      : "border-[#c7848b] bg-[#fff1f3] text-[#8f2638]"
                  )}
                >
                  {error}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={handleFormSubmit}
              className={cn(
                "border-t p-3",
                isDarkTheme ? "border-white/8 bg-[#171416]" : "border-border/70 bg-background/78"
              )}
            >
              <div className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  rows={1}
                  placeholder={copy.askWithLens(localizedLensLabel)}
                  className={cn(
                    "min-h-14 flex-1 resize-none rounded-[1.2rem] border-[3px] px-4 py-3 text-sm font-semibold outline-none",
                    isDarkTheme
                      ? "border-black bg-[#111113] text-white placeholder:text-white/38"
                      : "border-border bg-white text-foreground placeholder:text-foreground/38"
                  )}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "inline-flex h-14 w-14 items-center justify-center rounded-full border-[3px] shadow-[0_10px_24px_rgba(0,0,0,0.14)]",
                    isSubmitting
                      ? isDarkTheme
                        ? "cursor-wait border-black bg-white/16 text-white/42"
                        : "cursor-wait border-border bg-white/72 text-foreground/32"
                      : isDarkTheme
                        ? "border-black bg-[#a34a50] text-black hover:bg-[#ff6c72]"
                        : "border-[#8f2638] bg-[#ff7d82] text-[#2f1617] hover:bg-[#ff6c72]"
                  )}
                  aria-label={copy.sendLabel}
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "pointer-events-auto relative ml-auto inline-flex h-[4.75rem] w-[4.75rem] items-center justify-center overflow-hidden rounded-full border-[5px] transition-transform hover:scale-[1.03]",
          isDarkTheme
            ? "border-[#ff6c72] bg-[#14090c] shadow-[0_18px_42px_rgba(123,21,36,0.28)]"
            : "border-[#ff6c72] bg-[rgba(255,243,240,0.95)] shadow-[0_18px_42px_rgba(143,38,56,0.16)]"
        )}
        aria-expanded={isOpen}
        aria-label={isOpen ? copy.closeLabel : copy.openLabel}
      >
        {isOpen ? (
          <span
            className={cn(
              "text-4xl font-black",
              isDarkTheme ? "text-white" : "text-accent-strong"
            )}
          >
            ×
          </span>
        ) : (
          <Image
            src="/assistant/avatar.jpg"
            alt={copy.openLabel}
            fill
            sizes="76px"
            className="object-cover"
          />
        )}
      </button>
    </div>
  );
}
