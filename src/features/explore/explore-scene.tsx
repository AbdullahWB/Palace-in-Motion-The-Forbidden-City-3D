import { OrbitControls } from "@react-three/drei";
import { HotspotLayer } from "@/features/explore/hotspot-layer";
import { SceneBlockout } from "@/features/explore/scene-blockout";

export function ExploreScene() {
  return (
    <>
      <color attach="background" args={["#efe2cf"]} />
      <fog attach="fog" args={["#efe2cf", 9, 24]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[8, 10, 6]} intensity={1.95} color="#fff6eb" />
      <directionalLight position={[-6, 4, -8]} intensity={0.8} color="#d6a863" />

      <SceneBlockout />
      <HotspotLayer />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={7}
        maxDistance={15}
        minPolarAngle={Math.PI / 3.6}
        maxPolarAngle={Math.PI / 2.03}
        target={[0, 1.6, -1.2]}
      />
    </>
  );
}
