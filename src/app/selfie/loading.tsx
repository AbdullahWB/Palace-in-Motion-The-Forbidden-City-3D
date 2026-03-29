import { RouteLoadingShell } from "@/components/ui/route-loading-shell";

export default function Loading() {
  return (
    <RouteLoadingShell
      eyebrow="Selfie and postcard"
      title="Loading the souvenir studio..."
      description="Preparing the postcard preview, caption controls, and completion badge state."
      canvasHeightClassName="h-[34rem]"
    />
  );
}
