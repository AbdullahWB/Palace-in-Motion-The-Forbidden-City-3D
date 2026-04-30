"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import {
  buildAchievementMissionCards,
  countCompletedAchievementMissions,
  getClassroomRouteTitle,
} from "@/lib/achievement-missions";
import {
  exploreExperience,
  getCompletedJourneyRouteIds,
  getExploreJourneyById,
  getExploreJourneyPlaces,
  getUnlockedPassportSealIds,
} from "@/data/panorama";
import {
  getPalaceKnowledgeByPlaceSlug,
  getQuizQuestionForPlace,
} from "@/data/palace-knowledge";
import { pickLocalizedText } from "@/lib/i18n";
import { buildTravelDiaryText } from "@/lib/travel-diary";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type {
  ExplorePlace,
  ExplorePlaceSlug,
} from "@/types/content";
import type {
  ClassroomAssignmentState,
  ClassroomDifficulty,
  ClassroomReportState,
  ClassroomRouteChoice,
} from "@/types/competition";

const difficultyCopy: Record<
  ClassroomDifficulty,
  { label: string; description: string }
> = {
  starter: {
    label: "Starter",
    description: "Short observation tasks for younger or first-time learners.",
  },
  standard: {
    label: "Standard",
    description: "Balanced quiz, preservation, and reflection prompts.",
  },
  challenge: {
    label: "Challenge",
    description: "Adds comparison, evidence, and presentation tasks.",
  },
};

function getRoutePlaces(routeChoice: ClassroomRouteChoice) {
  if (routeChoice === "full-palace") {
    return exploreExperience.places;
  }

  return getExploreJourneyPlaces(routeChoice);
}

function getRouteTitle(routeChoice: ClassroomRouteChoice, language: "zh" | "en") {
  if (routeChoice === "full-palace") {
    return language === "zh" ? "完整故宫学习路线" : "Full Palace Learning Route";
  }

  return pickLocalizedText(getExploreJourneyById(routeChoice)?.title, language);
}

function getRouteIntro(routeChoice: ClassroomRouteChoice, language: "zh" | "en") {
  if (routeChoice === "full-palace") {
    return language === "zh"
      ? "覆盖全部地点，适合课堂展示、分组学习或完整复习。"
      : "Covers every place for classroom showcase, group work, or full review.";
  }

  return pickLocalizedText(getExploreJourneyById(routeChoice)?.intro, language);
}

