import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultPostcardFrameId } from "@/data/selfie";
import type {
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
  ExploreZone,
  PostcardFrame,
} from "@/types/content";

type PersistedAppStoreState = Pick<
  AppStoreState,
  | "selectedExploreZoneId"
  | "visitedExploreZoneIds"
  | "visitedExplorePlaceSlugs"
  | "selectedPostcardFrame"
  | "hasCompletedTour"
  | "hasGeneratedPostcard"
  | "activeExploreRouteId"
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
  setNavOpen: (isOpen: boolean) => void;
  setSelectedExploreZoneId: (zoneId: ExploreZone["id"] | null) => void;
  markExploreZoneVisited: (zoneId: ExploreZone["id"]) => void;
  markExplorePlaceVisited: (placeSlug: ExplorePlaceSlug) => void;
  setActiveExploreRoute: (routeId: ExploreJourneyRouteId | null) => void;
  resetExploreProgress: () => void;
  setSelectedPostcardFrame: (frameId: PostcardFrame["id"]) => void;
  setHasCompletedTour: (value: boolean) => void;
  setHasGeneratedPostcard: (value: boolean) => void;
};

const initialPersistedState: PersistedAppStoreState = {
  selectedExploreZoneId: null,
  visitedExploreZoneIds: [],
  visitedExplorePlaceSlugs: [],
  selectedPostcardFrame: defaultPostcardFrameId,
  hasCompletedTour: false,
  hasGeneratedPostcard: false,
  activeExploreRouteId: null,
};

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
      resetExploreProgress: () =>
        set({
          ...initialPersistedState,
        }),
      setSelectedPostcardFrame: (frameId) => set({ selectedPostcardFrame: frameId }),
      setHasCompletedTour: (value) => set({ hasCompletedTour: value }),
      setHasGeneratedPostcard: (value) => set({ hasGeneratedPostcard: value }),
    }),
    {
      name: "palace-in-motion-app",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: migratePersistedAppState,
      partialize: (state) => ({
        selectedExploreZoneId: state.selectedExploreZoneId,
        visitedExploreZoneIds: state.visitedExploreZoneIds,
        visitedExplorePlaceSlugs: state.visitedExplorePlaceSlugs,
        selectedPostcardFrame: state.selectedPostcardFrame,
        hasCompletedTour: state.hasCompletedTour,
        hasGeneratedPostcard: state.hasGeneratedPostcard,
        activeExploreRouteId: state.activeExploreRouteId,
      }),
    }
  )
);
