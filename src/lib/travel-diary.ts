import {
  exploreExperience,
  getCompletedJourneyRouteIds,
  getExploreJourneyById,
  getExplorePhotoById,
  getExplorePlaceBySlug,
  getUnlockedPassportSealIds,
} from "@/data/panorama";
import { getPalaceKnowledgeByPlaceSlug } from "@/data/palace-knowledge";
import { pickLocalizedText } from "@/lib/i18n";
import type {
  CustomTourState,
  PassportMissionState,
} from "@/types/ai-guide";
import type { AchievementMissionState } from "@/types/competition";
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
  achievementMissions?: AchievementMissionState[];
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

function formatTextList(items: string[], language: AppLanguage) {
  if (!items.length) {
    return language === "zh" ? "尚未记录" : "Not recorded yet";
  }

  return items.join(language === "zh" ? "、" : ", ");
}

function getMissionStampTitles(
  passportMissions: PassportMissionState[],
  language: AppLanguage
) {
  return passportMissions
    .filter((mission) => mission.stampUnlocked)
    .map((mission) =>
      pickLocalizedText(
        getPalaceKnowledgeByPlaceSlug(mission.placeSlug)?.quiz[0]?.stampLabel,
        language
      )
    )
    .filter(Boolean);
}

function getLearningTags(
  visitedPlaceSlugs: ExplorePlaceSlug[],
  language: AppLanguage
) {
  const tags = visitedPlaceSlugs.flatMap((placeSlug) =>
    getPalaceKnowledgeByPlaceSlug(placeSlug)?.learningTags.map((tag) =>
      pickLocalizedText(tag, language)
    ) ?? []
  );

  return Array.from(new Set(tags)).slice(0, 7);
}

function getFavoriteStop(placeSlugs: ExplorePlaceSlug[]) {
  return placeSlugs[placeSlugs.length - 1] ?? null;
}

