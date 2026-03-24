import { create } from "zustand";
import { defaultPostcardFrameId } from "@/data/selfie";
import { defaultTourStopId } from "@/data/tour";
import type { ExploreZone, PostcardFrame, TourStop } from "@/types/content";

export type AppStoreState = {
  isNavOpen: boolean;
  selectedTourStopId: TourStop["id"];
  selectedExploreZoneId: ExploreZone["id"] | null;
  selectedPostcardFrame: PostcardFrame["id"];
  setNavOpen: (isOpen: boolean) => void;
  setSelectedTourStopId: (tourStopId: TourStop["id"]) => void;
  setSelectedExploreZoneId: (zoneId: ExploreZone["id"] | null) => void;
  setSelectedPostcardFrame: (frameId: PostcardFrame["id"]) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  isNavOpen: false,
  selectedTourStopId: defaultTourStopId,
  selectedExploreZoneId: null,
  selectedPostcardFrame: defaultPostcardFrameId,
  setNavOpen: (isOpen) => set({ isNavOpen: isOpen }),
  setSelectedTourStopId: (tourStopId) => set({ selectedTourStopId: tourStopId }),
  setSelectedExploreZoneId: (zoneId) => set({ selectedExploreZoneId: zoneId }),
  setSelectedPostcardFrame: (frameId) =>
    set({ selectedPostcardFrame: frameId }),
}));
