import { create } from "zustand";
import { defaultPostcardFrameId } from "@/data/selfie";
import { defaultTourStopId } from "@/data/tour";
import type { PostcardFrame, TourStop } from "@/types/content";

export type AppStoreState = {
  isNavOpen: boolean;
  selectedTourStopId: TourStop["id"];
  selectedPostcardFrame: PostcardFrame["id"];
  setNavOpen: (isOpen: boolean) => void;
  setSelectedTourStopId: (tourStopId: TourStop["id"]) => void;
  setSelectedPostcardFrame: (frameId: PostcardFrame["id"]) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  isNavOpen: false,
  selectedTourStopId: defaultTourStopId,
  selectedPostcardFrame: defaultPostcardFrameId,
  setNavOpen: (isOpen) => set({ isNavOpen: isOpen }),
  setSelectedTourStopId: (tourStopId) => set({ selectedTourStopId: tourStopId }),
  setSelectedPostcardFrame: (frameId) =>
    set({ selectedPostcardFrame: frameId }),
}));
