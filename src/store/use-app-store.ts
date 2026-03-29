import { create } from "zustand";
import { defaultPostcardFrameId } from "@/data/selfie";
import type { ExploreZone, PostcardFrame } from "@/types/content";

export type AppStoreState = {
  isNavOpen: boolean;
  selectedExploreZoneId: ExploreZone["id"] | null;
  selectedPostcardFrame: PostcardFrame["id"];
  hasCompletedTour: boolean;
  hasGeneratedPostcard: boolean;
  setNavOpen: (isOpen: boolean) => void;
  setSelectedExploreZoneId: (zoneId: ExploreZone["id"] | null) => void;
  setSelectedPostcardFrame: (frameId: PostcardFrame["id"]) => void;
  setHasCompletedTour: (value: boolean) => void;
  setHasGeneratedPostcard: (value: boolean) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  isNavOpen: false,
  selectedExploreZoneId: null,
  selectedPostcardFrame: defaultPostcardFrameId,
  hasCompletedTour: false,
  hasGeneratedPostcard: false,
  setNavOpen: (isOpen) => set({ isNavOpen: isOpen }),
  setSelectedExploreZoneId: (zoneId) => set({ selectedExploreZoneId: zoneId }),
  setSelectedPostcardFrame: (frameId) =>
    set({ selectedPostcardFrame: frameId }),
  setHasCompletedTour: (value) => set({ hasCompletedTour: value }),
  setHasGeneratedPostcard: (value) => set({ hasGeneratedPostcard: value }),
}));
