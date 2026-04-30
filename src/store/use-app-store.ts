import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultPostcardFrameId } from "@/data/selfie";
import type {
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
  ExploreZone,
  PostcardFrame,
} from "@/types/content";
import type {
  CustomTourState,
  PassportMissionState,
} from "@/types/ai-guide";
import type {
  AchievementMissionState,
  ClassroomAssignmentState,
  ClassroomReportState,
} from "@/types/competition";
import type { AccessibilityPreferences } from "@/types/preferences";

type PersistedAppStoreState = Pick<
  AppStoreState,
  | "selectedExploreZoneId"
  | "visitedExploreZoneIds"
  | "visitedExplorePlaceSlugs"
  | "selectedPostcardFrame"
  | "hasCompletedTour"
  | "hasGeneratedPostcard"
  | "activeExploreRouteId"
  | "passportMissions"
  | "customTours"
  | "activeCustomTourId"
  | "accessibilityPreferences"
  | "achievementMissions"
  | "classroomAssignments"
  | "classroomReports"
>;

export type AppStoreState = {
  isNavOpen: boolean;
  selectedExploreZoneId: ExploreZone["id"] | null;
  visitedExploreZoneIds: ExploreZone["id"][];
  visitedExplorePlaceSlugs: ExplorePlaceSlug[];
  selectedPostcardFrame: PostcardFrame["id"];
  hasCompletedTour: boolean;
  hasGeneratedPostcard: boolean;
  activeExploreRouteId: ExploreJourneyRouteId | null;
  passportMissions: PassportMissionState[];
  customTours: CustomTourState[];
  activeCustomTourId: string | null;
  accessibilityPreferences: AccessibilityPreferences;
  achievementMissions: AchievementMissionState[];
  classroomAssignments: ClassroomAssignmentState[];
  classroomReports: ClassroomReportState[];
  setNavOpen: (isOpen: boolean) => void;
  setSelectedExploreZoneId: (zoneId: ExploreZone["id"] | null) => void;
  markExploreZoneVisited: (zoneId: ExploreZone["id"]) => void;
  markExplorePlaceVisited: (placeSlug: ExplorePlaceSlug) => void;
  setActiveExploreRoute: (routeId: ExploreJourneyRouteId | null) => void;
  answerPassportMission: (placeSlug: ExplorePlaceSlug, isCorrect: boolean) => void;
  saveCustomTour: (tour: CustomTourState) => void;
  setActiveCustomTour: (tourId: string | null) => void;
  setCustomTourProgress: (tourId: string, currentStopIndex: number) => void;
  updateAccessibilityPreferences: (
    preferences: Partial<AccessibilityPreferences>
  ) => void;
  completeAchievementMission: (
    mission: Omit<AchievementMissionState, "completed" | "completedAt"> &
      Partial<Pick<AchievementMissionState, "completedAt">>
  ) => void;
  saveClassroomAssignment: (assignment: ClassroomAssignmentState) => void;
  saveClassroomReport: (report: ClassroomReportState) => void;
  resetClassroomData: () => void;
  resetExploreProgress: () => void;
  setSelectedPostcardFrame: (frameId: PostcardFrame["id"]) => void;
  setHasCompletedTour: (value: boolean) => void;
  setHasGeneratedPostcard: (value: boolean) => void;
};

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  textScale: "standard",
  contrast: "standard",
  reduceMotion: false,
  simplified: false,
  readableLabels: false,
  keyboardFocus: false,
};

const initialPersistedState: PersistedAppStoreState = {
  selectedExploreZoneId: null,
  visitedExploreZoneIds: [],
  visitedExplorePlaceSlugs: [],
  selectedPostcardFrame: defaultPostcardFrameId,
  hasCompletedTour: false,
  hasGeneratedPostcard: false,
  activeExploreRouteId: null,
  passportMissions: [],
  customTours: [],
  activeCustomTourId: null,
  accessibilityPreferences: defaultAccessibilityPreferences,
  achievementMissions: [],
  classroomAssignments: [],
  classroomReports: [],
};

