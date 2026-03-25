"use client";

import { GuidePanel } from "@/features/ai-guide/guide-panel";
import { getExploreZoneById } from "@/data/explore";
import { siteOverview } from "@/data/heritage/site-overview";
import { HERITAGE_SCENE_ID } from "@/lib/constants";
import { useAppStore } from "@/store/use-app-store";
import { ScenePanel } from "@/features/explore/scene-panel";

export function ExploreSidebar() {
  const selectedExploreZoneId = useAppStore((state) => state.selectedExploreZoneId);
  const selectedZone = selectedExploreZoneId
    ? getExploreZoneById(selectedExploreZoneId)
    : null;

  return (
    <div className="space-y-6">
      <ScenePanel />
      <GuidePanel
        sceneId={HERITAGE_SCENE_ID}
        hotspotId={selectedZone?.id ?? null}
        contextLabel={selectedZone?.title ?? siteOverview.headline}
      />
    </div>
  );
}
