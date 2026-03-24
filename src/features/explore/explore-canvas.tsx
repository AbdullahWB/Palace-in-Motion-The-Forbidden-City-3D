"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

function PalaceStudy() {
  return (
    <group position={[0, -0.55, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
        <circleGeometry args={[4.6, 48]} />
        <meshStandardMaterial color="#dec9aa" />
      </mesh>

      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[3.2, 0.7, 2.1]} />
        <meshStandardMaterial color="#6b1e28" roughness={0.58} metalness={0.18} />
      </mesh>

      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[3.95, 0.24, 2.85]} />
        <meshStandardMaterial color="#b88b4c" roughness={0.45} metalness={0.32} />
      </mesh>

      <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.25, 1.15, 4]} />
        <meshStandardMaterial color="#8a2230" roughness={0.42} metalness={0.16} />
      </mesh>

      <Float speed={1.8} rotationIntensity={0.24} floatIntensity={0.45}>
        <group position={[2.8, 1.35, -0.8]}>
          <mesh>
            <torusGeometry args={[0.42, 0.1, 24, 48]} />
            <meshStandardMaterial color="#b78a4c" roughness={0.38} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <cylinderGeometry args={[0.08, 0.08, 1.1, 24]} />
            <meshStandardMaterial color="#6b1e28" roughness={0.54} />
          </mesh>
        </group>
      </Float>

      <Float speed={2.2} rotationIntensity={0.18} floatIntensity={0.35}>
        <mesh position={[-2.45, 0.9, 1.25]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#efe2d0" roughness={0.22} metalness={0.12} />
        </mesh>
      </Float>

      <Float speed={1.6} rotationIntensity={0.22} floatIntensity={0.4}>
        <mesh position={[0.2, 1.95, -2.1]}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial color="#f7f0e3" emissive="#b78a4c" emissiveIntensity={0.18} />
        </mesh>
      </Float>
    </group>
  );
}

export default function ExploreCanvas() {
  return (
    <div className="paper-panel overflow-hidden rounded-[1.8rem] border border-border">
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Live placeholder scene
          </p>
          <p className="mt-1 text-sm text-muted">
            Orbit enabled, primitives only, no remote assets.
          </p>
        </div>
      </div>

      <div className="h-[34rem] w-full">
        <Canvas camera={{ position: [6.5, 4.4, 6.8], fov: 38 }}>
          <color attach="background" args={["#f8f1e6"]} />
          <fog attach="fog" args={["#f8f1e6", 8, 18]} />
          <ambientLight intensity={1.25} />
          <directionalLight position={[6, 8, 5]} intensity={2.1} color="#fff7ea" />
          <directionalLight position={[-5, 4, -4]} intensity={0.75} color="#e3b167" />
          <PalaceStudy />
          <OrbitControls
            enablePan={false}
            minDistance={5.5}
            maxDistance={11}
            minPolarAngle={Math.PI / 3.3}
            maxPolarAngle={Math.PI / 2.02}
          />
        </Canvas>
      </div>
    </div>
  );
}