function upsertCompletedAchievement(
  missions: AchievementMissionState[],
  mission: Omit<AchievementMissionState, "completed" | "completedAt"> &
    Partial<Pick<AchievementMissionState, "completedAt">>
) {
  const existingMission = missions.find((candidate) => candidate.id === mission.id);
  const completedAt =
    existingMission?.completedAt ?? mission.completedAt ?? Date.now();
  const nextMission: AchievementMissionState = {
    ...mission,
    completed: true,
    completedAt,
    relatedPlaceSlug: mission.relatedPlaceSlug ?? null,
    routeId: mission.routeId ?? null,
  };

  return [
    ...missions.filter((candidate) => candidate.id !== mission.id),
    nextMission,
  ];
}

function normalizeAchievementMissions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (mission): mission is AchievementMissionState =>
        Boolean(mission) &&
        typeof mission === "object" &&
        typeof (mission as AchievementMissionState).id === "string" &&
        typeof (mission as AchievementMissionState).type === "string" &&
        typeof (mission as AchievementMissionState).title === "string" &&
        typeof (mission as AchievementMissionState).description === "string"
    )
    .map((mission) => ({
      id: mission.id,
      type: mission.type,
      title: mission.title,
      description: mission.description,
      completed: mission.completed === true,
      completedAt: Number.isFinite(mission.completedAt)
        ? mission.completedAt
        : null,
      relatedPlaceSlug:
        typeof mission.relatedPlaceSlug === "string"
          ? mission.relatedPlaceSlug
          : null,
      routeId: typeof mission.routeId === "string" ? mission.routeId : null,
    }));
}

function normalizeClassroomAssignments(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (assignment): assignment is ClassroomAssignmentState =>
        Boolean(assignment) &&
        typeof assignment === "object" &&
        typeof (assignment as ClassroomAssignmentState).id === "string" &&
        typeof (assignment as ClassroomAssignmentState).title === "string" &&
        typeof (assignment as ClassroomAssignmentState).routeId === "string" &&
        Array.isArray((assignment as ClassroomAssignmentState).requiredPlaceSlugs)
    )
    .map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      routeId: assignment.routeId,
      difficulty: assignment.difficulty,
      requiredPlaceSlugs: assignment.requiredPlaceSlugs.filter(
        (placeSlug): placeSlug is ExplorePlaceSlug => typeof placeSlug === "string"
      ),
      worksheetText:
        typeof assignment.worksheetText === "string"
          ? assignment.worksheetText
          : "",
      createdAt: Number.isFinite(assignment.createdAt)
        ? assignment.createdAt
        : Date.now(),
    }));
}

function normalizeClassroomReports(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (report): report is ClassroomReportState =>
        Boolean(report) &&
        typeof report === "object" &&
        typeof (report as ClassroomReportState).id === "string" &&
        typeof (report as ClassroomReportState).assignmentId === "string" &&
        typeof (report as ClassroomReportState).title === "string"
    )
    .map((report) => ({
      id: report.id,
      assignmentId: report.assignmentId,
      title: report.title,
      visitedCount: Number.isFinite(report.visitedCount)
        ? report.visitedCount
        : 0,
      correctQuizCount: Number.isFinite(report.correctQuizCount)
        ? report.correctQuizCount
        : 0,
      routeSealCount: Number.isFinite(report.routeSealCount)
        ? report.routeSealCount
        : 0,
      completedMissionCount: Number.isFinite(report.completedMissionCount)
        ? report.completedMissionCount
        : 0,
      reportText: typeof report.reportText === "string" ? report.reportText : "",
      createdAt: Number.isFinite(report.createdAt) ? report.createdAt : Date.now(),
    }));
}

