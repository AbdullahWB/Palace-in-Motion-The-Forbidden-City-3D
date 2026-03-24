"use client";

import { Canvas } from "@react-three/fiber";
import { ExploreScene } from "@/features/explore/explore-scene";

export default function ExploreCanvas() {
  return (
    <div className="paper-panel overflow-hidden rounded-[1.8rem] border border-border">
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Stylized ceremonial axis
          </p>
          <p className="mt-1 text-sm text-muted">
            Orbit a simplified Forbidden City-inspired layout and inspect each zone along the north-south procession.
          </p>
        </div>
      </div>

      <div className="h-[34rem] w-full">
        <Canvas
          dpr={[1, 1.5]}
          shadows
          camera={{ position: [11.2, 7.2, 13.4], fov: 34 }}
        >
          <ExploreScene />
        </Canvas>
      </div>
    </div>
  );
}
