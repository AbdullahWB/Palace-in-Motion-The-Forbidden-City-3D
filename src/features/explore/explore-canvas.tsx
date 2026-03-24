"use client";

import { Canvas } from "@react-three/fiber";
import { ExploreScene } from "@/features/explore/explore-scene";

export default function ExploreCanvas() {
  return (
    <div className="paper-panel overflow-hidden rounded-[1.8rem] border border-border">
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Exploration MVP
          </p>
          <p className="mt-1 text-sm text-muted">
            Orbit the blockout scene and click a glowing marker to inspect a key landmark.
          </p>
        </div>
      </div>

      <div className="h-[34rem] w-full">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [9.5, 6.1, 10.4], fov: 36 }}
        >
          <ExploreScene />
        </Canvas>
      </div>
    </div>
  );
}
