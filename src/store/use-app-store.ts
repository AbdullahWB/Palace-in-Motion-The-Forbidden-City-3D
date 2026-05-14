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
} from "@/types/competition";
import type { AccessibilityPreferences } from "@/types/preferences";
import type { JourneyBackupInput } from "@/lib/journey-backup";

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
  exportJourneyBackup: () => JourneyBackupInput;
  importJourneyBackup: (backup: JourneyBackupInput) => void;
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

  const validTypes = new Set(["route", "quiz", "preservation", "diary", "three-d"]);

  return value
    .filter(
      (mission): mission is AchievementMissionState =>
        Boolean(mission) &&
        typeof mission === "object" &&
        typeof (mission as AchievementMissionState).id === "string" &&
        typeof (mission as AchievementMissionState).type === "string" &&
        validTypes.has((mission as AchievementMissionState).type) &&
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
  };
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
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
      exportJourneyBackup: () => {
        const state = get();

        return {
          visitedExplorePlaceSlugs: state.visitedExplorePlaceSlugs,
          passportMissions: state.passportMissions,
          customTours: state.customTours,
          activeCustomTourId: state.activeCustomTourId,
          activeExploreRouteId: state.activeExploreRouteId,
          achievementMissions: state.achievementMissions,
          accessibilityPreferences: state.accessibilityPreferences,
        };
      },
      importJourneyBackup: (backup) =>
        set((state) => ({
          visitedExplorePlaceSlugs: backup.visitedExplorePlaceSlugs,
          passportMissions: backup.passportMissions,
          customTours: backup.customTours,
          activeCustomTourId: backup.activeCustomTourId,
          activeExploreRouteId:
            typeof backup.activeExploreRouteId === "string"
              ? (backup.activeExploreRouteId as ExploreJourneyRouteId)
              : null,
          achievementMissions: backup.achievementMissions,
          accessibilityPreferences: {
            ...state.accessibilityPreferences,
            ...backup.accessibilityPreferences,
          },
        })),
      resetExploreProgress: () =>
        set((state) => ({
          ...initialPersistedState,
          accessibilityPreferences: state.accessibilityPreferences,
        })),
      setSelectedPostcardFrame: (frameId) => set({ selectedPostcardFrame: frameId }),
      setHasCompletedTour: (value) => set({ hasCompletedTour: value }),
      setHasGeneratedPostcard: (value) => set({ hasGeneratedPostcard: value }),
    }),
    {
      name: "palace-in-motion-app",
      storage: createJSONStorage(() => localStorage),
      version: 6,
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
      }),
    }
  )
);
