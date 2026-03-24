import { OrbitControls } from "@react-three/drei";
import { ZoneLayer } from "@/features/explore/zone-layer";
import { SceneBlockout } from "@/features/explore/scene-blockout";

export function ExploreScene() {
  return (
    <>
      <color attach="background" args={["#ecdeca"]} />
      <fog attach="fog" args={["#ecdeca", 12, 30]} />
      <ambientLight intensity={1.08} />
      <directionalLight position={[10, 12, 7]} intensity={1.9} color="#fff7e7" />
      <directionalLight position={[-8, 5, -10]} intensity={0.88} color="#d5a35f" />

      <SceneBlockout />
      <ZoneLayer />

      <OrbitControls
        enableDamping
        dampingFactor={0.075}
        enablePan={false}
        minDistance={9}
        maxDistance={18}
        minPolarAngle={Math.PI / 3.9}
        maxPolarAngle={Math.PI / 2.02}
        target={[0, 2.2, -1.6]}
      />
    </>
  );
}
