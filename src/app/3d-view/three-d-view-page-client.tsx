"use client";

import dynamic from "next/dynamic";
import { ForbiddenCityLoadingScreen } from "@/components/ui/forbidden-city-status-screens";
import type { ThreeDViewerConfig } from "@/features/three-d-view/viewer-config";

type ThreeDViewPageClientProps = {
  config: ThreeDViewerConfig;
  hasModelAsset: boolean;
};

const DynamicThreeDViewShell = dynamic(
  () =>
    import("@/features/three-d-view/three-d-view-shell").then(
      (mod) => mod.ThreeDViewShell
    ),
  {
    ssr: false,
    loading: () => <ForbiddenCityLoadingScreen />,
  }
);

export function ThreeDViewPageClient({
  config,
  hasModelAsset,
}: ThreeDViewPageClientProps) {
  return (
    <DynamicThreeDViewShell
      config={config}
      hasModelAsset={hasModelAsset}
    />
  );
}
