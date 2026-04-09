"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getExplorePlaceBySlug, normalizeExploreSearchState } from "@/data/panorama";
import { HERITAGE_SCENE_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { GuideMode, GuideRequest, GuideResponse } from "@/types/ai-guide";

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
  label: string;
  title: string;
  intro: string;
  starters: string[];
};

type AssistantLensId = "palace" | "axis" | "ritual" | "scenery";

type AssistantLens = {
  id: AssistantLensId;
  labelZh: string;
  labelEn: string;
  title: string;
  description: string;
  contextHint: string;
  focusId: GuideRequest["focusId"];
  buildStarters: (routeContext: AssistantRouteContext) => string[];
};

const guideModes: Array<{ value: GuideMode; label: string }> = [
  { value: "short", label: "Short" },
  { value: "detailed", label: "Detailed" },
  { value: "fun", label: "Fun" },
];

const assistantLenses: AssistantLens[] = [
  {
    id: "palace",
    labelZh: "\u5bab",
    labelEn: "Palace",
    title: "Palace overview",
    description:
      "Broad orientation, major spaces, and how the whole Forbidden City route fits together.",
    contextHint:
      "Palace overview focused on broad orientation, major spaces, and how the full route fits together.",
    focusId: null,
    buildStarters: (routeContext) => [
      `Give me a short overview of ${routeContext.title}.`,
      "What is the best way to understand this palace route?",
      "What should a first-time visitor pay attention to here?",
    ],
  },
  {
    id: "axis",
    labelZh: "\u8f74",
    labelEn: "Axis",
    title: "Central axis",
    description:
      "Use this lens for alignment, procession, thresholds, and the logic of movement through the palace.",
    contextHint:
      "Central axis lens focused on procession, symmetry, thresholds, and axial order.",
    focusId: "central-axis",
    buildStarters: (routeContext) => [
      `How does the central axis shape ${routeContext.title}?`,
      "Why is axial order so important in the Forbidden City?",
      "What does this route reveal about hierarchy and procession?",
    ],
  },
  {
    id: "ritual",
    labelZh: "\u793c",
    labelEn: "Ritual",
    title: "Ritual meaning",
    description:
      "Use this lens for court hierarchy, ceremonial order, imperial symbolism, and formal spatial meaning.",
    contextHint:
      "Ritual lens focused on court hierarchy, ceremony, imperial symbolism, and formal spatial meaning.",
    focusId: "hall-of-supreme-harmony",
    buildStarters: (routeContext) => [
      `What ritual meaning should I read in ${routeContext.title}?`,
      "How does this place express ceremonial hierarchy?",
      "What does scale or elevation mean in imperial ritual space?",
    ],
  },
  {
    id: "scenery",
    labelZh: "\u666f",
    labelEn: "Scenery",
    title: "Scenic reading",
    description:
      "Use this lens for atmosphere, courtyards, framing, light, mood, and what makes a place visually memorable.",
    contextHint:
      "Scenery lens focused on atmosphere, courtyards, framing, light, and visual mood.",
    focusId: null,
    buildStarters: (routeContext) => [
      `Describe the visual mood of ${routeContext.title}.`,
      "What makes this place feel memorable or cinematic?",
      "What details make this palace scene visually distinctive?",
    ],
  },
];

