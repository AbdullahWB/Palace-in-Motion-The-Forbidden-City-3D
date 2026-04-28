import {
  exploreExperience,
  getCompletedJourneyRouteIds,
  getExploreJourneyById,
  getExplorePlaceBySlug,
  getUnlockedPassportSealIds,
} from "@/data/panorama";
import { pickLocalizedText } from "@/lib/i18n";
import type {
  CustomTourState,
  PassportMissionState,
} from "@/types/ai-guide";
import type {
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
} from "@/types/content";
import type { AppLanguage } from "@/types/preferences";

type BuildTravelDiaryInput = {
  language: AppLanguage;
  visitedPlaceSlugs: ExplorePlaceSlug[];
  passportMissions: PassportMissionState[];
  customTours: CustomTourState[];
  activeCustomTourId: string | null;
  activeExploreRouteId: ExploreJourneyRouteId | null;
  generatedAt?: number;
};

function getNextStop({
  activeCustomTour,
  activeRouteId,
  visitedPlaceSlugs,
}: {
  activeCustomTour: CustomTourState | null;
  activeRouteId: ExploreJourneyRouteId | null;
  visitedPlaceSlugs: ExplorePlaceSlug[];
}) {
  if (activeCustomTour) {
    return (
      activeCustomTour.orderedPlaceSlugs[activeCustomTour.currentStopIndex] ??
      activeCustomTour.orderedPlaceSlugs[0] ??
      null
    );
  }

  const route = getExploreJourneyById(activeRouteId);

  return (
    route?.placeOrder.find((placeSlug) => !visitedPlaceSlugs.includes(placeSlug)) ??
    route?.placeOrder[0] ??
    exploreExperience.places.find(
      (place) => !visitedPlaceSlugs.includes(place.slug)
    )?.slug ??
    null
  );
}

function formatPlaceList(
  placeSlugs: ExplorePlaceSlug[],
  language: AppLanguage
) {
  if (!placeSlugs.length) {
    return language === "zh" ? "尚未到访地点" : "No places visited yet";
  }

  return placeSlugs
    .map((placeSlug) => pickLocalizedText(getExplorePlaceBySlug(placeSlug)?.title, language))
    .join(" -> ");
}

export function buildTravelDiaryText({
  language,
  visitedPlaceSlugs,
  passportMissions,
  customTours,
  activeCustomTourId,
  activeExploreRouteId,
  generatedAt = 0,
}: BuildTravelDiaryInput) {
  const completedRouteIds = getCompletedJourneyRouteIds(visitedPlaceSlugs);
  const unlockedSealIds = getUnlockedPassportSealIds(completedRouteIds);
  const stampCount = passportMissions.filter((mission) => mission.stampUnlocked)
    .length;
  const activeCustomTour =
    customTours.find((tour) => tour.id === activeCustomTourId) ?? null;
  const nextStopSlug = getNextStop({
    activeCustomTour,
    activeRouteId: activeExploreRouteId,
    visitedPlaceSlugs,
  });
  const nextStopTitle = pickLocalizedText(
    getExplorePlaceBySlug(nextStopSlug)?.title,
    language
  );
  const routeTitles = completedRouteIds
    .map((routeId) => pickLocalizedText(getExploreJourneyById(routeId)?.title, language))
    .filter(Boolean);
  const sealTitles = unlockedSealIds
    .map(
      (sealId) =>
        exploreExperience.passport.routeSeals.find((seal) => seal.id === sealId)
          ?.title
    )
    .map((title) => pickLocalizedText(title, language))
    .filter(Boolean);
  const date = generatedAt
    ? new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(generatedAt))
    : language === "zh"
      ? "当前浏览会话"
      : "Current browsing session";

  if (language === "zh") {
    return [
      "Palace in Motion 旅行日记",
      `生成时间：${date}`,
      "",
      `今日进度：已到访 ${visitedPlaceSlugs.length}/${exploreExperience.places.length} 个故宫地点，已获得 ${stampCount} 个问答印章。`,
      `到访路线：${formatPlaceList(visitedPlaceSlugs, language)}。`,
      routeTitles.length
        ? `已完成路线：${routeTitles.join("、")}。`
        : "已完成路线：尚未完成完整路线。",
      sealTitles.length
        ? `已解锁徽章：${sealTitles.join("、")}。`
        : "已解锁徽章：继续完成路线后可获得路线徽章。",
      activeCustomTour
        ? `当前智能路线：${activeCustomTour.title}。${activeCustomTour.explanation}`
        : "当前智能路线：尚未启用自定义路线。",
      nextStopTitle ? `下一站建议：${nextStopTitle}。` : "下一站建议：打开宫城地图继续探索。",
      "",
      "学习回顾：这次探索把宫殿空间、路线顺序、场景观察和遗产保护联系在一起。请继续使用护照任务和问答印章，把参观从浏览变成可记忆的学习旅程。",
    ].join("\n");
  }

  return [
    "Palace in Motion Travel Diary",
    `Generated: ${date}`,
    "",
    `Progress: You visited ${visitedPlaceSlugs.length}/${exploreExperience.places.length} palace places and earned ${stampCount} quiz stamps.`,
    `Visited route: ${formatPlaceList(visitedPlaceSlugs, language)}.`,
    routeTitles.length
      ? `Completed routes: ${routeTitles.join(", ")}.`
      : "Completed routes: no full route completed yet.",
    sealTitles.length
      ? `Unlocked badges: ${sealTitles.join(", ")}.`
      : "Unlocked badges: complete a route to unlock route badges.",
    activeCustomTour
      ? `Active smart tour: ${activeCustomTour.title}. ${activeCustomTour.explanation}`
      : "Active smart tour: no custom route is active yet.",
    nextStopTitle
      ? `Next recommended stop: ${nextStopTitle}.`
      : "Next recommended stop: open the palace map and continue exploring.",
    "",
    "Learning reflection: this journey connects palace space, route sequence, scene observation, and heritage preservation. Continue using Passport missions and quiz stamps to turn exploration into a memorable learning record.",
  ].join("\n");
}