function migratePersistedAppState(value: unknown): PersistedAppStoreState {
  if (!value || typeof value !== "object") {
    return initialPersistedState;
  }

  const persisted = value as Record<string, unknown>;

  return {
    selectedExploreZoneId:
      typeof persisted.selectedExploreZoneId === "string"
        ? (persisted.selectedExploreZoneId as ExploreZone["id"])
        : null,
    visitedExploreZoneIds: Array.isArray(persisted.visitedExploreZoneIds)
      ? (persisted.visitedExploreZoneIds.filter(
          (zoneId): zoneId is ExploreZone["id"] => typeof zoneId === "string"
        ) as ExploreZone["id"][])
      : [],
    visitedExplorePlaceSlugs: Array.isArray(persisted.visitedExplorePlaceSlugs)
      ? (persisted.visitedExplorePlaceSlugs.filter(
          (placeSlug): placeSlug is ExplorePlaceSlug => typeof placeSlug === "string"
        ) as ExplorePlaceSlug[])
      : [],
    selectedPostcardFrame:
      typeof persisted.selectedPostcardFrame === "string"
        ? persisted.selectedPostcardFrame
        : defaultPostcardFrameId,
    hasCompletedTour: persisted.hasCompletedTour === true,
    hasGeneratedPostcard: persisted.hasGeneratedPostcard === true,
    activeExploreRouteId:
      typeof persisted.activeExploreRouteId === "string"
        ? (persisted.activeExploreRouteId as ExploreJourneyRouteId)
        : null,
    passportMissions: Array.isArray(persisted.passportMissions)
      ? persisted.passportMissions
          .filter(
            (mission): mission is PassportMissionState =>
              Boolean(mission) &&
              typeof mission === "object" &&
              typeof (mission as PassportMissionState).placeSlug === "string"
          )
          .map((mission) => ({
            placeSlug: mission.placeSlug,
            quizAnswered: mission.quizAnswered === true,
            correctCount: Number.isFinite(mission.correctCount)
              ? mission.correctCount
              : 0,
            stampUnlocked: mission.stampUnlocked === true,
            updatedAt: Number.isFinite(mission.updatedAt)
              ? mission.updatedAt
              : Date.now(),
          }))
      : [],
    customTours: Array.isArray(persisted.customTours)
      ? persisted.customTours.filter(
          (tour): tour is CustomTourState =>
            Boolean(tour) &&
            typeof tour === "object" &&
            typeof (tour as CustomTourState).id === "string" &&
            Array.isArray((tour as CustomTourState).orderedPlaceSlugs)
        )
      : [],
    activeCustomTourId:
      typeof persisted.activeCustomTourId === "string"
        ? persisted.activeCustomTourId
        : null,
    accessibilityPreferences:
      persisted.accessibilityPreferences &&
      typeof persisted.accessibilityPreferences === "object"
        ? {
            ...defaultAccessibilityPreferences,
            ...(persisted.accessibilityPreferences as Partial<AccessibilityPreferences>),
          }
        : defaultAccessibilityPreferences,
    achievementMissions: normalizeAchievementMissions(
      persisted.achievementMissions
    ),
    classroomAssignments: normalizeClassroomAssignments(
      persisted.classroomAssignments
    ),
    classroomReports: normalizeClassroomReports(persisted.classroomReports),
  };
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      isNavOpen: false,
      ...initialPersistedState,
      setNavOpen: (isOpen) => set({ isNavOpen: isOpen }),
      setSelectedExploreZoneId: (zoneId) => set({ selectedExploreZoneId: zoneId }),
      markExploreZoneVisited: (zoneId) =>
        set((state) => ({
          visitedExploreZoneIds: state.visitedExploreZoneIds.includes(zoneId)
            ? state.visitedExploreZoneIds
            : [...state.visitedExploreZoneIds, zoneId],
        })),
      markExplorePlaceVisited: (placeSlug) =>
        set((state) => ({
          visitedExplorePlaceSlugs: state.visitedExplorePlaceSlugs.includes(placeSlug)
            ? state.visitedExplorePlaceSlugs
            : [...state.visitedExplorePlaceSlugs, placeSlug],
        })),
      setActiveExploreRoute: (routeId) => set({ activeExploreRouteId: routeId }),
      answerPassportMission: (placeSlug, isCorrect) =>
        set((state) => {
          const existingMission = state.passportMissions.find(
            (mission) => mission.placeSlug === placeSlug
          );
          const nextMission: PassportMissionState = {
            placeSlug,
            quizAnswered: true,
            correctCount:
              (existingMission?.correctCount ?? 0) + (isCorrect ? 1 : 0),
            stampUnlocked: (existingMission?.stampUnlocked ?? false) || isCorrect,
            updatedAt: Date.now(),
          };
          const nextPassportMissions = [
            ...state.passportMissions.filter(
              (mission) => mission.placeSlug !== placeSlug
            ),
            nextMission,
          ];
          const correctAnswerCount = nextPassportMissions.reduce(
            (total, mission) => total + mission.correctCount,
            0
          );
          let nextAchievementMissions = state.achievementMissions;

          if (isCorrect) {
            nextAchievementMissions = upsertCompletedAchievement(
              nextAchievementMissions,
              {
                id: "quiz-first-stamp",
                type: "quiz",
                title: "Quiz Stamp Starter",
                description:
                  "Unlocked by answering a grounded Palace Passport quiz correctly.",
                relatedPlaceSlug: placeSlug,
              }
            );
          }

          if (correctAnswerCount >= 5) {
            nextAchievementMissions = upsertCompletedAchievement(
              nextAchievementMissions,
              {
                id: "quiz-palace-scholar",
                type: "quiz",
                title: "Palace Scholar",
                description:
                  "Unlocked by recording five correct grounded quiz answers.",
              }
            );
          }

          return {
            passportMissions: nextPassportMissions,
            achievementMissions: nextAchievementMissions,
          };
        }),
      saveCustomTour: (tour) =>
        set((state) => ({
          customTours: [
            tour,
            ...state.customTours.filter((existingTour) => existingTour.id !== tour.id),
          ].slice(0, 5),
          activeCustomTourId: tour.id,
          activeExploreRouteId: null,
        })),
      setActiveCustomTour: (tourId) =>
        set((state) => ({
          activeCustomTourId: tourId,
          activeExploreRouteId: tourId ? null : state.activeExploreRouteId,
        })),
      setCustomTourProgress: (tourId, currentStopIndex) =>
        set((state) => ({
          customTours: state.customTours.map((tour) =>
            tour.id === tourId
              ? {
                  ...tour,
                  currentStopIndex: Math.max(0, currentStopIndex),
                }
              : tour
          ),
        })),
      updateAccessibilityPreferences: (preferences) =>
        set((state) => ({
          accessibilityPreferences: {
            ...state.accessibilityPreferences,
            ...preferences,
          },
        })),
      completeAchievementMission: (mission) =>
        set((state) => ({
          achievementMissions: upsertCompletedAchievement(
            state.achievementMissions,
            mission
          ),
        })),
      saveClassroomAssignment: (assignment) =>
        set((state) => ({
          classroomAssignments: [
            assignment,
            ...state.classroomAssignments.filter(
              (existingAssignment) => existingAssignment.id !== assignment.id
            ),
          ].slice(0, 8),
          achievementMissions: upsertCompletedAchievement(
            state.achievementMissions,
            {
              id: "classroom-educator",
              type: "classroom",
              title: "Classroom Guide Builder",
              description:
                "Unlocked by creating a local route assignment for learners.",
            }
          ),
        })),
      saveClassroomReport: (report) =>
        set((state) => ({
          classroomReports: [
            report,
            ...state.classroomReports.filter(
              (existingReport) => existingReport.id !== report.id
            ),
          ].slice(0, 8),
          achievementMissions: upsertCompletedAchievement(
            state.achievementMissions,
            {
              id: "classroom-report",
              type: "classroom",
              title: "Learning Report Ready",
              description:
                "Unlocked by generating a printable classroom progress report.",
            }
          ),
        })),
      resetClassroomData: () =>
        set({
          classroomAssignments: [],
          classroomReports: [],
        }),
      resetExploreProgress: () =>
        set((state) => ({
          ...initialPersistedState,
          accessibilityPreferences: state.accessibilityPreferences,
          classroomAssignments: state.classroomAssignments,
          classroomReports: state.classroomReports,
        })),
      setSelectedPostcardFrame: (frameId) => set({ selectedPostcardFrame: frameId }),
      setHasCompletedTour: (value) => set({ hasCompletedTour: value }),
      setHasGeneratedPostcard: (value) => set({ hasGeneratedPostcard: value }),
    }),
    {
      name: "palace-in-motion-app",
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: migratePersistedAppState,
      partialize: (state) => ({
        selectedExploreZoneId: state.selectedExploreZoneId,
        visitedExploreZoneIds: state.visitedExploreZoneIds,
        visitedExplorePlaceSlugs: state.visitedExplorePlaceSlugs,
        selectedPostcardFrame: state.selectedPostcardFrame,
        hasCompletedTour: state.hasCompletedTour,
        hasGeneratedPostcard: state.hasGeneratedPostcard,
        activeExploreRouteId: state.activeExploreRouteId,
        passportMissions: state.passportMissions,
        customTours: state.customTours,
        activeCustomTourId: state.activeCustomTourId,
        accessibilityPreferences: state.accessibilityPreferences,
        achievementMissions: state.achievementMissions,
        classroomAssignments: state.classroomAssignments,
        classroomReports: state.classroomReports,
      }),
    }
  )
);
