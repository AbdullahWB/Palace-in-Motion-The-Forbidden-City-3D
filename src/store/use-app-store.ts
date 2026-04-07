import { create } from "zustand";
import { defaultPostcardFrameId } from "@/data/selfie";
import type { ExplorePlaceSlug, ExploreZone, PostcardFrame } from "@/types/content";

export type AppStoreState = {
  isNavOpen: boolean;
  selectedExploreZoneId: ExploreZone["id"] | null;
  visitedExploreZoneIds: ExploreZone["id"][];
  visitedExplorePlaceSlugs: ExplorePlaceSlug[];
  selectedPostcardFrame: PostcardFrame["id"];
  hasCompletedTour: boolean;
  hasGeneratedPostcard: boolean;
  setNavOpen: (isOpen: boolean) => void;
  setSelectedExploreZoneId: (zoneId: ExploreZone["id"] | null) => void;
  markExploreZoneVisited: (zoneId: ExploreZone["id"]) => void;
  markExplorePlaceVisited: (placeSlug: ExplorePlaceSlug) => void;
  resetExploreProgress: () => void;
  setSelectedPostcardFrame: (frameId: PostcardFrame["id"]) => void;
  setHasCompletedTour: (value: boolean) => void;
  setHasGeneratedPostcard: (value: boolean) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  isNavOpen: false,
  selectedExploreZoneId: null,
  visitedExploreZoneIds: [],
  visitedExplorePlaceSlugs: [],
  selectedPostcardFrame: defaultPostcardFrameId,
  hasCompletedTour: false,
  hasGeneratedPostcard: false,
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
  resetExploreProgress: () =>
    set({
      selectedExploreZoneId: null,
      visitedExploreZoneIds: [],
      visitedExplorePlaceSlugs: [],
      hasCompletedTour: false,
    }),
  setSelectedPostcardFrame: (frameId) =>
    set({ selectedPostcardFrame: frameId }),
  setHasCompletedTour: (value) => set({ hasCompletedTour: value }),
  setHasGeneratedPostcard: (value) => set({ hasGeneratedPostcard: value }),
}));
