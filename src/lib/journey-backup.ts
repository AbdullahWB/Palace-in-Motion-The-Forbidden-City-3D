import {
  isExploreJourneyRouteId,
  isExplorePlaceSlug,
} from "@/data/panorama";
import type {
  CustomTourState,
  PassportMissionState,
} from "@/types/ai-guide";
import type {
  AchievementMissionState,
  AchievementMissionType,
} from "@/types/competition";
import type {
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
} from "@/types/content";
import type { AccessibilityPreferences } from "@/types/preferences";

export const JOURNEY_BACKUP_VERSION = 1;

export const JOURNEY_BACKUP_ERROR_MESSAGE =
  "Import failed. Choose a valid Palace journey backup JSON file.";

export class JourneyBackupError extends Error {
  constructor(message = JOURNEY_BACKUP_ERROR_MESSAGE) {
    super(message);
    this.name = "JourneyBackupError";
  }
}

export type JourneyBackupV1 = {
  version: typeof JOURNEY_BACKUP_VERSION;
  exportedAt: number;
  visitedExplorePlaceSlugs: ExplorePlaceSlug[];
  passportMissions: PassportMissionState[];
  customTours: CustomTourState[];
  activeCustomTourId: string | null;
  activeExploreRouteId: ExploreJourneyRouteId | null;
  achievementMissions: AchievementMissionState[];
  accessibilityPreferences: AccessibilityPreferences;
};

export type JourneyBackupInput = Omit<JourneyBackupV1, "version" | "exportedAt">;

const defaultAccessibilityPreferences: AccessibilityPreferences = {
  textScale: "standard",
  contrast: "standard",
  reduceMotion: false,
  simplified: false,
  readableLabels: false,
  keyboardFocus: false,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readBoolean(value: unknown) {
  return value === true;
}

function readFiniteNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function isAchievementMissionType(
  value: string | null
): value is AchievementMissionType {
  return (
    value === "route" ||
    value === "quiz" ||
    value === "preservation" ||
    value === "diary" ||
    value === "three-d"
  );
}

function readPlaceSlugs(value: unknown) {
  return readArray(value).filter((slug): slug is ExplorePlaceSlug =>
    isExplorePlaceSlug(readString(slug))
  );
}

function readPassportMissions(value: unknown): PassportMissionState[] {
  return readArray(value)
    .filter(isObject)
    .map((mission) => {
      const placeSlug = readString(mission.placeSlug);

      if (!isExplorePlaceSlug(placeSlug)) {
        return null;
      }

      return {
        placeSlug,
        quizAnswered: readBoolean(mission.quizAnswered),
        correctCount: Math.max(0, readFiniteNumber(mission.correctCount)),
        stampUnlocked: readBoolean(mission.stampUnlocked),
        updatedAt: readFiniteNumber(mission.updatedAt, Date.now()),
      };
    })
    .filter((mission): mission is PassportMissionState => Boolean(mission));
}

function readCustomTours(value: unknown): CustomTourState[] {
  return readArray(value)
    .filter(isObject)
    .map((tour) => {
      const id = readString(tour.id);
      const title = readString(tour.title);
      const orderedPlaceSlugs = readPlaceSlugs(tour.orderedPlaceSlugs);
      const timeBudget = tour.timeBudget;

      if (
        !id ||
        !title ||
        !orderedPlaceSlugs.length ||
        (timeBudget !== 5 && timeBudget !== 10 && timeBudget !== 20)
      ) {
        return null;
      }

      return {
        id,
        title,
        timeBudget,
        interests: readArray(tour.interests).filter(
          (interest): interest is CustomTourState["interests"][number] =>
            interest === "architecture" ||
            interest === "history" ||
            interest === "gardens" ||
            interest === "photography" ||
            interest === "overview"
        ),
        orderedPlaceSlugs,
        explanation: readString(tour.explanation) ?? "",
        currentStopIndex: Math.max(0, readFiniteNumber(tour.currentStopIndex)),
        createdAt: readFiniteNumber(tour.createdAt, Date.now()),
      };
    })
    .filter((tour): tour is CustomTourState => Boolean(tour));
}

function readAchievementMissions(value: unknown): AchievementMissionState[] {
  return readArray(value)
    .filter(isObject)
    .flatMap((mission) => {
      const id = readString(mission.id);
      const type = readString(mission.type);
      const title = readString(mission.title);
      const description = readString(mission.description);

      if (!id || !isAchievementMissionType(type) || !title || !description) {
        return [];
      }
      const relatedPlaceSlug = readString(mission.relatedPlaceSlug);
      const routeId = readString(mission.routeId);

      return [{
        id,
        type,
        title,
        description,
        completed: readBoolean(mission.completed),
        completedAt:
          mission.completedAt === null
            ? null
            : readFiniteNumber(mission.completedAt, Date.now()),
        relatedPlaceSlug: isExplorePlaceSlug(relatedPlaceSlug)
          ? relatedPlaceSlug
          : null,
        routeId: isExploreJourneyRouteId(routeId)
          ? routeId
          : null,
      }];
    });
}

function readAccessibilityPreferences(value: unknown): AccessibilityPreferences {
  if (!isObject(value)) {
    throw new JourneyBackupError("Backup is missing accessibility preferences.");
  }

  return {
    textScale:
      value.textScale === "large" || value.textScale === "extra-large"
        ? value.textScale
        : "standard",
    contrast: value.contrast === "high" ? "high" : "standard",
    reduceMotion: readBoolean(value.reduceMotion),
    simplified: readBoolean(value.simplified),
    readableLabels: readBoolean(value.readableLabels),
    keyboardFocus: readBoolean(value.keyboardFocus),
  };
}

export function createJourneyBackup(input: JourneyBackupInput): JourneyBackupV1 {
  return {
    version: JOURNEY_BACKUP_VERSION,
    exportedAt: Date.now(),
    visitedExplorePlaceSlugs: input.visitedExplorePlaceSlugs,
    passportMissions: input.passportMissions,
    customTours: input.customTours,
    activeCustomTourId: input.activeCustomTourId,
    activeExploreRouteId: input.activeExploreRouteId,
    achievementMissions: input.achievementMissions,
    accessibilityPreferences: {
      ...defaultAccessibilityPreferences,
      ...input.accessibilityPreferences,
    },
  };
}

export function parseJourneyBackup(value: unknown): JourneyBackupV1 {
  if (!isObject(value)) {
    throw new JourneyBackupError("Journey backup must be a JSON object.");
  }

  if (value.version !== JOURNEY_BACKUP_VERSION) {
    throw new JourneyBackupError("Unsupported journey backup version.");
  }

  const customTours = readCustomTours(value.customTours);
  const activeCustomTourId = readString(value.activeCustomTourId);
  const activeExploreRouteId = readString(value.activeExploreRouteId);

  return {
    version: JOURNEY_BACKUP_VERSION,
    exportedAt: readFiniteNumber(value.exportedAt, Date.now()),
    visitedExplorePlaceSlugs: readPlaceSlugs(value.visitedExplorePlaceSlugs),
    passportMissions: readPassportMissions(value.passportMissions),
    customTours,
    activeCustomTourId: customTours.some((tour) => tour.id === activeCustomTourId)
      ? activeCustomTourId
      : null,
    activeExploreRouteId: isExploreJourneyRouteId(activeExploreRouteId)
      ? activeExploreRouteId
      : null,
    achievementMissions: readAchievementMissions(value.achievementMissions),
    accessibilityPreferences: readAccessibilityPreferences(
      value.accessibilityPreferences
    ),
  };
}
