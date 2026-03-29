"use client";

import dynamic from "next/dynamic";

const ExploreCanvas = dynamic(() => import("@/features/explore/explore-canvas"), {
  ssr: false,
  loading: () => (
    <div className="paper-panel flex h-[34rem] items-center justify-center rounded-[1.8rem] border border-border p-6 text-center text-sm text-muted">
      Preparing the stylized ceremonial axis...
    </div>
  ),
});

export function ExploreStage() {
  return <ExploreCanvas />;
}
