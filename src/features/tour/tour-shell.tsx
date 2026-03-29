"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { getExploreZoneById } from "@/data/explore";
import { GuidePanel } from "@/features/ai-guide/guide-panel";
import { TourCompletion } from "@/features/tour/tour-completion";
import { tourSteps } from "@/features/tour/tour-data";
import { TourSidebar } from "@/features/tour/tour-sidebar";
import { useTourController } from "@/features/tour/use-tour-controller";
import { HERITAGE_SCENE_ID } from "@/lib/constants";
import { useAppStore } from "@/store/use-app-store";

const TourScene = dynamic(() => import("@/features/tour/tour-scene"), {
  ssr: false,
  loading: () => (
    <div className="paper-panel flex h-[34rem] items-center justify-center rounded-[1.8rem] border border-border p-6 text-center text-sm text-muted xl:h-[42rem]">
      Preparing the guided camera route...
    </div>
  ),
});

export function TourShell() {
  const { activeIndex, isComplete, goNext, goPrevious, goToStep, restart } =
    useTourController(tourSteps.length);
  const setHasCompletedTour = useAppStore((state) => state.setHasCompletedTour);

  const activeStep = tourSteps[activeIndex];
  const sceneStep = isComplete ? tourSteps[tourSteps.length - 1] : activeStep;
  const activeZone = activeStep.focusZoneId
    ? getExploreZoneById(activeStep.focusZoneId)
    : null;

  useEffect(() => {
    if (isComplete) {
      setHasCompletedTour(true);
    }
  }, [isComplete, setHasCompletedTour]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.48fr)_24rem]">
      <TourScene
        cameraStop={sceneStep.cameraStop}
        focusZoneId={sceneStep.focusZoneId ?? null}
      />

      <div className="space-y-6">
        {isComplete ? (
          <TourCompletion onRestart={restart} />
        ) : (
          <TourSidebar
            steps={tourSteps}
            activeIndex={activeIndex}
            activeZone={activeZone}
            onStepSelect={goToStep}
            onNext={goNext}
            onPrevious={goPrevious}
          />
        )}

        <GuidePanel
          sceneId={HERITAGE_SCENE_ID}
          hotspotId={sceneStep.focusZoneId ?? null}
          tourStepId={sceneStep.id}
          contextLabel={sceneStep.title}
        />
      </div>
    </div>
  );
}
