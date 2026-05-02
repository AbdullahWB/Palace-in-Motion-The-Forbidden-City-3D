import type {
  CustomTourState,
  PassportMissionState,
} from "@/types/ai-guide";
import type {
  AchievementMissionState,
  ClassroomAssignmentState,
  ClassroomReportState,
} from "@/types/competition";
import type { ExplorePlaceSlug } from "@/types/content";
import type { AccessibilityPreferences } from "@/types/preferences";

export type JourneyBackupV1 = {
  version: 1;
  exportedAt: number;
  visitedExplorePlaceSlugs: ExplorePlaceSlug[];
  passportMissions: PassportMissionState[];
  customTours: CustomTourState[];
  activeCustomTourId: string | null;
  activeExploreRouteId: string | null;
  achievementMissions: AchievementMissionState[];
  classroomAssignments: ClassroomAssignmentState[];
  classroomReports: ClassroomReportState[];
  accessibilityPreferences: AccessibilityPreferences;
};

export type JourneyBackupInput = Omit<JourneyBackupV1, "version" | "exportedAt">;

export function createJourneyBackup(input: JourneyBackupInput): JourneyBackupV1 {
  return {
    version: 1,
    exportedAt: Date.now(),
    ...input,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function parseJourneyBackup(value: unknown): JourneyBackupV1 {
  if (!isObject(value)) {
    throw new Error("Journey backup must be a JSON object.");
  }

  if (value.version !== 1) {
    throw new Error("Unsupported journey backup version.");
  }

  if (!isObject(value.accessibilityPreferences)) {
    throw new Error("Journey backup is missing accessibility preferences.");
  }

  return {
    version: 1,
    exportedAt:
      typeof value.exportedAt === "number" && Number.isFinite(value.exportedAt)
        ? value.exportedAt
        : Date.now(),
    visitedExplorePlaceSlugs: readArray<ExplorePlaceSlug>(
      value.visitedExplorePlaceSlugs
    ).filter((slug): slug is ExplorePlaceSlug => typeof slug === "string"),
    passportMissions: readArray<PassportMissionState>(value.passportMissions),
    customTours: readArray<CustomTourState>(value.customTours),
    activeCustomTourId:
      typeof value.activeCustomTourId === "string" ? value.activeCustomTourId : null,
    activeExploreRouteId:
      typeof value.activeExploreRouteId === "string"
        ? value.activeExploreRouteId
        : null,
    achievementMissions: readArray<AchievementMissionState>(
      value.achievementMissions
    ),
    classroomAssignments: readArray<ClassroomAssignmentState>(
      value.classroomAssignments
    ),
    classroomReports: readArray<ClassroomReportState>(value.classroomReports),
    accessibilityPreferences:
      value.accessibilityPreferences as AccessibilityPreferences,
  };
}
