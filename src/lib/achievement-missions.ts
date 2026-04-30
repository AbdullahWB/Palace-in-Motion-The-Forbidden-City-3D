import {
  exploreExperience,
  getCompletedJourneyRouteIds,
  getExploreJourneyById,
  getUnlockedPassportSealIds,
} from "@/data/panorama";
import { pickLocalizedText } from "@/lib/i18n";
import type { PassportMissionState } from "@/types/ai-guide";
import type {
  AchievementMissionState,
  AchievementMissionType,
  ClassroomAssignmentState,
  ClassroomReportState,
} from "@/types/competition";
import type { ExplorePlaceSlug } from "@/types/content";
import type { AppLanguage } from "@/types/preferences";

export type AchievementMissionCard = {
  id: string;
  type: AchievementMissionType;
  title: string;
  description: string;
  completed: boolean;
  completedAt: number | null;
  relatedPlaceSlug: ExplorePlaceSlug | null;
  routeId: string | null;
};

type AchievementDefinition = {
  id: string;
  type: AchievementMissionType;
  title: Record<AppLanguage, string>;
  description: Record<AppLanguage, string>;
};

const coreAchievementDefinitions: AchievementDefinition[] = [
  {
    id: "quiz-first-stamp",
    type: "quiz",
    title: {
      zh: "问答印记入门",
      en: "Quiz Stamp Starter",
    },
    description: {
      zh: "答对一个基于本地导览内容的护照问答。",
      en: "Answer one grounded Passport quiz correctly.",
    },
  },
  {
    id: "quiz-palace-scholar",
    type: "quiz",
    title: {
      zh: "宫廷学者",
      en: "Palace Scholar",
    },
    description: {
      zh: "累计答对五个本地导览问答。",
      en: "Record five correct grounded quiz answers.",
    },
  },
  {
    id: "preservation-reader",
    type: "preservation",
    title: {
      zh: "遗产保护学习者",
      en: "Preservation Learner",
    },
    description: {
      zh: "阅读至少一个地点的保护说明。",
      en: "Read at least one preservation note.",
    },
  },
  {
    id: "diary-generated",
    type: "diary",
    title: {
      zh: "旅行日记保管人",
      en: "Travel Diary Keeper",
    },
    description: {
      zh: "生成、复制或打印一次学习旅行日记。",
      en: "Generate, copy, or print a learning travel diary.",
    },
  },
  {
    id: "three-d-navigator",
    type: "three-d",
    title: {
      zh: "三维宫城导航者",
      en: "3D Palace Navigator",
    },
    description: {
      zh: "在三维视图中完成一个热点挑战。",
      en: "Complete one hotspot challenge in the 3D view.",
    },
  },
  {
    id: "classroom-educator",
    type: "classroom",
    title: {
      zh: "课堂导览设计者",
      en: "Classroom Guide Builder",
    },
    description: {
      zh: "创建一个本地课堂路线任务。",
      en: "Create one local route assignment for learners.",
    },
  },
  {
    id: "classroom-report",
    type: "classroom",
    title: {
      zh: "学习报告已生成",
      en: "Learning Report Ready",
    },
    description: {
      zh: "生成一份可打印的课堂进度报告。",
      en: "Generate one printable classroom progress report.",
    },
  },
  {
    id: "full-palace-scholar",
    type: "route",
    title: {
      zh: "全宫探索者",
      en: "Full Palace Scholar",
    },
    description: {
      zh: "到访全部地点，完成完整宫城学习记录。",
      en: "Visit every place and complete a full palace learning record.",
    },
  },
];

function getPersistedMissionMap(missions: AchievementMissionState[]) {
  return new Map(missions.map((mission) => [mission.id, mission]));
}

function getQuizCorrectCount(passportMissions: PassportMissionState[]) {
  return passportMissions.reduce(
    (total, mission) => total + mission.correctCount,
    0
  );
}

