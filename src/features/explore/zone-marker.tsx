"use client";

import { useState } from "react";
import { useCursor } from "@react-three/drei";
import type { ExploreZone } from "@/types/content";

type ZoneMarkerProps = {
  zone: ExploreZone;
  isSelected: boolean;
  onSelect: (id: ExploreZone["id"]) => void;
};

export function ZoneMarker({
  zone,
  isSelected,
  onSelect,
}: ZoneMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  useCursor(isHovered);

  const sphereColor = isSelected ? "#fff4d7" : "#f7dfaf";
  const ringColor = isSelected ? "#8a2230" : "#b78a4c";
  const ringScale = isHovered || isSelected ? 1.22 : 1;

  return (
    <group position={zone.markerPosition}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(zone.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setIsHovered(true);
        }}
        onPointerOut={() => setIsHovered(false)}
      >
        <sphereGeometry args={[0.56, 18, 18]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>

      <mesh scale={ringScale}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color={sphereColor}
          emissive="#c38d3b"
          emissiveIntensity={isHovered || isSelected ? 0.8 : 0.45}
          roughness={0.28}
          metalness={0.05}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} scale={ringScale}>
        <torusGeometry args={[0.52, 0.055, 18, 42]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={isSelected ? 0.95 : 0.72}
        />
      </mesh>

      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 12]} />
        <meshBasicMaterial color="#8a2230" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
