import { RouteLoadingShell } from "@/components/ui/route-loading-shell";

export default function Loading() {
  return (
    <RouteLoadingShell
      eyebrow="Guided tour"
      title="Loading the guided walkthrough..."
      description="Preparing the camera-driven route, active stop panel, and supporting interpretation."
    />
  );
}
