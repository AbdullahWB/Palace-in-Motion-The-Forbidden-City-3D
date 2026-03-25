"use client";

import { useRef } from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import type { Group } from "three";
import { getExploreZoneById } from "@/data/explore";
import { SceneBlockout } from "@/features/explore/scene-blockout";
import { TourCameraRig } from "@/features/tour/tour-camera-rig";
import type { ExploreCameraStop, ExploreZone } from "@/types/content";

type TourSceneProps = {
  cameraStop: ExploreCameraStop;
  focusZoneId?: ExploreZone["id"] | null;
};

function FocusZoneMarker({ zoneId }: { zoneId: ExploreZone["id"] }) {
  const zone = getExploreZoneById(zoneId);
  const markerRef = useRef<Group>(null);

  useFrame((state) => {
    if (!markerRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.3) * 0.045;
    markerRef.current.scale.setScalar(pulse);
  });

  if (!zone) {
    return null;
  }

  return (
    <group>
      <mesh
        position={[zone.markerPosition[0], 0.12, zone.markerPosition[2]]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.92, 0.08, 20, 52]} />
        <meshBasicMaterial color="#8a2230" transparent opacity={0.78} />
      </mesh>

      <group ref={markerRef} position={zone.markerPosition}>
        <mesh>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial
            color="#fff4d7"
            emissive="#c38d3b"
            emissiveIntensity={0.88}
            roughness={0.28}
            metalness={0.05}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.56, 0.06, 18, 42]} />
          <meshBasicMaterial color="#8a2230" transparent opacity={0.96} />
        </mesh>

        <mesh position={[0, -0.56, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.96, 12]} />
          <meshBasicMaterial color="#8a2230" transparent opacity={0.58} />
        </mesh>
      </group>
    </group>
  );
}

export default function TourScene({
  cameraStop,
  focusZoneId = null,
}: TourSceneProps) {
  return (
    <div className="paper-panel overflow-hidden rounded-[1.8rem] border border-border">
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Guided camera
          </p>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            This walkthrough reuses the stylized scene but trades free orbit for
            paced framing, so each stop can read clearly as part of the
            ceremonial sequence.
          </p>
        </div>
      </div>

      <div className="h-[34rem] w-full xl:h-[42rem]">
        <Canvas
          dpr={[1, 1.5]}
          shadows
          camera={{ position: cameraStop.position, fov: cameraStop.fov ?? 34 }}
        >
          <color attach="background" args={["#ecdeca"]} />
          <fog attach="fog" args={["#ecdeca", 12, 30]} />
          <ambientLight intensity={1.08} />
          <directionalLight
            position={[10, 12, 7]}
            intensity={1.9}
            color="#fff7e7"
          />
          <directionalLight
            position={[-8, 5, -10]}
            intensity={0.88}
            color="#d5a35f"
          />

          <SceneBlockout />
          {focusZoneId ? <FocusZoneMarker zoneId={focusZoneId} /> : null}
          <TourCameraRig cameraStop={cameraStop} />
        </Canvas>
      </div>
    </div>
  );
}
