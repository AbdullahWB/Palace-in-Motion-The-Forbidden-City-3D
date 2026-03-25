import { create } from "zustand";
import { defaultPostcardFrameId } from "@/data/selfie";
import type { ExploreZone, PostcardFrame } from "@/types/content";

export type AppStoreState = {
  isNavOpen: boolean;
  selectedExploreZoneId: ExploreZone["id"] | null;
  selectedPostcardFrame: PostcardFrame["id"];
  setNavOpen: (isOpen: boolean) => void;
  setSelectedExploreZoneId: (zoneId: ExploreZone["id"] | null) => void;
  setSelectedPostcardFrame: (frameId: PostcardFrame["id"]) => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  isNavOpen: false,
  selectedExploreZoneId: null,
  selectedPostcardFrame: defaultPostcardFrameId,
  setNavOpen: (isOpen) => set({ isNavOpen: isOpen }),
  setSelectedExploreZoneId: (zoneId) => set({ selectedExploreZoneId: zoneId }),
  setSelectedPostcardFrame: (frameId) =>
    set({ selectedPostcardFrame: frameId }),
}));