function buildRouteContext(
  pathname: string,
  searchParams: SearchParamsLike
): AssistantRouteContext {
  if (pathname === "/explore") {
    const searchState = normalizeExploreSearchState({
      view: searchParams.get("view") ?? undefined,
      place: searchParams.get("place") ?? undefined,
      photo: searchParams.get("photo") ?? undefined,
    });
    const activePlace = getExplorePlaceBySlug(searchState.placeSlug);

    if (searchState.view === "place" && activePlace) {
      const placeLabel = `${activePlace.title.en} / ${activePlace.title.zh}`;

      return {
        key: `explore:${activePlace.slug}`,
        kind: "place",
        label: "Current place",
        title: placeLabel,
        intro:
          "Ask about the active palace place, its mood, or how it fits into the broader Forbidden City route.",
        starters: [
          `What should I notice first at ${activePlace.title.en}?`,
          `Why is ${activePlace.title.en} important in the Forbidden City?`,
          `Give me a short cultural reading of ${activePlace.title.en}.`,
        ],
      };
    }

    if (searchState.view === "map") {
      return {
        key: "explore:map",
        kind: "map",
        label: "Map view",
        title: "Palace map / \u5bab\u57ce\u5730\u56fe",
        intro:
          "Ask about how to read the palace map, where to begin, or how the route is structured.",
        starters: [
          "Where should I begin on the palace map?",
          "How does the route move through the main halls?",
          "What story does this map help tell?",
        ],
      };
    }

    return {
      key: "explore:welcome",
      kind: "welcome",
      label: "Explore welcome",
      title: "Palace entry / \u5165\u5883\u6545\u5bab",
      intro:
        "Ask for a quick orientation before opening the map and entering the main palace places.",
      starters: [
        "Give me a quick introduction to the Explore route.",
        "What can I discover in this palace experience?",
        "How should I move through the palace story?",
      ],
    };
  }

  if (pathname === "/tour") {
    return {
      key: "tour",
      kind: "tour",
      label: "Guided route",
      title: "Tour context / \u5bfc\u89c8",
      intro:
        "Ask about ceremonial meaning, axial order, or how the main palace route is designed to be read.",
      starters: [
        "What is the central axis?",
        "Why does symmetry matter in the palace?",
        "What changes from the outer court to the inner court?",
      ],
    };
  }

  return {
    key: "home",
    kind: "home",
    label: "Home",
    title: "Palace in Motion / \u9996\u9875",
    intro:
      "Ask about the app, the Forbidden City route, or how the Explore and selfie flow works.",
    starters: [
      "What can I do in Palace in Motion?",
      "What is special about the Forbidden City route?",
      "How does the integrated selfie feature work?",
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
  const starterQuestions = useMemo(() => {
    const lensStarters = activeLens.buildStarters(routeContext);
    return [...lensStarters, ...routeContext.starters].slice(0, 4);
  }, [activeLens, routeContext]);

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
      setError("Ask a question about the palace route.");
      return;
    }

    if (trimmedQuestion.length < 2) {
      setError("Try at least 2 characters, or use one of the starter prompts.");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
      meta: activeLens.title,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: GuideRequest = {
        sceneId: HERITAGE_SCENE_ID,
        focusId: activeLens.focusId,
        contextHint: activeLens.contextHint,
        title: `${routeContext.title} - ${activeLens.title}`,
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
        throw new Error(data.error ?? "The AI guide could not answer right now.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          meta: `${activeLens.title} | ${data.meta?.provider ?? "guide"} | ${data.contextLabel}`,
        },
      ]);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The AI guide could not answer right now."
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
            className="pointer-events-auto mb-4 flex h-[min(42rem,calc(100svh-6rem))] w-[min(26rem,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-[2rem] border-[3px] border-[#221915] bg-[#171414] text-white shadow-[0_30px_100px_rgba(0,0,0,0.48)]"
            role="dialog"
            aria-modal="false"
            aria-label="Palace AI assistant"
          >
            <div className="relative overflow-hidden border-b border-[#f2bf8d]/12 bg-[linear-gradient(135deg,#221915_0%,#1a1718_45%,#0f1115_100%)] px-4 py-4">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,132,111,0.7),transparent)]" />
              <div className="absolute -right-10 top-2 h-24 w-24 rounded-full bg-[#ff6c72]/12 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-20 w-20 rounded-full bg-[#b8874d]/12 blur-3xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-[3px] border-[#ff6c72] shadow-[0_10px_28px_rgba(123,21,36,0.36)]">
                    <Image
                      src="/assistant/avatar.jpg"
                      alt="Palace AI assistant avatar"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-2xl font-black uppercase tracking-[0.04em] text-white">
                      Palace A.
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">
                      {routeContext.label}
                    </p>
                    <p className="mt-2 text-sm text-[#f3d5be]">{routeContext.title}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-[#ff6c72] text-2xl font-black text-black shadow-[0_10px_24px_rgba(255,108,114,0.28)]"
                  aria-label="Close palace AI assistant"
                >
                  x
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
                        "inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-transform hover:-translate-y-0.5",
                        isActive
                          ? "border-[#ff6c72] bg-[#321119] text-[#ffb0b4] shadow-[0_10px_20px_rgba(123,21,36,0.24)]"
                          : "border-white/12 bg-white/6 text-white/42 hover:bg-white/10"
                      )}
                      aria-pressed={isActive}
                      aria-label={lens.title}
                      title={`${lens.title}: ${lens.description}`}
                    >
                      {lens.labelZh}
                    </button>
                  );
                })}
              </div>

              <div className="relative mt-3 rounded-[1.15rem] border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff9aa0]">
                  {activeLens.labelEn}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  {activeLens.description}
                </p>
              </div>
            </div>

            <div className="border-b border-white/8 bg-[#151416] px-4 py-3">
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
                          ? "border-[#ff6c72] bg-[#ff6c72] text-black"
                          : "border-white/10 bg-white/5 text-white/64 hover:bg-white/10"
                      )}
                    >
                      {guideMode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              ref={messageViewportRef}
              className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#262324_0%,#201d1f_100%)] px-4 py-4"
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
                        "max-w-[84%] rounded-[1.45rem] border-[3px] border-black px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.22)]",
                        message.role === "user"
                          ? "rounded-br-md bg-[#ff6c72] text-black"
                          : "rounded-bl-md bg-[#121214] text-white"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm font-semibold leading-7">
                        {message.content}
                      </p>
                      {message.meta ? (
                        <p
                          className={cn(
                            "mt-2 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            message.role === "user" ? "text-black/62" : "text-white/42"
                          )}
                        >
                          {message.meta}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border-[3px] border-black bg-[#121214] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff9aa0]">
                    {activeLens.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/80">
                    {routeContext.intro}
                  </p>
                  <div className="mt-4 grid gap-2">
                    {starterQuestions.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => handleStarterClick(starter)}
                        className="rounded-[1rem] border border-white/10 bg-white/6 px-3 py-3 text-left text-sm font-medium text-white/82 hover:bg-white/10"
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
                  <div className="rounded-[1.35rem] rounded-bl-md border-[3px] border-black bg-[#121214] px-4 py-3 text-sm font-semibold text-white/72">
                    Consulting DeepSeek...
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[1.35rem] border-[3px] border-black bg-[#3a1820] px-4 py-3 text-sm font-semibold leading-6 text-[#ffd6d8]">
                  {error}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="border-t border-white/8 bg-[#171416] p-3"
            >
              <div className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  rows={1}
                  placeholder={`Ask with the ${activeLens.labelEn.toLowerCase()} lens...`}
                  className="min-h-14 flex-1 resize-none rounded-[1.2rem] border-[3px] border-black bg-[#111113] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/38"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "inline-flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black shadow-[0_10px_24px_rgba(0,0,0,0.2)]",
                    isSubmitting
                      ? "cursor-wait bg-white/16 text-white/42"
                      : "bg-[#a34a50] text-black hover:bg-[#ff6c72]"
                  )}
                  aria-label="Send question to palace AI assistant"
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
        className="pointer-events-auto relative ml-auto inline-flex h-[4.75rem] w-[4.75rem] items-center justify-center overflow-hidden rounded-full border-[5px] border-[#ff6c72] bg-[#14090c] shadow-[0_18px_42px_rgba(123,21,36,0.36)] transition-transform hover:scale-[1.03]"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close palace AI assistant" : "Open palace AI assistant"}
      >
        {isOpen ? (
          <span className="text-4xl font-black text-white">x</span>
        ) : (
          <Image
            src="/assistant/avatar.jpg"
            alt="Open palace AI assistant"
            fill
            sizes="76px"
            className="object-cover"
          />
        )}
      </button>
    </div>
  );
}