export function createAchievementMissionInput(
  id: string,
  language: AppLanguage
): Omit<AchievementMissionState, "completed" | "completedAt"> | null {
  const route = exploreExperience.journeys.find(
    (journey) => `route-${journey.id}` === id
  );

  if (route) {
    return {
      id,
      type: "route",
      title: pickLocalizedText(route.title, language),
      description: pickLocalizedText(route.description, language),
      routeId: route.id,
      relatedPlaceSlug: null,
    };
  }

  const definition = coreAchievementDefinitions.find(
    (candidate) => candidate.id === id
  );

  if (!definition) {
    return null;
  }

  return {
    id: definition.id,
    type: definition.type,
    title: definition.title[language],
    description: definition.description[language],
    routeId: null,
    relatedPlaceSlug: null,
  };
}

export function buildAchievementMissionCards({
  language,
  visitedPlaceSlugs,
  passportMissions,
  achievementMissions,
  classroomAssignments = [],
  classroomReports = [],
}: {
  language: AppLanguage;
  visitedPlaceSlugs: ExplorePlaceSlug[];
  passportMissions: PassportMissionState[];
  achievementMissions: AchievementMissionState[];
  classroomAssignments?: ClassroomAssignmentState[];
  classroomReports?: ClassroomReportState[];
}): AchievementMissionCard[] {
  const persistedMissionMap = getPersistedMissionMap(achievementMissions);
  const completedRouteIds = getCompletedJourneyRouteIds(visitedPlaceSlugs);
  const unlockedSealIds = getUnlockedPassportSealIds(completedRouteIds);
  const correctQuizCount = getQuizCorrectCount(passportMissions);
  const stampedQuizCount = passportMissions.filter(
    (mission) => mission.stampUnlocked
  ).length;

  const routeCards = exploreExperience.journeys.map((journey) => {
    const persisted = persistedMissionMap.get(`route-${journey.id}`);
    const completed = completedRouteIds.includes(journey.id);
    const seal = exploreExperience.passport.routeSeals.find(
      (candidate) => candidate.routeId === journey.id
    );
    const title = pickLocalizedText(seal?.title ?? journey.title, language);
    const description = pickLocalizedText(
      seal?.description ?? journey.description,
      language
    );

    return {
      id: `route-${journey.id}`,
      type: "route" as const,
      title,
      description,
      completed: completed || persisted?.completed === true,
      completedAt: persisted?.completedAt ?? null,
      relatedPlaceSlug: null,
      routeId: journey.id,
    };
  });

  const definitionCards = coreAchievementDefinitions.map((definition) => {
    const persisted = persistedMissionMap.get(definition.id);
    const completed =
      persisted?.completed === true ||
      (definition.id === "quiz-first-stamp" && stampedQuizCount > 0) ||
      (definition.id === "quiz-palace-scholar" && correctQuizCount >= 5) ||
      (definition.id === "classroom-educator" && classroomAssignments.length > 0) ||
      (definition.id === "classroom-report" && classroomReports.length > 0) ||
      (definition.id === "full-palace-scholar" &&
        visitedPlaceSlugs.length >= exploreExperience.places.length &&
        unlockedSealIds.length >= exploreExperience.journeys.length);

    return {
      id: definition.id,
      type: definition.type,
      title: persisted?.title || definition.title[language],
      description: persisted?.description || definition.description[language],
      completed,
      completedAt: persisted?.completedAt ?? null,
      relatedPlaceSlug: persisted?.relatedPlaceSlug ?? null,
      routeId: persisted?.routeId ?? null,
    };
  });

  return [...routeCards, ...definitionCards];
}

export function countCompletedAchievementMissions(
  cards: AchievementMissionCard[]
) {
  return cards.filter((card) => card.completed).length;
}

export function getClassroomRouteTitle(
  routeId: ClassroomAssignmentState["routeId"],
  language: AppLanguage
) {
  if (routeId === "full-palace") {
    return language === "zh" ? "完整故宫学习路线" : "Full Palace Learning Route";
  }

  return pickLocalizedText(getExploreJourneyById(routeId)?.title, language);
}
