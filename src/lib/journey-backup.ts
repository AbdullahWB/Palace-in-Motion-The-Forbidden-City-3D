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
  ClassroomAssignmentState,
  ClassroomDifficulty,
  ClassroomReportState,
  ClassroomRouteChoice,
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
  classroomAssignments: ClassroomAssignmentState[];
  classroomReports: ClassroomReportState[];
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

function readRouteChoice(value: unknown): ClassroomRouteChoice | null {
  if (value === "full-palace") {
    return value;
  }

  const routeId = readString(value);

  if (isExploreJourneyRouteId(routeId)) {
    return routeId;
  }

  return null;
}

function readDifficulty(value: unknown): ClassroomDifficulty {
  return value === "starter" || value === "standard" || value === "challenge"
    ? value
    : "standard";
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

      if (!id || !type || !title || !description) {
        return [];
      }
      const relatedPlaceSlug = readString(mission.relatedPlaceSlug);
      const routeId = readString(mission.routeId);

      return [{
        id,
        type: type as AchievementMissionType,
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

function readClassroomAssignments(value: unknown): ClassroomAssignmentState[] {
  return readArray(value)
    .filter(isObject)
    .map((assignment) => {
      const id = readString(assignment.id);
      const title = readString(assignment.title);
      const routeId = readRouteChoice(assignment.routeId);

      if (!id || !title || !routeId) {
        return null;
      }

      return {
        id,
        title,
        routeId,
        difficulty: readDifficulty(assignment.difficulty),
        requiredPlaceSlugs: readPlaceSlugs(assignment.requiredPlaceSlugs),
        worksheetText: readString(assignment.worksheetText) ?? "",
        createdAt: readFiniteNumber(assignment.createdAt, Date.now()),
      };
    })
    .filter(
      (assignment): assignment is ClassroomAssignmentState => Boolean(assignment)
    );
}

function readClassroomReports(value: unknown): ClassroomReportState[] {
  return readArray(value)
    .filter(isObject)
    .map((report) => {
      const id = readString(report.id);
      const assignmentId = readString(report.assignmentId);
      const title = readString(report.title);

      if (!id || !assignmentId || !title) {
        return null;
      }

      return {
        id,
        assignmentId,
        title,
        visitedCount: Math.max(0, readFiniteNumber(report.visitedCount)),
        correctQuizCount: Math.max(0, readFiniteNumber(report.correctQuizCount)),
        routeSealCount: Math.max(0, readFiniteNumber(report.routeSealCount)),
        completedMissionCount: Math.max(
          0,
          readFiniteNumber(report.completedMissionCount)
        ),
        reportText: readString(report.reportText) ?? "",
        createdAt: readFiniteNumber(report.createdAt, Date.now()),
      };
    })
    .filter((report): report is ClassroomReportState => Boolean(report));
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
    classroomAssignments: input.classroomAssignments,
    classroomReports: input.classroomReports,
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
    classroomAssignments: readClassroomAssignments(value.classroomAssignments),
    classroomReports: readClassroomReports(value.classroomReports),
    accessibilityPreferences: readAccessibilityPreferences(
      value.accessibilityPreferences
    ),
  };
}
