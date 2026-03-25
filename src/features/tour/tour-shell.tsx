"use client";

import dynamic from "next/dynamic";
import { getExploreZoneById } from "@/data/explore";
import { TourCompletion } from "@/features/tour/tour-completion";
import { tourSteps } from "@/features/tour/tour-data";
import { TourSidebar } from "@/features/tour/tour-sidebar";
import { useTourController } from "@/features/tour/use-tour-controller";

const TourScene = dynamic(() => import("@/features/tour/tour-scene"), {
  ssr: false,
  loading: () => (
    <div className="paper-panel flex h-[34rem] items-center justify-center rounded-[1.8rem] border border-border p-6 text-center text-sm text-muted xl:h-[42rem]">
      Preparing the guided scene...
    </div>
  ),
});

export function TourShell() {
  const { activeIndex, isComplete, goNext, goPrevious, goToStep, restart } =
    useTourController(tourSteps.length);

  const activeStep = tourSteps[activeIndex];
  const sceneStep = isComplete ? tourSteps[tourSteps.length - 1] : activeStep;
  const activeZone = activeStep.focusZoneId
    ? getExploreZoneById(activeStep.focusZoneId)
    : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.48fr)_24rem]">
      <TourScene
        cameraStop={sceneStep.cameraStop}
        focusZoneId={sceneStep.focusZoneId ?? null}
      />

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
    </div>
  );
}