function getRouteStartHref(routeChoice: ClassroomRouteChoice) {
  if (routeChoice === "full-palace") {
    return "/?view=map";
  }

  const route = getExploreJourneyById(routeChoice);
  const firstStop = route?.placeOrder[0];

  return firstStop
    ? `/?view=place&place=${firstStop}&route=${routeChoice}`
    : `/?view=map&route=${routeChoice}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character] ?? character;
  });
}

function formatPlaceNames(places: ExplorePlace[], language: "zh" | "en") {
  return places.map((place) => pickLocalizedText(place.title, language)).join(" -> ");
}

function buildClassroomSheet({
  routeChoice,
  difficulty,
  places,
  language,
  visitedPlaceSlugs,
  passportMissions,
  diaryText,
}: {
  routeChoice: ClassroomRouteChoice;
  difficulty: ClassroomDifficulty;
  places: ExplorePlace[];
  language: "zh" | "en";
  visitedPlaceSlugs: ExplorePlaceSlug[];
  passportMissions: ReturnType<typeof useAppStore.getState>["passportMissions"];
  diaryText: string;
}) {
  const routeTitle = getRouteTitle(routeChoice, language);
  const completedRouteIds = getCompletedJourneyRouteIds(visitedPlaceSlugs);
  const seals = getUnlockedPassportSealIds(completedRouteIds);
  const quizScore = passportMissions.reduce(
    (total, mission) => total + mission.correctCount,
    0
  );
  const questions = places.slice(0, difficulty === "challenge" ? 6 : 4).map((place, index) => {
    const quiz = getQuizQuestionForPlace(place.slug);
    const knowledge = getPalaceKnowledgeByPlaceSlug(place.slug);

    return [
      `${index + 1}. ${pickLocalizedText(place.title, language)}`,
      `Question: ${pickLocalizedText(quiz?.question, language)}`,
      `Answer key: ${pickLocalizedText(
        quiz?.options.find((option) => option.id === quiz.correctOptionId)?.text,
        language
      )}`,
      `Preservation prompt: ${pickLocalizedText(
        knowledge?.preservationNote,
        language
      )}`,
    ].join("\n");
  });

  const challengePrompt =
    difficulty === "challenge"
      ? "\nChallenge extension: compare one Forbidden City route idea with another palace or heritage site. Focus on layout, movement, hierarchy, and visitor experience.\n"
      : "";

  return [
    "Palace in Motion Classroom Activity",
    `Route: ${routeTitle}`,
    `Difficulty: ${difficultyCopy[difficulty].label}`,
    "",
    "Learning goals:",
    "- Identify how routes, gates, courtyards, roofs, and thresholds shape palace movement.",
    "- Use verified local guide content instead of unsupported historical claims.",
    "- Connect cultural learning with preservation and visitor care.",
    "",
    `Route stops: ${formatPlaceNames(places, language)}`,
    "",
    "Student tasks:",
    "1. Open the assigned route and visit each stop in order.",
    "2. Answer the Passport quiz for each visited stop.",
    "3. Read one preservation note and write one visitor-care action.",
    "4. Generate or refresh the Travel Diary and submit it as the reflection record.",
    challengePrompt,
    "Quiz and preservation prompts:",
    questions.join("\n\n"),
    "",
    "Current class demo progress:",
    `Visited places: ${visitedPlaceSlugs.length}/${exploreExperience.places.length}`,
    `Correct quiz answers: ${quizScore}`,
    `Route seals unlocked: ${seals.length}`,
    "",
    "Diary submission preview:",
    diaryText,
  ].join("\n");
}

export function ClassroomToolkitPage() {
  const { language, theme } = useSitePreferences();
  const isDarkTheme = theme === "dark";
  const visitedPlaceSlugs = useAppStore((state) => state.visitedExplorePlaceSlugs);
  const passportMissions = useAppStore((state) => state.passportMissions);
  const achievementMissions = useAppStore((state) => state.achievementMissions);
  const classroomAssignments = useAppStore((state) => state.classroomAssignments);
  const classroomReports = useAppStore((state) => state.classroomReports);
  const customTours = useAppStore((state) => state.customTours);
  const activeCustomTourId = useAppStore((state) => state.activeCustomTourId);
  const activeExploreRouteId = useAppStore((state) => state.activeExploreRouteId);
  const saveClassroomAssignment = useAppStore(
    (state) => state.saveClassroomAssignment
  );
  const saveClassroomReport = useAppStore((state) => state.saveClassroomReport);
  const resetClassroomData = useAppStore((state) => state.resetClassroomData);
  const [routeChoice, setRouteChoice] =
    useState<ClassroomRouteChoice>("ceremonial-axis");
  const [difficulty, setDifficulty] =
    useState<ClassroomDifficulty>("standard");
  const [generatedAt, setGeneratedAt] = useState(0);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const [reportCopyStatus, setReportCopyStatus] = useState<
    "idle" | "copied" | "error"
  >("idle");

  const routeChoices = useMemo(
    () => [
      ...exploreExperience.journeys.map((journey) => ({
        id: journey.id,
        title: pickLocalizedText(journey.title, language),
        description: pickLocalizedText(journey.description, language),
      })),
      {
        id: "full-palace" as const,
        title: language === "zh" ? "完整故宫" : "Full Palace",
        description:
          language === "zh"
            ? "把所有地点作为课堂复习路线。"
            : "Use every place as a classroom review route.",
      },
    ],
    [language]
  );
  const selectedPlaces = useMemo(
    () => getRoutePlaces(routeChoice),
    [routeChoice]
  );
  const diaryText = useMemo(
    () =>
      buildTravelDiaryText({
        language,
        visitedPlaceSlugs,
        passportMissions,
        customTours,
        activeCustomTourId,
        activeExploreRouteId,
        achievementMissions,
        generatedAt,
      }),
    [
      activeCustomTourId,
      activeExploreRouteId,
      customTours,
      generatedAt,
      achievementMissions,
      language,
      passportMissions,
      visitedPlaceSlugs,
    ]
  );
  const taskSheet = useMemo(
    () =>
      buildClassroomSheet({
        routeChoice,
        difficulty,
        places: selectedPlaces,
        language,
        visitedPlaceSlugs,
        passportMissions,
        diaryText,
      }),
    [
      diaryText,
      difficulty,
      language,
      passportMissions,
      routeChoice,
      selectedPlaces,
      visitedPlaceSlugs,
    ]
  );
  const completedRouteIds = getCompletedJourneyRouteIds(visitedPlaceSlugs);
  const sealCount = getUnlockedPassportSealIds(completedRouteIds).length;
  const correctAnswers = passportMissions.reduce(
    (total, mission) => total + mission.correctCount,
    0
  );
  const achievementCards = useMemo(
    () =>
      buildAchievementMissionCards({
        language,
        visitedPlaceSlugs,
        passportMissions,
        achievementMissions,
        classroomAssignments,
        classroomReports,
      }),
    [
      achievementMissions,
      classroomAssignments,
      classroomReports,
      language,
      passportMissions,
      visitedPlaceSlugs,
    ]
  );
  const completedAchievementCount =
    countCompletedAchievementMissions(achievementCards);
  const completedAchievementTitles = achievementCards
    .filter((mission) => mission.completed)
    .map((mission) => mission.title)
    .slice(0, 8);
  const reportText = useMemo(
    () =>
      [
        "Palace in Motion Classroom Progress Report",
        `Route: ${getClassroomRouteTitle(routeChoice, language)}`,
        `Difficulty: ${difficultyCopy[difficulty].label}`,
        `Generated: ${
          generatedAt
            ? new Date(generatedAt).toLocaleString(
                language === "zh" ? "zh-CN" : "en-US"
              )
            : language === "zh"
              ? "当前课堂会话"
              : "Current classroom session"
        }`,
        "",
        `Visited places: ${visitedPlaceSlugs.length}/${exploreExperience.places.length}`,
        `Correct quiz answers: ${correctAnswers}`,
        `Route seals unlocked: ${sealCount}`,
        `Achievement missions completed: ${completedAchievementCount}/${achievementCards.length}`,
        completedAchievementTitles.length
          ? `Completed badges: ${completedAchievementTitles.join(", ")}`
          : "Completed badges: none yet",
        "",
        "Required stops:",
        formatPlaceNames(selectedPlaces, language),
        "",
        "Diary submission guidance:",
        "Students should export or print the Travel Diary after completing the assigned route and quizzes.",
        "",
        "Current diary snapshot:",
        diaryText,
      ].join("\n"),
    [
      achievementCards.length,
      completedAchievementCount,
      completedAchievementTitles,
      correctAnswers,
      diaryText,
      difficulty,
      generatedAt,
      language,
      routeChoice,
      sealCount,
      selectedPlaces,
      visitedPlaceSlugs.length,
    ]
  );

  async function copyTaskSheet() {
    try {
      await window.navigator.clipboard.writeText(taskSheet);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  function printTaskSheet() {
    const printWindow = window.open("", "palace-classroom-sheet", "width=860,height=960");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Palace in Motion Classroom Activity</title>
          <style>
            body { font-family: Georgia, serif; margin: 32px; color: #211712; }
            pre { white-space: pre-wrap; line-height: 1.65; font-size: 14px; }
          </style>
        </head>
        <body><pre>${escapeHtml(taskSheet)}</pre></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function saveAssignment() {
    const timestamp = Date.now();
    const assignment: ClassroomAssignmentState = {
      id: `assignment-${timestamp}`,
      title: getRouteTitle(routeChoice, language),
      routeId: routeChoice,
      difficulty,
      requiredPlaceSlugs: selectedPlaces.map((place) => place.slug),
      worksheetText: taskSheet,
      createdAt: timestamp,
    };

    saveClassroomAssignment(assignment);
  }

  function saveReport() {
    const timestamp = Date.now();
    const latestAssignment = classroomAssignments[0];
    const report: ClassroomReportState = {
      id: `report-${timestamp}`,
      assignmentId: latestAssignment?.id ?? `assignment-${timestamp}`,
      title: `${getRouteTitle(routeChoice, language)} report`,
      visitedCount: visitedPlaceSlugs.length,
      correctQuizCount: correctAnswers,
      routeSealCount: sealCount,
      completedMissionCount: completedAchievementCount,
      reportText,
      createdAt: timestamp,
    };

    saveClassroomReport(report);
  }

  async function copyReport() {
    try {
      await window.navigator.clipboard.writeText(reportText);
      setReportCopyStatus("copied");
    } catch {
      setReportCopyStatus("error");
    }
  }

  function printReport() {
    const printWindow = window.open("", "palace-classroom-report", "width=860,height=960");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Palace in Motion Classroom Report</title>
          <style>
            body { font-family: Georgia, serif; margin: 32px; color: #211712; }
            pre { white-space: pre-wrap; line-height: 1.65; font-size: 14px; }
          </style>
        </head>
        <body><pre>${escapeHtml(reportText)}</pre></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <section
      className={cn(
        "min-h-[100svh] py-10",
        isDarkTheme
          ? "bg-[#080b12] text-white"
          : "bg-[radial-gradient(circle_at_top,#fff4df_0%,#f3e4ca_42%,#d9c5a7_100%)] text-[#211712]"
      )}
    >
      <PageContainer>
        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5 shadow-[0_32px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.34em] text-accent-soft">
                Competition education toolkit
              </p>
              <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] md:text-6xl">
                Classroom Mode
              </h1>
              <p className="mt-4 max-w-3xl text-base font-semibold leading-8 opacity-76">
                Build a local-first lesson from Palace routes, verified guide
                content, Passport quizzes, preservation notes, and the Travel
                Diary. No login, database, or external AI key is required.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={getRouteStartHref(routeChoice)}
                  className="rounded-full bg-[#e8bd73] px-5 py-3 text-sm font-black text-black"
                >
                  Start assigned route
                </Link>
                <Link
                  href="/companion"
                  className="rounded-full border border-white/14 bg-white/10 px-5 py-3 text-sm font-black"
                >
                  Open Companion
                </Link>
                <button
                  type="button"
                  onClick={printTaskSheet}
                  className="rounded-full border border-white/14 bg-white/10 px-5 py-3 text-sm font-black"
                >
                  Print worksheet
                </button>
                <button
                  type="button"
                  onClick={saveAssignment}
                  className="rounded-full border border-[#e8bd73]/35 bg-[#e8bd73]/14 px-5 py-3 text-sm font-black text-[#e8bd73]"
                >
                  Save assignment
                </button>
                <button
                  type="button"
                  onClick={saveReport}
                  className="rounded-full border border-[#ff777d]/35 bg-[#ff777d]/16 px-5 py-3 text-sm font-black text-[#ff858a]"
                >
                  Save report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Visited",
                  value: `${visitedPlaceSlugs.length}/${exploreExperience.places.length}`,
                },
                { label: "Correct", value: String(correctAnswers) },
                { label: "Badges", value: `${completedAchievementCount}` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.25rem] border border-white/10 bg-white/8 p-4"
                >
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] opacity-58">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] border border-white/10 bg-black/24 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-accent-soft">
              Assign route
            </p>
            <div className="mt-4 grid gap-3">
              {routeChoices.map((route) => (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setRouteChoice(route.id)}
                  className={cn(
                    "rounded-[1.15rem] border p-4 text-left",
                    routeChoice === route.id
                      ? "border-[#e8bd73] bg-[#e8bd73] text-black"
                      : "border-white/10 bg-white/7"
                  )}
                >
                  <p className="text-sm font-black">{route.title}</p>
                  <p className="mt-2 text-xs font-semibold leading-5 opacity-70">
                    {route.description}
                  </p>
                </button>
              ))}
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.28em] text-accent-soft">
              Difficulty
            </p>
            <div className="mt-4 grid gap-2">
              {(Object.keys(difficultyCopy) as ClassroomDifficulty[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    "rounded-full border px-4 py-3 text-left text-sm font-black",
                    difficulty === level
                      ? "border-[#ff777d] bg-[#ff777d] text-black"
                      : "border-white/10 bg-white/7"
                  )}
                >
                  {difficultyCopy[level].label}
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-accent-soft">
                  Local records
                </p>
                <button
                  type="button"
                  onClick={resetClassroomData}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[10px] font-black"
                >
                  Clear
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.15rem] border border-white/10 bg-white/7 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] opacity-58">
                    Assignments
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {classroomAssignments.length}
                  </p>
                  {classroomAssignments[0] ? (
                    <p className="mt-2 text-xs font-semibold leading-5 opacity-72">
                      Latest: {classroomAssignments[0].title}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-[1.15rem] border border-white/10 bg-white/7 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] opacity-58">
                    Reports
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {classroomReports.length}
                  </p>
                  {classroomReports[0] ? (
                    <p className="mt-2 text-xs font-semibold leading-5 opacity-72">
                      Latest: {classroomReports[0].title}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>

          <main className="grid gap-6">
            <section className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-accent-soft">
                    Student task sheet
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    {getRouteTitle(routeChoice, language)}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 opacity-72">
                    {getRouteIntro(routeChoice, language)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyTaskSheet}
                    className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-black"
                  >
                    {copyStatus === "copied" ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedAt(Date.now());
                      setCopyStatus("idle");
                    }}
                    className="rounded-full border border-[#e8bd73]/35 bg-[#e8bd73]/12 px-4 py-2 text-sm font-black text-[#e8bd73]"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
              {copyStatus === "error" ? (
                <p className="mt-4 text-sm font-semibold text-[#ff858a]">
                  Copy failed. Use Print worksheet instead.
                </p>
              ) : null}
              <pre className="journey-scrollbar mt-5 max-h-[34rem] overflow-auto whitespace-pre-wrap rounded-[1.25rem] border border-white/10 bg-black/32 p-5 text-sm font-semibold leading-7 text-white/82">
                {taskSheet}
              </pre>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-accent-soft">
                    Assignment tracking
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Local class report
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 opacity-72">
                    Summarizes the current browser session for a teacher demo:
                    visited places, quiz results, route seals, achievement
                    missions, and diary submission guidance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyReport}
                    className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-black"
                  >
                    {reportCopyStatus === "copied" ? "Copied" : "Copy report"}
                  </button>
                  <button
                    type="button"
                    onClick={printReport}
                    className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-black"
                  >
                    Print report
                  </button>
                  <button
                    type="button"
                    onClick={saveReport}
                    className="rounded-full border border-[#ff777d]/35 bg-[#ff777d]/16 px-4 py-2 text-sm font-black text-[#ff858a]"
                  >
                    Save report
                  </button>
                </div>
              </div>
              {reportCopyStatus === "error" ? (
                <p className="mt-4 text-sm font-semibold text-[#ff858a]">
                  Copy failed. Use Print report instead.
                </p>
              ) : null}
              <pre className="journey-scrollbar mt-5 max-h-[22rem] overflow-auto whitespace-pre-wrap rounded-[1.25rem] border border-white/10 bg-black/32 p-5 text-sm font-semibold leading-7 text-white/82">
                {reportText}
              </pre>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-accent-soft">
                Achievement missions
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {achievementCards.slice(0, 9).map((mission) => (
                  <article
                    key={mission.id}
                    className={cn(
                      "rounded-[1.15rem] border p-4",
                      mission.completed
                        ? "border-[#e8bd73]/40 bg-[#e8bd73]/14"
                        : "border-white/10 bg-black/18 opacity-72"
                    )}
                  >
                    <p className="text-sm font-black">{mission.title}</p>
                    <p className="mt-2 text-xs font-semibold leading-5 opacity-72">
                      {mission.description}
                    </p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] opacity-58">
                      {mission.completed ? "Completed" : "Pending"}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {selectedPlaces.slice(0, 6).map((place) => {
                const knowledge = getPalaceKnowledgeByPlaceSlug(place.slug);
                const quiz = getQuizQuestionForPlace(place.slug);

                return (
                  <article
                    key={place.slug}
                    className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-sm font-black">
                      {pickLocalizedText(place.title, language)}
                    </p>
                    <p className="mt-2 text-xs font-semibold leading-6 opacity-70">
                      {pickLocalizedText(place.shortDescription, language)}
                    </p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-accent-soft">
                      Quiz
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 opacity-72">
                      {pickLocalizedText(quiz?.question, language)}
                    </p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-accent-soft">
                      Preservation
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 opacity-72">
                      {pickLocalizedText(knowledge?.preservationNote, language)}
                    </p>
                  </article>
                );
              })}
            </section>
          </main>
        </div>
      </PageContainer>
    </section>
  );
}
