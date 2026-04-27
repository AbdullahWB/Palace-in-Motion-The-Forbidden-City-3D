"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import {
  buildRouteContextFromUrl,
  companionGuideModes,
  companionLenses,
  COMPANION_HISTORY_LIMIT,
  COMPANION_HISTORY_STORAGE_KEY,
  createCompanionMessage,
  formatGuideResponse,
  getCompanionCopy,
  getLensById,
  getSiteActionHref,
  getStarterPrompts,
  inferGuideIntent,
  sanitizeStoredMessages,
  type CompanionChatMessage,
  type CompanionLensId,
} from "@/features/companion/companion-shared";
import {
  exploreExperience,
  getCompletedJourneyRouteIds,
  getExploreJourneyById,
  getExploreJourneyPlaces,
  getExploreJourneyStopIndex,
  getExplorePlaceBySlug,
  getUnlockedPassportSealIds,
} from "@/data/panorama";
import { pickLocalizedText } from "@/lib/i18n";
import { HERITAGE_SCENE_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type {
  GuideIntent,
  GuideMode,
  GuideRequest,
  GuideResponse,
  GuideSiteActionPayload,
  TourBuilderInterest,
} from "@/types/ai-guide";
import type { ExploreJourneyRouteId, ExplorePlaceSlug } from "@/types/content";

const tourInterestOptions: Array<{
  value: TourBuilderInterest;
  label: string;
}> = [
  { value: "architecture", label: "Architecture" },
  { value: "history", label: "History" },
  { value: "gardens", label: "Gardens" },
  { value: "photography", label: "Photography" },
  { value: "overview", label: "Quick overview" },
];

function routePlaceHref(
  placeSlug: ExplorePlaceSlug,
  routeId?: ExploreJourneyRouteId | null
) {
  return routeId
    ? `/?view=place&place=${placeSlug}&route=${routeId}`
    : `/?view=place&place=${placeSlug}`;
}

function routeMapHref(routeId?: ExploreJourneyRouteId | null) {
  return routeId ? `/?view=map&route=${routeId}` : "/?view=map";
}

function getFirstUnvisitedPlace(
  placeOrder: ExplorePlaceSlug[],
  visitedPlaceSlugs: ExplorePlaceSlug[]
) {
  return (
    placeOrder.find((placeSlug) => !visitedPlaceSlugs.includes(placeSlug)) ??
    placeOrder[0] ??
    null
  );
}

function getRouteStopHref({
  routeId,
  placeSlug,
}: {
  routeId: ExploreJourneyRouteId | null;
  placeSlug: ExplorePlaceSlug | null;
}) {
  if (!placeSlug) {
    return routeMapHref(routeId);
  }

  return routePlaceHref(placeSlug, routeId);
}

export function CompanionPageClient() {
  const router = useRouter();
  const { language, setLanguage, theme } = useSitePreferences();
  const copy = getCompanionCopy(language);
  const isDarkTheme = theme === "dark";
  const visitedPlaceSlugs = useAppStore((state) => state.visitedExplorePlaceSlugs);
  const passportMissions = useAppStore((state) => state.passportMissions);
  const activeExploreRouteId = useAppStore((state) => state.activeExploreRouteId);
  const customTours = useAppStore((state) => state.customTours);
  const activeCustomTourId = useAppStore((state) => state.activeCustomTourId);
  const answerPassportMission = useAppStore((state) => state.answerPassportMission);
  const saveCustomTour = useAppStore((state) => state.saveCustomTour);
  const setActiveCustomTour = useAppStore((state) => state.setActiveCustomTour);
  const resetExploreProgress = useAppStore((state) => state.resetExploreProgress);
  const setActiveExploreRoute = useAppStore((state) => state.setActiveExploreRoute);
  const defaultRouteId =
    activeExploreRouteId ?? exploreExperience.journeys[0]?.id ?? null;
  const [selectedRouteId, setSelectedRouteId] =
    useState<ExploreJourneyRouteId | null>(defaultRouteId);
  const selectedRoute = getExploreJourneyById(selectedRouteId);
  const selectedRoutePlaces = useMemo(
    () => getExploreJourneyPlaces(selectedRoute),
    [selectedRoute]
  );
  const [selectedPlaceSlug, setSelectedPlaceSlug] =
    useState<ExplorePlaceSlug | null>(
      selectedRoute?.placeOrder[0] ?? exploreExperience.places[0]?.slug ?? null
    );
  const selectedPlace = getExplorePlaceBySlug(selectedPlaceSlug);
  const selectedStopIndex = getExploreJourneyStopIndex(
    selectedRoute,
    selectedPlaceSlug
  );
  const [activeLensId, setActiveLensId] = useState<CompanionLensId>("palace");
  const [mode, setMode] = useState<GuideMode>("detailed");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<CompanionChatMessage[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [builderTimeBudget, setBuilderTimeBudget] = useState<5 | 10 | 20>(10);
  const [builderInterests, setBuilderInterests] = useState<TourBuilderInterest[]>([
    "overview",
  ]);
  const messageViewportRef = useRef<HTMLDivElement | null>(null);
  const activeLens = getLensById(activeLensId);
  const routeContext = buildRouteContextFromUrl("/companion", new URLSearchParams(), language);
  const starterPrompts = getStarterPrompts(routeContext).map((starter) =>
    pickLocalizedText(starter, language)
  );
  const activeCustomTour =
    customTours.find((tour) => tour.id === activeCustomTourId) ?? null;
  const completedRouteIds = getCompletedJourneyRouteIds(visitedPlaceSlugs);
  const unlockedSealIds = getUnlockedPassportSealIds(completedRouteIds);
  const passportCompletion = Math.round(
    (visitedPlaceSlugs.length / Math.max(1, exploreExperience.places.length)) * 100
  );
  const stampCount = passportMissions.filter((mission) => mission.stampUnlocked).length;
  const missionByPlace = useMemo(
    () => new Map(passportMissions.map((mission) => [mission.placeSlug, mission])),
    [passportMissions]
  );
  const continuePlaceSlug =
    activeCustomTour?.orderedPlaceSlugs[activeCustomTour.currentStopIndex] ??
    (selectedRoute
      ? getFirstUnvisitedPlace(selectedRoute.placeOrder, visitedPlaceSlugs)
      : exploreExperience.places[0]?.slug) ??
    null;
  const continueHref = activeCustomTour
    ? getRouteStopHref({ routeId: null, placeSlug: continuePlaceSlug })
    : getRouteStopHref({
        routeId: selectedRoute?.id ?? null,
        placeSlug: continuePlaceSlug,
      });
  const nextPlaceSlug =
    selectedRoute && selectedStopIndex >= 0
      ? selectedRoute.placeOrder[selectedStopIndex + 1] ?? null
      : continuePlaceSlug;
  const nextStopHref = getRouteStopHref({
    routeId: selectedRoute?.id ?? null,
    placeSlug: nextPlaceSlug,
  });
  const startRouteHref = getRouteStopHref({
    routeId: selectedRoute?.id ?? null,
    placeSlug: selectedRoute?.placeOrder[0] ?? null,
  });

  useEffect(() => {
    if (!activeExploreRouteId || selectedRouteId) {
      return;
    }

    setSelectedRouteId(activeExploreRouteId);
  }, [activeExploreRouteId, selectedRouteId]);

  useEffect(() => {
    if (!selectedRoute) {
      return;
    }

    if (!selectedPlaceSlug || !selectedRoute.placeOrder.includes(selectedPlaceSlug)) {
      setSelectedPlaceSlug(selectedRoute.placeOrder[0] ?? null);
    }
  }, [selectedPlaceSlug, selectedRoute]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COMPANION_HISTORY_STORAGE_KEY);
      setMessages(stored ? sanitizeStoredMessages(JSON.parse(stored)) : []);
    } catch {
      setMessages([]);
    } finally {
      setIsHistoryLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isHistoryLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        COMPANION_HISTORY_STORAGE_KEY,
        JSON.stringify(messages.slice(-COMPANION_HISTORY_LIMIT))
      );
    } catch {
      // Keep runtime history even when storage is unavailable.
    }
  }, [isHistoryLoaded, messages]);

  useEffect(() => {
    messageViewportRef.current?.scrollTo({
      top: messageViewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSubmitting]);

  function setRoute(routeId: ExploreJourneyRouteId) {
    const route = getExploreJourneyById(routeId);
    setSelectedRouteId(routeId);
    setActiveExploreRoute(routeId);
    setActiveCustomTour(null);
    setSelectedPlaceSlug(route?.placeOrder[0] ?? null);
  }

  function toggleBuilderInterest(interest: TourBuilderInterest) {
    setBuilderInterests((current) => {
      if (current.includes(interest)) {
        return current.length === 1
          ? ["overview"]
          : current.filter((item) => item !== interest);
      }

      return [...current.filter((item) => item !== "overview"), interest];
    });
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

    if (action.command === "open_passport") {
      return;
    }

    if (action.command === "continue_route") {
      router.push(continueHref);
      return;
    }

    if (action.command === "next_stop") {
      router.push(nextStopHref);
      return;
    }

    if (action.command === "start_route") {
      router.push(startRouteHref);
      return;
    }

    const href = getSiteActionHref(action, selectedRoute?.id ?? null);
    if (href) {
      router.push(href);
    }
  }

  function buildGuideRequest({
    prompt,
    intent,
    timeBudget,
    interests,
  }: {
    prompt: string;
    intent?: GuideIntent;
    timeBudget?: 5 | 10 | 20 | null;
    interests?: TourBuilderInterest[];
  }): GuideRequest {
    const resolvedIntent = intent ?? inferGuideIntent(prompt, mode);

    return {
      sceneId: HERITAGE_SCENE_ID,
      focusId: activeLens.focusId,
      placeSlug: selectedPlaceSlug,
      contextHint: pickLocalizedText(activeLens.contextHint, language),
      title: [
        selectedRoute ? pickLocalizedText(selectedRoute.title, language) : null,
        selectedPlace ? pickLocalizedText(selectedPlace.title, language) : null,
        pickLocalizedText(activeLens.title, language),
      ]
        .filter(Boolean)
        .join(" - "),
      language,
      question: prompt,
      mode,
      intent: resolvedIntent,
      timeBudget:
        resolvedIntent === "tour_builder" ? (timeBudget ?? builderTimeBudget) : null,
      interests:
        resolvedIntent === "tour_builder"
          ? (interests ?? builderInterests)
          : [],
      journeyRouteId: selectedRoute?.id ?? null,
      journeyTitle: selectedRoute
        ? pickLocalizedText(selectedRoute.title, language)
        : null,
      journeyDescription: selectedRoute
        ? pickLocalizedText(selectedRoute.description ?? selectedRoute.intro, language)
        : null,
      journeyStopIndex: selectedStopIndex >= 0 ? selectedStopIndex + 1 : null,
      journeyStopTotal: selectedRoute?.placeOrder.length ?? null,
      frameCaption: null,
    };
  }

  async function submitQuestion(
    nextQuestion: string,
    options: {
      intent?: GuideIntent;
      timeBudget?: 5 | 10 | 20 | null;
      interests?: TourBuilderInterest[];
    } = {}
  ) {
    const trimmedQuestion = nextQuestion.trim();

    if (!trimmedQuestion || isSubmitting) {
      return;
    }

    const userMessage = createCompanionMessage(
      "user",
      trimmedQuestion,
      pickLocalizedText(activeLens.title, language)
    );
    setMessages((current) =>
      [...current, userMessage].slice(-COMPANION_HISTORY_LIMIT)
    );
    setQuestion("");
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = buildGuideRequest({
        prompt: trimmedQuestion,
        intent: options.intent,
        timeBudget: options.timeBudget,
        interests: options.interests,
      });
      const response = await fetch("/api/chat", {
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

      if (data.customTour) {
        saveCustomTour(data.customTour);
      }

      if (data.siteAction) {
        executeSiteAction(data.siteAction);
      }

      setMessages((current) =>
        [
          ...current,
          createCompanionMessage(
            "assistant",
            formatGuideResponse(data),
            [
              data.meta?.provider ?? "guide",
              data.aiLabel ?? copy.aiLabel,
            ]
              .filter(Boolean)
              .join(" | "),
            data
          ),
        ].slice(-COMPANION_HISTORY_LIMIT)
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : copy.error
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function answerQuiz(response: GuideResponse, optionId: string) {
    if (!response.quiz) {
      return;
    }

    answerPassportMission(
      response.quiz.placeSlug,
      optionId === response.quiz.correctOptionId
    );
  }

  function clearHistory() {
    setMessages([]);
    try {
      window.localStorage.removeItem(COMPANION_HISTORY_STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
  }

  function buildTour() {
    const interests: TourBuilderInterest[] = builderInterests.length
      ? builderInterests
      : ["overview"];
    const readableInterests = interests
      .map(
        (interest) =>
          tourInterestOptions.find((option) => option.value === interest)?.label ??
          interest
      )
      .join(", ");
    void submitQuestion(
      `Build a ${builderTimeBudget}-minute tour for ${readableInterests}.`,
      {
        intent: "tour_builder",
        timeBudget: builderTimeBudget,
        interests,
      }
    );
  }

  function renderRoutePanel(isCompact = false) {
    return (
      <section
        className={cn(
          "rounded-[2rem] border p-5 shadow-[0_24px_80px_rgba(28,18,12,0.12)]",
          isDarkTheme
            ? "border-white/10 bg-[#171313] text-white"
            : "border-[#7c5b35]/20 bg-[#fff8ee]/88 text-[#261a13]",
          isCompact ? "" : "lg:sticky lg:top-24"
        )}
      >
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#bb8a55]">
          {copy.routes}
        </p>
        <h2 className="mt-3 text-2xl font-black">
          {selectedRoute ? pickLocalizedText(selectedRoute.title, language) : "Route"}
        </h2>
        <p className="mt-3 text-sm font-semibold leading-7 opacity-72">
          {selectedRoute
            ? pickLocalizedText(selectedRoute.description, language)
            : copy.empty}
        </p>

        <div className="mt-5 grid gap-2">
          {exploreExperience.journeys.map((journey) => {
            const visitedCount = journey.placeOrder.filter((placeSlug) =>
              visitedPlaceSlugs.includes(placeSlug)
            ).length;
            const isActive = selectedRouteId === journey.id;

            return (
              <button
                key={journey.id}
                type="button"
                onClick={() => setRoute(journey.id)}
                className={cn(
                  "rounded-[1.25rem] border px-4 py-3 text-left transition-transform hover:-translate-y-0.5",
                  isActive
                    ? "border-[#e8bd73] bg-[#e8bd73] text-black"
                    : isDarkTheme
                      ? "border-white/10 bg-white/5 text-white/78"
                      : "border-[#7c5b35]/16 bg-white/70 text-[#261a13]"
                )}
              >
                <span className="text-sm font-black">
                  {pickLocalizedText(journey.title, language)}
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.18em] opacity-62">
                  {visitedCount}/{journey.placeOrder.length} stops visited
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={routeMapHref(selectedRoute?.id ?? null)}
            className="rounded-full border border-[#e8bd73]/35 bg-[#e8bd73]/14 px-4 py-2 text-sm font-black text-[#d69b54]"
          >
            Open map
          </Link>
          <Link
            href={startRouteHref}
            className="rounded-full border border-[#ff777d]/35 bg-[#ff777d]/16 px-4 py-2 text-sm font-black text-[#ff7a80]"
          >
            Start route
          </Link>
        </div>

        <div className="mt-5 grid gap-2">
          {selectedRoutePlaces.map((place) => {
            const isSelected = selectedPlaceSlug === place.slug;
            const isVisited = visitedPlaceSlugs.includes(place.slug);
            const mission = missionByPlace.get(place.slug);

            return (
              <button
                key={place.slug}
                type="button"
                onClick={() => setSelectedPlaceSlug(place.slug)}
                className={cn(
                  "rounded-[1.1rem] border px-3 py-3 text-left text-sm",
                  isSelected
                    ? "border-[#ff777d] bg-[#ff777d]/18"
                    : isDarkTheme
                      ? "border-white/10 bg-black/16"
                      : "border-[#7c5b35]/12 bg-white/62"
                )}
              >
                <span className="font-black">
                  {pickLocalizedText(place.title, language)}
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] opacity-58">
                  {isVisited ? "Visited" : "Unvisited"}
                  {mission?.stampUnlocked ? " | Stamp earned" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  function renderToolsPanel(isCompact = false) {
    return (
      <section
        className={cn(
          "rounded-[2rem] border p-5 shadow-[0_24px_80px_rgba(28,18,12,0.12)]",
          isDarkTheme
            ? "border-white/10 bg-[#171313] text-white"
            : "border-[#7c5b35]/20 bg-[#fff8ee]/88 text-[#261a13]",
          isCompact ? "" : "lg:sticky lg:top-24"
        )}
      >
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#bb8a55]">
          {copy.passport}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["Visited", `${visitedPlaceSlugs.length}/${exploreExperience.places.length}`],
            ["Complete", `${passportCompletion}%`],
            ["Stamps", `${stampCount}`],
          ].map(([label, value]) => (
            <div
              key={label}
              className={cn(
                "rounded-[1.2rem] border p-3",
                isDarkTheme
                  ? "border-white/10 bg-white/5"
                  : "border-[#7c5b35]/12 bg-white/68"
              )}
            >
              <p className="text-lg font-black">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] opacity-58">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[#e8bd73]"
            style={{ width: `${passportCompletion}%` }}
          />
        </div>

        <div className="mt-5 grid gap-2">
          {exploreExperience.passport.routeSeals.map((seal) => {
            const unlocked = unlockedSealIds.includes(seal.id);

            return (
              <div
                key={seal.id}
                className={cn(
                  "rounded-[1.1rem] border px-3 py-3",
                  unlocked
                    ? "border-[#e8bd73]/40 bg-[#e8bd73]/16"
                    : isDarkTheme
                      ? "border-white/10 bg-black/16 opacity-60"
                      : "border-[#7c5b35]/12 bg-white/62 opacity-70"
                )}
              >
                <p className="text-sm font-black">
                  {pickLocalizedText(seal.title, language)}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] opacity-58">
                  {unlocked ? "Badge unlocked" : "Complete route to unlock"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={continueHref}
            className="rounded-full border border-[#e8bd73]/35 bg-[#e8bd73]/14 px-4 py-2 text-sm font-black text-[#d69b54]"
          >
            Continue
          </Link>
          <Link
            href={nextStopHref}
            className="rounded-full border border-[#ff777d]/35 bg-[#ff777d]/16 px-4 py-2 text-sm font-black text-[#ff7a80]"
          >
            Next stop
          </Link>
          <button
            type="button"
            onClick={resetExploreProgress}
            className="rounded-full border border-white/15 bg-black/10 px-4 py-2 text-sm font-black opacity-72"
          >
            Reset
          </button>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#bb8a55]">
            {copy.tourBuilder}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {([5, 10, 20] as const).map((timeBudget) => (
              <button
                key={timeBudget}
                type="button"
                onClick={() => setBuilderTimeBudget(timeBudget)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-black",
                  builderTimeBudget === timeBudget
                    ? "border-[#e8bd73] bg-[#e8bd73] text-black"
                    : "border-white/12 bg-white/8"
                )}
              >
                {timeBudget} min
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tourInterestOptions.map((option) => {
              const isActive = builderInterests.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleBuilderInterest(option.value)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-black",
                    isActive
                      ? "border-[#ff777d] bg-[#ff777d]/18 text-[#ff858a]"
                      : "border-white/12 bg-white/8 opacity-72"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={buildTour}
            disabled={isSubmitting}
            className="mt-4 w-full rounded-full border border-[#e8bd73] bg-[#e8bd73] px-4 py-3 text-sm font-black text-black disabled:cursor-wait disabled:opacity-60"
          >
            Build tour
          </button>

          {customTours.length ? (
            <div className="mt-5 grid gap-2">
              {customTours.slice(0, 3).map((tour) => (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => {
                    setActiveCustomTour(tour.id);
                    router.push(
                      getRouteStopHref({
                        routeId: null,
                        placeSlug:
                          tour.orderedPlaceSlugs[tour.currentStopIndex] ??
                          tour.orderedPlaceSlugs[0] ??
                          null,
                      })
                    );
                  }}
                  className="rounded-[1.1rem] border border-white/10 bg-white/6 px-3 py-3 text-left"
                >
                  <p className="text-sm font-black">{tour.title}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] opacity-58">
                    {tour.orderedPlaceSlugs.length} stops | {tour.timeBudget} min
                  </p>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8",
        isDarkTheme
          ? "bg-[#0d0b0b] text-white"
          : "bg-[linear-gradient(135deg,#f6ead8_0%,#efe0c9_48%,#d7c3a4_100%)] text-[#241811]"
      )}
    >
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-[#c53b46]/18 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#d7a953]/22 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-[#274838]/18 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[94rem]">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-black/20 p-5 shadow-[0_30px_100px_rgba(32,20,12,0.18)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#e8bd73]">
              {copy.subtitle}
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em] md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 opacity-72 md:text-base">
              Chat, build tours, continue the route, answer Passport quizzes, and
              move into the map when you are ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/?view=map"
              className="rounded-full border border-[#e8bd73]/35 bg-[#e8bd73]/14 px-5 py-3 text-sm font-black text-[#e8bd73]"
            >
              Open map
            </Link>
            <Link
              href="/3d-view"
              prefetch={false}
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black"
            >
              3D view
            </Link>
          </div>
        </header>

        <div className="mb-4 grid gap-4 lg:hidden">
          <details className="rounded-[1.5rem] border border-white/10 bg-black/18 p-3" open>
            <summary className="cursor-pointer px-2 py-2 text-sm font-black uppercase tracking-[0.2em]">
              Routes
            </summary>
            <div className="mt-2">{renderRoutePanel(true)}</div>
          </details>
          <details className="rounded-[1.5rem] border border-white/10 bg-black/18 p-3">
            <summary className="cursor-pointer px-2 py-2 text-sm font-black uppercase tracking-[0.2em]">
              Passport and tools
            </summary>
            <div className="mt-2">{renderToolsPanel(true)}</div>
          </details>
        </div>

        <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)_23rem]">
          <div className="hidden lg:block">{renderRoutePanel()}</div>

          <section
            className={cn(
              "flex min-h-[72svh] flex-col overflow-hidden rounded-[2.2rem] border shadow-[0_30px_100px_rgba(23,14,9,0.22)]",
              isDarkTheme
                ? "border-white/10 bg-[#111010]"
                : "border-[#7c5b35]/20 bg-[#fffaf2]/90"
            )}
          >
            <div className="border-b border-white/10 p-4">
              <div className="flex flex-wrap items-center gap-2">
                {companionLenses.map((lens) => {
                  const isActive = activeLensId === lens.id;

                  return (
                    <button
                      key={lens.id}
                      type="button"
                      onClick={() => setActiveLensId(lens.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-black",
                        isActive
                          ? "border-[#ff777d] bg-[#ff777d] text-black"
                          : "border-white/12 bg-white/8 opacity-72"
                      )}
                      title={pickLocalizedText(lens.description, language)}
                    >
                      {lens.glyph} {pickLocalizedText(lens.label, language)}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {companionGuideModes.map((guideMode) => {
                  const isActive = mode === guideMode.value;

                  return (
                    <button
                      key={guideMode.value}
                      type="button"
                      onClick={() => setMode(guideMode.value)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em]",
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
            </div>

            <div
              ref={messageViewportRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6"
            >
              {!messages.length ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/7 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#e8bd73]">
                    {copy.history}
                  </p>
                  <p className="mt-3 text-base font-semibold leading-8 opacity-76">
                    {copy.empty}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {starterPrompts.slice(0, 6).map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => void submitQuestion(starter)}
                        className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-black"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((message) => {
                const isAssistant = message.role === "assistant";

                return (
                  <article
                    key={message.id}
                    className={cn(
                      "flex",
                      isAssistant ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-[1.5rem] border px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.16)]",
                        isAssistant
                          ? isDarkTheme
                            ? "border-white/10 bg-white/7"
                            : "border-[#7c5b35]/16 bg-white/86"
                          : "border-[#ff777d] bg-[#ff777d] text-black"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm font-semibold leading-7">
                        {message.content}
                      </p>
                      {message.response?.quiz ? (
                        <div className="mt-4 grid gap-2">
                          {message.response.quiz.options.map((option) => {
                            const mission = missionByPlace.get(
                              message.response?.quiz?.placeSlug ?? "tianyi-men"
                            );
                            const wasAnswered = mission?.quizAnswered === true;
                            const isCorrect =
                              option.id === message.response?.quiz?.correctOptionId;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => answerQuiz(message.response!, option.id)}
                                disabled={wasAnswered}
                                className={cn(
                                  "rounded-[1rem] border px-3 py-2 text-left text-sm font-black disabled:cursor-not-allowed",
                                  wasAnswered && isCorrect
                                    ? "border-[#8bc28f] bg-[#8bc28f]/20"
                                    : "border-white/12 bg-white/8"
                                )}
                              >
                                {option.id.toUpperCase()}. {option.text}
                              </button>
                            );
                          })}
                          {missionByPlace.get(message.response.quiz.placeSlug)
                            ?.quizAnswered ? (
                            <p className="text-sm font-semibold leading-6 opacity-72">
                              {message.response.quiz.explanation}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {message.meta ? (
                        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] opacity-52">
                          {message.meta}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}

              {isSubmitting ? (
                <div className="rounded-[1.3rem] border border-white/10 bg-white/7 px-4 py-3 text-sm font-black opacity-72">
                  {copy.loading}
                </div>
              ) : null}
              {error ? (
                <div className="rounded-[1.3rem] border border-[#ff777d]/40 bg-[#ff777d]/14 px-4 py-3 text-sm font-black text-[#ff9ca1]">
                  {error}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void submitQuestion(question);
              }}
              className="sticky bottom-0 border-t border-white/10 bg-black/18 p-4 backdrop-blur"
            >
              <div className="mb-3 flex flex-wrap justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {starterPrompts.slice(0, 4).map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => void submitQuestion(starter)}
                      className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-black"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-black opacity-70"
                >
                  {copy.clearHistory}
                </button>
              </div>
              <div className="flex items-end gap-3">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={1}
                  placeholder={copy.askPlaceholder}
                  className={cn(
                    "min-h-14 flex-1 resize-none rounded-[1.25rem] border px-4 py-3 text-sm font-bold outline-none",
                    isDarkTheme
                      ? "border-white/10 bg-black/30 text-white placeholder:text-white/36"
                      : "border-[#7c5b35]/20 bg-white/92 text-[#241811] placeholder:text-[#241811]/42"
                  )}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 rounded-full border border-[#ff777d] bg-[#ff777d] px-6 text-sm font-black text-black disabled:cursor-wait disabled:opacity-60"
                >
                  {copy.send}
                </button>
              </div>
            </form>
          </section>

          <div className="hidden lg:block">{renderToolsPanel()}</div>
        </div>
      </div>
    </div>
  );
}
