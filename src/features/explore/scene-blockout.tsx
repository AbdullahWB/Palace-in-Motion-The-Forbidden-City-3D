function CourtyardGround() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#dcc5a3" roughness={0.96} />
      </mesh>

      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[14, 0.12, 12]} />
        <meshStandardMaterial color="#e8d4b4" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.09, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.08, 11]} />
        <meshStandardMaterial color="#d7bea0" roughness={0.88} />
      </mesh>
    </>
  );
}

function MeridianGateBlock() {
  return (
    <group position={[0, 0, 4.05]}>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 1.4, 1.55]} />
        <meshStandardMaterial color="#74303a" roughness={0.6} metalness={0.08} />
      </mesh>
      <mesh position={[0, 1.52, 0.02]} castShadow>
        <boxGeometry args={[5.2, 0.3, 1.95]} />
        <meshStandardMaterial color="#b78a4c" roughness={0.48} metalness={0.18} />
      </mesh>
      <mesh position={[0, 2.05, 0.02]} castShadow>
        <coneGeometry args={[2.75, 0.9, 4]} />
        <meshStandardMaterial color="#8a2230" roughness={0.42} metalness={0.1} />
      </mesh>
    </group>
  );
}

function SupremeHarmonyBlock() {
  return (
    <group position={[0, 0, -0.55]}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.55, 4.8]} />
        <meshStandardMaterial color="#e9d9c0" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.78, 0.78]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.16, 1.1]} />
        <meshStandardMaterial color="#d8c1a4" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.9, 1.85, 3.5]} />
        <meshStandardMaterial color="#6c2430" roughness={0.57} metalness={0.12} />
      </mesh>
      <mesh position={[0, 2.8, 0.04]} castShadow>
        <boxGeometry args={[5.8, 0.26, 4.2]} />
        <meshStandardMaterial color="#bf9352" roughness={0.44} metalness={0.22} />
      </mesh>
      <mesh position={[0, 3.6, 0.02]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.15, 1.55, 4]} />
        <meshStandardMaterial color="#8d2732" roughness={0.4} metalness={0.14} />
      </mesh>
    </group>
  );
}

function HeavenlyPurityBlock() {
  return (
    <group position={[0, 0, -4.7]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 0.38, 3.55]} />
        <meshStandardMaterial color="#e4d2b6" roughness={0.84} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.55, 2.8]} />
        <meshStandardMaterial color="#5d2733" roughness={0.6} metalness={0.08} />
      </mesh>
      <mesh position={[0, 2.08, 0]} castShadow>
        <boxGeometry args={[4.45, 0.22, 3.3]} />
        <meshStandardMaterial color="#af8143" roughness={0.45} metalness={0.18} />
      </mesh>
      <mesh position={[0, 2.73, 0.02]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.35, 1.18, 4]} />
        <meshStandardMaterial color="#7f212b" roughness={0.42} metalness={0.12} />
      </mesh>
    </group>
  );
}

function SideLandmarks() {
  return (
    <>
      <mesh position={[-6, 0.55, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color="#b58952" roughness={0.62} />
      </mesh>
      <mesh position={[6, 0.55, -2]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color="#b58952" roughness={0.62} />
      </mesh>
      <mesh position={[-5.4, 1.15, -3.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.28, 2.3, 18]} />
        <meshStandardMaterial color="#7d3138" roughness={0.56} />
      </mesh>
      <mesh position={[5.2, 1.15, 2.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.28, 2.3, 18]} />
        <meshStandardMaterial color="#7d3138" roughness={0.56} />
      </mesh>
    </>
  );
}

export function SceneBlockout() {
  return (
    <group>
      <CourtyardGround />
      <MeridianGateBlock />
      <SupremeHarmonyBlock />
      <HeavenlyPurityBlock />
      <SideLandmarks />
    </group>
  );
}
