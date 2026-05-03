"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "@/components/ui/hydration-safe-image";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import {
  buildRouteContextFromUrl,
  companionGuideModes,
  companionLenses,
  formatGuideResponse,
  getCompanionCopy,
  getDefaultLensId,
  getLensById,
  getSiteActionHref,
  getStarterPrompts,
  inferGuideIntent,
} from "@/features/companion/companion-shared";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { appRoutes } from "@/lib/app-routes";
import { pickLocalizedText } from "@/lib/i18n";
import { HERITAGE_SCENE_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  GuideMode,
  GuideRequest,
  GuideResponse,
  GuideSiteActionPayload,
} from "@/types/ai-guide";
import type { CompanionLensId } from "@/features/companion/companion-shared";

const ASSISTANT_NUDGE_INTERVAL_MS = 14000;
const ASSISTANT_NUDGE_VISIBLE_MS = 7200;

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion() ?? false;
  const { language, setLanguage, theme } = useSitePreferences();
  const copy = getCompanionCopy(language);
  const isDarkTheme = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<GuideMode>("short");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerMeta, setAnswerMeta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLensId, setActiveLensId] = useState<CompanionLensId>("palace");
  const [nudgeIndex, setNudgeIndex] = useState(0);
  const [isNudgeVisible, setIsNudgeVisible] = useState(false);
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const routeContext = useMemo(
    () => buildRouteContextFromUrl(pathname, searchParams, language),
    [language, pathname, searchParams]
  );
  const activeLens = getLensById(activeLensId);
  const starterPrompts = useMemo(
    () =>
      getStarterPrompts(routeContext)
        .slice(0, 4)
        .map((starter) => pickLocalizedText(starter, language)),
    [language, routeContext]
  );
  const nudgePrompts = useMemo(
    () =>
      language === "zh"
        ? [
            "需要我讲清楚这个空间吗？",
            "我可以帮你选下一站。",
            "点我，直接问地图、路线或印章。",
          ]
        : [
            "Need context for this palace stop?",
            "I can suggest the next place to visit.",
            "Ask me about the map, route, or stamps.",
          ],
    [language]
  );

  useEffect(() => {
    setActiveLensId(getDefaultLensId(routeContext));
    setError(null);
  }, [routeContext]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || isNudgeDismissed || reduceMotion) {
      setIsNudgeVisible(false);
      return;
    }

    const showNudge = () => {
      setNudgeIndex((currentIndex) => (currentIndex + 1) % nudgePrompts.length);
      setIsNudgeVisible(true);
      window.setTimeout(() => setIsNudgeVisible(false), ASSISTANT_NUDGE_VISIBLE_MS);
    };

    const initialTimer = window.setTimeout(showNudge, 3800);
    const interval = window.setInterval(showNudge, ASSISTANT_NUDGE_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [isNudgeDismissed, isOpen, nudgePrompts.length, reduceMotion]);

  useEscapeKey(() => setIsOpen(false), isOpen);
  useFocusTrap(panelRef, isOpen);

  if (pathname === appRoutes.companion) {
    return null;
  }

  function executeSiteAction(action: GuideSiteActionPayload) {
    if (action.command === "switch_guide_mode" && action.mode) {
      setMode(action.mode);
      return;
    }

    if (action.command === "switch_language" && action.language) {
      setLanguage(action.language);
      return;
    }

    if (pathname === appRoutes.home || pathname === appRoutes.explore) {
      window.dispatchEvent(
        new CustomEvent("palace:site-action", {
          detail: action,
        })
      );
      return;
    }

    const href = getSiteActionHref(action, routeContext.routeId ?? null);
    router.push(href ?? appRoutes.map());
  }

  async function submitQuestion(nextQuestion: string) {
    const trimmedQuestion = nextQuestion.trim();

    if (!trimmedQuestion || isSubmitting) {
      return;
    }

    setQuestion("");
    setError(null);
    setIsSubmitting(true);

    try {
      const intent = inferGuideIntent(trimmedQuestion, mode);
      const payload: GuideRequest = {
        sceneId: HERITAGE_SCENE_ID,
        focusId: activeLens.focusId,
        placeSlug: routeContext.placeSlug ?? null,
        contextHint: pickLocalizedText(activeLens.contextHint, language),
        title: `${pickLocalizedText(routeContext.title, language)} - ${pickLocalizedText(activeLens.title, language)}`,
        language,
        question: trimmedQuestion,
        mode,
        intent,
        timeBudget: intent === "tour_builder" ? 10 : null,
        interests: intent === "tour_builder" ? ["overview"] : [],
        journeyRouteId: routeContext.routeId ?? null,
        journeyTitle: routeContext.journeyTitle ?? null,
        journeyDescription: routeContext.journeyDescription ?? null,
        journeyStopIndex: routeContext.journeyStopIndex ?? null,
        journeyStopTotal: routeContext.journeyStopTotal ?? null,
        frameCaption: routeContext.frameCaption ?? null,
      };
      const response = await fetch(appRoutes.apiChat, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as GuideResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? copy.error);
      }

      if (data.siteAction) {
        executeSiteAction(data.siteAction);
      }

      setAnswer(formatGuideResponse(data));
      setAnswerMeta(
        [
          data.verification?.label,
          data.meta?.provider ?? "guide",
          data.aiLabel ?? copy.aiLabel,
        ]
          .filter(Boolean)
          .join(" | ")
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : copy.error
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[45]">
      <AnimatePresence>
        {isOpen ? (
          <motion.section
            ref={panelRef}
            tabIndex={-1}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.96 }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
            }
            className={cn(
              "pointer-events-auto mb-4 w-[min(23rem,calc(100vw-1.25rem))] overflow-hidden rounded-[1.75rem] border-[3px] shadow-[0_26px_80px_rgba(0,0,0,0.3)]",
              isDarkTheme
                ? "border-[#33231b] bg-[#121011] text-white"
                : "border-[#8a6a42]/30 bg-[#fff8ef]/96 text-[#241811]"
            )}
            role="dialog"
            aria-modal="true"
            aria-label={copy.miniTitle}
          >
            <div className="relative border-b border-white/10 p-4">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#ff777d]/22 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#ff777d]">
                    <Image
                      src="/assistant/avatar.jpg"
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-lg font-black uppercase tracking-[-0.02em]">
                      {copy.miniTitle}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] opacity-52">
                      {pickLocalizedText(routeContext.label, language)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/12 bg-[#ff777d] px-3 py-2 text-sm font-black text-black"
                  aria-label={copy.close}
                >
                  X
                </button>
              </div>

              <Link
                href={appRoutes.companion}
                className="relative mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#e8bd73]/40 bg-[#e8bd73]/16 px-4 py-3 text-sm font-black text-[#e8bd73]"
              >
                {copy.openFull}
              </Link>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-2">
                {companionLenses.slice(0, 4).map((lens) => {
                  const isActive = activeLensId === lens.id;

                  return (
                    <button
                      key={lens.id}
                      type="button"
                      onClick={() => setActiveLensId(lens.id)}
                      className={cn(
                        "rounded-full border px-3 py-2 text-xs font-black",
                        isActive
                          ? "border-[#ff777d] bg-[#ff777d] text-black"
                          : "border-white/12 bg-white/8 opacity-72"
                      )}
                    >
                      {lens.glyph}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {companionGuideModes
                  .filter((guideMode) =>
                    ["short", "detailed", "story", "academic", "exam", "quiz"].includes(
                      guideMode.value
                    )
                  )
                  .map((guideMode) => {
                    const isActive = mode === guideMode.value;

                    return (
                      <button
                        key={guideMode.value}
                        type="button"
                        onClick={() => setMode(guideMode.value)}
                        className={cn(
                          "rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em]",
                          isActive
                            ? "border-[#e8bd73] bg-[#e8bd73] text-black"
                            : "border-white/12 bg-white/8 opacity-72"
                        )}
                      >
                        {pickLocalizedText(guideMode.label, language)}
                      </button>
                    );
                  })}
              </div>

              {answer ? (
                <div className="max-h-44 overflow-y-auto rounded-[1.2rem] border border-white/10 bg-white/7 p-3">
                  <p className="whitespace-pre-wrap text-sm font-semibold leading-6">
                    {answer}
                  </p>
                  {answerMeta ? (
                    <p className="mt-2 text-[9px] font-black uppercase tracking-[0.16em] opacity-46">
                      {answerMeta}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {starterPrompts.slice(0, 3).map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => void submitQuestion(starter)}
                      className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-left text-xs font-black"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              )}

              {error ? (
                <p className="rounded-[1rem] border border-[#ff777d]/35 bg-[#ff777d]/14 px-3 py-2 text-xs font-black text-[#ff9ca1]">
                  {error}
                </p>
              ) : null}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitQuestion(question);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={copy.askPlaceholder}
                  className={cn(
                    "h-12 min-w-0 flex-1 rounded-full border px-4 text-sm font-bold outline-none",
                    isDarkTheme
                      ? "border-white/10 bg-black/28 text-white placeholder:text-white/36"
                      : "border-[#8a6a42]/20 bg-white text-[#241811] placeholder:text-[#241811]/42"
                  )}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#ff777d] bg-[#ff777d] text-black disabled:cursor-wait disabled:opacity-60"
                  aria-label={copy.send}
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {!isOpen ? (
        <div className="flex items-end gap-3">
          <AnimatePresence>
            {isNudgeVisible ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: 12, y: 8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: 10, y: 6 }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                }
                className={cn(
                  "pointer-events-auto mb-2 max-w-[17rem] rounded-[1.35rem] border px-4 py-3 shadow-[0_18px_52px_rgba(0,0,0,0.22)] backdrop-blur-xl",
                  isDarkTheme
                    ? "border-[#e8bd73]/28 bg-[#14100d]/92 text-white"
                    : "border-[#8a6a42]/22 bg-[#fff8ef]/94 text-[#241811]"
                )}
                role="status"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsNudgeVisible(false);
                    setIsOpen(true);
                  }}
                  className="block text-left text-sm font-black leading-5"
                >
                  {nudgePrompts[nudgeIndex]}
                </button>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNudgeVisible(false);
                      setIsOpen(true);
                    }}
                    className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e8bd73]"
                  >
                    {language === "zh" ? "打开助手" : "Ask now"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNudgeVisible(false);
                      setIsNudgeDismissed(true);
                    }}
                    className="rounded-full border border-current/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] opacity-70"
                    aria-label={copy.close}
                  >
                    {copy.close}
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => {
              setIsNudgeVisible(false);
              setIsOpen(true);
            }}
            className={cn(
              "pointer-events-auto relative ml-auto inline-flex h-[4.25rem] w-[4.25rem] items-center justify-center overflow-hidden rounded-full border-[4px] hover:scale-[1.03]",
              !reduceMotion && "animate-[assistantPulse_3.8s_ease-in-out_infinite]",
              isDarkTheme
                ? "border-[#ff777d] bg-[#14090c] shadow-[0_18px_42px_rgba(123,21,36,0.28)]"
                : "border-[#ff777d] bg-[rgba(255,243,240,0.95)] shadow-[0_18px_42px_rgba(143,38,56,0.16)]"
            )}
            aria-expanded={false}
            aria-label={copy.miniTitle}
          >
            <Image
              src="/assistant/avatar.jpg"
              alt=""
              fill
              sizes="68px"
              className="object-cover"
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
