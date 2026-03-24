import { create } from "zustand";
import { defaultPostcardFrameId } from "@/data/selfie";
import { defaultTourStopId } from "@/data/tour";
import type { ExploreHotspot, PostcardFrame, TourStop } from "@/types/content";

export type AppStoreState = {
  isNavOpen: boolean;
  selectedTourStopId: TourStop["id"];
  selectedExploreHotspotId: ExploreHotspot["id"] | null;
  selectedPostcardFrame: PostcardFrame["id"];
  setNavOpen: (isOpen: boolean) => void;
  setSelectedTourStopId: (tourStopId: TourStop["id"]) => void;
  setSelectedExploreHotspotId: (
    hotspotId: ExploreHotspot["id"] | null
  ) => void;
  setSelectedPostcardFrame: (frameId: PostcardFrame["id"]) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  isNavOpen: false,
  selectedTourStopId: defaultTourStopId,
  selectedExploreHotspotId: null,
  selectedPostcardFrame: defaultPostcardFrameId,
  setNavOpen: (isOpen) => set({ isNavOpen: isOpen }),
  setSelectedTourStopId: (tourStopId) => set({ selectedTourStopId: tourStopId }),
  setSelectedExploreHotspotId: (hotspotId) =>
    set({ selectedExploreHotspotId: hotspotId }),
  setSelectedPostcardFrame: (frameId) =>
    set({ selectedPostcardFrame: frameId }),
}));
