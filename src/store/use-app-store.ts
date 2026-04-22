import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultPostcardFrameId } from "@/data/selfie";
import type {
  ExploreJourneyRouteId,
  ExplorePassportSeal,
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
  | "completedExploreRouteIds"
  | "unlockedPassportSealIds"
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
  completedExploreRouteIds: ExploreJourneyRouteId[];
  unlockedPassportSealIds: ExplorePassportSeal["id"][];
  setNavOpen: (isOpen: boolean) => void;
  setSelectedExploreZoneId: (zoneId: ExploreZone["id"] | null) => void;
  markExploreZoneVisited: (zoneId: ExploreZone["id"]) => void;
  markExplorePlaceVisited: (placeSlug: ExplorePlaceSlug) => void;
  setActiveExploreRoute: (routeId: ExploreJourneyRouteId | null) => void;
  markExploreRouteCompleted: (routeId: ExploreJourneyRouteId) => void;
  unlockPassportSeal: (sealId: ExplorePassportSeal["id"]) => void;
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
  completedExploreRouteIds: [],
  unlockedPassportSealIds: [],
};

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
      markExploreRouteCompleted: (routeId) =>
        set((state) => ({
          completedExploreRouteIds: state.completedExploreRouteIds.includes(routeId)
            ? state.completedExploreRouteIds
            : [...state.completedExploreRouteIds, routeId],
        })),
      unlockPassportSeal: (sealId) =>
        set((state) => ({
          unlockedPassportSealIds: state.unlockedPassportSealIds.includes(sealId)
            ? state.unlockedPassportSealIds
            : [...state.unlockedPassportSealIds, sealId],
        })),
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
      partialize: (state) => ({
        selectedExploreZoneId: state.selectedExploreZoneId,
        visitedExploreZoneIds: state.visitedExploreZoneIds,
        visitedExplorePlaceSlugs: state.visitedExplorePlaceSlugs,
        selectedPostcardFrame: state.selectedPostcardFrame,
        hasCompletedTour: state.hasCompletedTour,
        hasGeneratedPostcard: state.hasGeneratedPostcard,
        activeExploreRouteId: state.activeExploreRouteId,
        completedExploreRouteIds: state.completedExploreRouteIds,
        unlockedPassportSealIds: state.unlockedPassportSealIds,
      }),
    }
  )
);
