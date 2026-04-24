"use client";

import dynamic from "next/dynamic";
import { ImmersiveStatusScreen } from "@/components/ui/app-status-screens";
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
    loading: () => (
      <ImmersiveStatusScreen
        kind="loading"
        eyebrow={{ zh: "三维视图", en: "3D View" }}
        statusLabel={{ zh: "场景预热中", en: "Scene warming up" }}
        title={{
          zh: "正在准备全屏故宫三维展示…",
          en: "Preparing the fullscreen Forbidden City 3D showcase...",
        }}
        description={{
          zh: "三维渲染器会在当前页面加载完成后再初始化，以避免开发环境下的块加载异常。",
          en: "The 3D renderer starts after the page shell is ready to avoid chunk loading issues in development.",
        }}
      />
    ),
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
