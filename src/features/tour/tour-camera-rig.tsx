"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import type { ExploreCameraStop } from "@/types/content";

type TourCameraRigProps = {
  cameraStop: ExploreCameraStop;
};

export function TourCameraRig({ cameraStop }: TourCameraRigProps) {
  const desiredPositionRef = useRef(new Vector3(...cameraStop.position));
  const desiredTargetRef = useRef(new Vector3(...cameraStop.target));
  const currentTargetRef = useRef(new Vector3(...cameraStop.target));
  const desiredFovRef = useRef(cameraStop.fov ?? 34);

  useEffect(() => {
    desiredPositionRef.current.set(...cameraStop.position);
    desiredTargetRef.current.set(...cameraStop.target);
    desiredFovRef.current = cameraStop.fov ?? 34;
  }, [cameraStop]);

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const positionAlpha = 1 - Math.exp(-delta * 2.25);
    const targetAlpha = 1 - Math.exp(-delta * 2.65);

    camera.position.lerp(desiredPositionRef.current, positionAlpha);
    currentTargetRef.current.lerp(desiredTargetRef.current, targetAlpha);
    camera.fov = MathUtils.damp(camera.fov, desiredFovRef.current, 4.2, delta);
    camera.lookAt(currentTargetRef.current);
    camera.updateProjectionMatrix();
  });

  return null;
}