export function buildTravelDiaryText({
  language,
  visitedPlaceSlugs,
  passportMissions,
  customTours,
  activeCustomTourId,
  activeExploreRouteId,
  achievementMissions = [],
  generatedAt = 0,
}: BuildTravelDiaryInput) {
  const completedRouteIds = getCompletedJourneyRouteIds(visitedPlaceSlugs);
  const unlockedSealIds = getUnlockedPassportSealIds(completedRouteIds);
  const stampCount = passportMissions.filter((mission) => mission.stampUnlocked)
    .length;
  const quizAnsweredCount = passportMissions.filter(
    (mission) => mission.quizAnswered
  ).length;
  const quizCorrectCount = passportMissions.reduce(
    (total, mission) => total + mission.correctCount,
    0
  );
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
  const missionStampTitles = getMissionStampTitles(passportMissions, language);
  const achievementTitles = achievementMissions
    .filter((mission) => mission.completed)
    .map((mission) => mission.title)
    .filter(Boolean)
    .slice(0, 8);
  const learningTags = getLearningTags(visitedPlaceSlugs, language);
  const favoriteStopSlug = getFavoriteStop(visitedPlaceSlugs) ?? nextStopSlug;
  const favoriteStop = getExplorePlaceBySlug(favoriteStopSlug);
  const favoriteKnowledge = getPalaceKnowledgeByPlaceSlug(favoriteStopSlug);
  const favoritePhoto = getExplorePhotoById(
    favoriteStop,
    favoriteStop?.defaultPhotoId
  );
  const favoriteStopTitle = pickLocalizedText(favoriteStop?.title, language);
  const favoriteStopDescription = pickLocalizedText(
    favoriteKnowledge?.shortDescription ?? favoriteStop?.shortDescription,
    language
  );
  const favoriteFrameCaption = pickLocalizedText(favoritePhoto?.caption, language);
  const preservationReflection = pickLocalizedText(
    favoriteKnowledge?.preservationNote,
    language
  );
  const sourceTitle = pickLocalizedText(favoriteKnowledge?.sourceTitle, language);
  const sourceNote = pickLocalizedText(favoriteKnowledge?.sourceNote, language);
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
      `问答记录：已回答 ${quizAnsweredCount} 个任务，累计答对 ${quizCorrectCount} 次。`,
      `到访路线：${formatPlaceList(visitedPlaceSlugs, language)}。`,
      routeTitles.length
        ? `已完成路线：${routeTitles.join("、")}。`
        : "已完成路线：尚未完成完整路线。",
      sealTitles.length
        ? `已解锁徽章：${sealTitles.join("、")}。`
        : "已解锁徽章：继续完成路线后可获得路线徽章。",
      missionStampTitles.length
        ? `护照印章：${missionStampTitles.join("、")}。`
        : "护照印章：完成地点问答后会记录在这里。",
      achievementTitles.length
        ? `挑战徽章：${achievementTitles.join("、")}。`
        : "挑战徽章：完成路线、问答、保护学习、三维挑战或课堂任务后会显示在这里。",
      activeCustomTour
        ? `当前智能路线：${activeCustomTour.title}。${activeCustomTour.explanation}`
        : "当前智能路线：尚未启用自定义路线。",
      "",
      favoriteStopTitle
        ? `最有记忆点的一站：${favoriteStopTitle} — ${favoriteStopDescription}`
        : "最有记忆点的一站：开始路线后会自动记录。",
      favoriteFrameCaption
        ? `代表性场景：${favoriteFrameCaption}。`
        : "代表性场景：进入地点并切换场景帧后可补充。",
      learningTags.length
        ? `学习标签：${formatTextList(learningTags, language)}。`
        : "学习标签：继续探索后将从本地导览资料生成。",
      preservationReflection
        ? `遗产保护回顾：${preservationReflection}`
        : "遗产保护回顾：当前地点还没有足够的本地保护说明。",
      nextStopTitle ? `下一站建议：${nextStopTitle}。` : "下一站建议：打开宫城地图继续探索。",
      "",
      sourceTitle
        ? `资料来源：${sourceTitle}。${sourceNote}`
        : "资料来源：基于 Palace in Motion 本地导览内容。",
      "",
      "学习回顾：这次探索把宫殿空间、路线顺序、场景观察、问答任务和遗产保护联系在一起。请继续使用护照任务、场景帧和旅行日记，把参观从浏览变成可记忆、可提交、可复习的学习旅程。",
    ].join("\n");
  }

  return [
    "Palace in Motion Travel Diary",
    `Generated: ${date}`,
    "",
    `Progress: You visited ${visitedPlaceSlugs.length}/${exploreExperience.places.length} palace places and earned ${stampCount} quiz stamps.`,
    `Quiz record: ${quizAnsweredCount} missions answered, ${quizCorrectCount} correct answer${quizCorrectCount === 1 ? "" : "s"} recorded.`,
    `Visited route: ${formatPlaceList(visitedPlaceSlugs, language)}.`,
    routeTitles.length
      ? `Completed routes: ${routeTitles.join(", ")}.`
      : "Completed routes: no full route completed yet.",
    sealTitles.length
      ? `Unlocked badges: ${sealTitles.join(", ")}.`
      : "Unlocked badges: complete a route to unlock route badges.",
    missionStampTitles.length
      ? `Passport stamps: ${missionStampTitles.join(", ")}.`
      : "Passport stamps: answer place quizzes to record stamp names here.",
    achievementTitles.length
      ? `Challenge badges: ${achievementTitles.join(", ")}.`
      : "Challenge badges: complete routes, quizzes, preservation reading, 3D challenges, or classroom tasks to show them here.",
    activeCustomTour
      ? `Active smart tour: ${activeCustomTour.title}. ${activeCustomTour.explanation}`
      : "Active smart tour: no custom route is active yet.",
    "",
    favoriteStopTitle
      ? `Favorite stop: ${favoriteStopTitle} - ${favoriteStopDescription}`
      : "Favorite stop: start a route to record a memorable stop.",
    favoriteFrameCaption
      ? `Scene-frame highlight: ${favoriteFrameCaption}.`
      : "Scene-frame highlight: visit a place and switch frames to build this record.",
    learningTags.length
      ? `Learning tags: ${formatTextList(learningTags, language)}.`
      : "Learning tags: continue exploring to generate tags from the local guide.",
    preservationReflection
      ? `Preservation reflection: ${preservationReflection}`
      : "Preservation reflection: this stop does not have enough local preservation content yet.",
    nextStopTitle
      ? `Next recommended stop: ${nextStopTitle}.`
      : "Next recommended stop: open the palace map and continue exploring.",
    "",
    sourceTitle
      ? `Source grounding: ${sourceTitle}. ${sourceNote}`
      : "Source grounding: based on Palace in Motion local guide content.",
    "",
    "Learning reflection: this journey connects palace space, route sequence, scene observation, quiz missions, and heritage preservation. Continue using Passport missions, scene frames, and the diary to turn exploration into a memorable, printable learning record.",
  ].join("\n");
}
