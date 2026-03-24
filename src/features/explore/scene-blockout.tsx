function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[38, 34]} />
      <meshStandardMaterial color="#d9c19a" roughness={0.98} />
    </mesh>
  );
}

function AxialCauseway() {
  return (
    <>
      <mesh position={[0, 0.04, -0.3]} receiveShadow>
        <boxGeometry args={[3.1, 0.08, 24.8]} />
        <meshStandardMaterial color="#e6d3b4" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.08, -0.3]} receiveShadow>
        <boxGeometry args={[1.05, 0.05, 24.4]} />
        <meshStandardMaterial color="#d6bea0" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.05, 5.25]} receiveShadow>
        <boxGeometry args={[12, 0.12, 3.7]} />
        <meshStandardMaterial color="#ead9bf" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.05, 0.6]} receiveShadow>
        <boxGeometry args={[13.8, 0.12, 4.2]} />
        <meshStandardMaterial color="#ebdcc6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.22, -3.3]} receiveShadow>
        <boxGeometry args={[15.6, 0.46, 5.8]} />
        <meshStandardMaterial color="#e7d4bb" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.52, -3.3]} receiveShadow>
        <boxGeometry args={[12.2, 0.22, 4.6]} />
        <meshStandardMaterial color="#dec5a4" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.08, -8.1]} receiveShadow>
        <boxGeometry args={[10.8, 0.12, 3.2]} />
        <meshStandardMaterial color="#e4cfb0" roughness={0.9} />
      </mesh>
    </>
  );
}

function SideWalls() {
  return (
    <>
      <mesh position={[-8.7, 0.9, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 1.8, 24.4]} />
        <meshStandardMaterial color="#d2b68d" roughness={0.86} />
      </mesh>
      <mesh position={[8.7, 0.9, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 1.8, 24.4]} />
        <meshStandardMaterial color="#d2b68d" roughness={0.86} />
      </mesh>
      <mesh position={[-8.2, 1.15, 8.3]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 2.3, 2.4]} />
        <meshStandardMaterial color="#7f3037" roughness={0.58} />
      </mesh>
      <mesh position={[8.2, 1.15, 8.3]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 2.3, 2.4]} />
        <meshStandardMaterial color="#7f3037" roughness={0.58} />
      </mesh>
    </>
  );
}

function MeridianGateZone() {
  return (
    <group position={[0, 0, 7.2]}>
      <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.8, 1.84, 1.7]} />
        <meshStandardMaterial color="#752831" roughness={0.58} metalness={0.08} />
      </mesh>
      <mesh position={[-3.2, 1.35, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 2.7, 1.95]} />
        <meshStandardMaterial color="#6f2430" roughness={0.56} />
      </mesh>
      <mesh position={[3.2, 1.35, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 2.7, 1.95]} />
        <meshStandardMaterial color="#6f2430" roughness={0.56} />
      </mesh>
      <mesh position={[0, 1.95, 0.04]} castShadow>
        <boxGeometry args={[9.8, 0.34, 2.15]} />
        <meshStandardMaterial color="#b88c4f" roughness={0.46} metalness={0.18} />
      </mesh>
      <mesh position={[0, 2.68, 0.08]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[4.7, 1.35, 4]} />
        <meshStandardMaterial color="#8c2530" roughness={0.42} metalness={0.11} />
      </mesh>
    </group>
  );
}

function TaiheGateZone() {
  return (
    <group position={[0, 0, 2.6]}>
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 1.64, 1.5]} />
        <meshStandardMaterial color="#7a2a33" roughness={0.58} metalness={0.08} />
      </mesh>
      <mesh position={[0, 1.74, 0.03]} castShadow>
        <boxGeometry args={[7.9, 0.28, 1.95]} />
        <meshStandardMaterial color="#b98e56" roughness={0.48} metalness={0.17} />
      </mesh>
      <mesh position={[0, 2.34, 0.08]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.85, 1.08, 4]} />
        <meshStandardMaterial color="#8f2832" roughness={0.43} metalness={0.12} />
      </mesh>
      <mesh position={[-5.2, 0.66, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 1.32, 1.25]} />
        <meshStandardMaterial color="#b58a4f" roughness={0.6} />
      </mesh>
      <mesh position={[5.2, 0.66, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 1.32, 1.25]} />
        <meshStandardMaterial color="#b58a4f" roughness={0.6} />
      </mesh>
    </group>
  );
}

function HallOfSupremeHarmonyZone() {
  return (
    <group position={[0, 0, -2.8]}>
      <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.8, 1.84, 7.1]} />
        <meshStandardMaterial color="#eadcc4" roughness={0.84} />
      </mesh>
      <mesh position={[0, 1.82, 1.1]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.18, 1.55]} />
        <meshStandardMaterial color="#dbc2a1" roughness={0.82} />
      </mesh>
      <mesh position={[0, 3.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 2.72, 4.9]} />
        <meshStandardMaterial color="#6b2430" roughness={0.56} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4.7, 0.08]} castShadow>
        <boxGeometry args={[8.45, 0.3, 5.8]} />
        <meshStandardMaterial color="#c19453" roughness={0.44} metalness={0.2} />
      </mesh>
      <mesh position={[0, 5.78, 0.08]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[4.7, 2.08, 4]} />
        <meshStandardMaterial color="#8b2531" roughness={0.4} metalness={0.12} />
      </mesh>
      <mesh position={[-6.4, 1.1, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshStandardMaterial color="#b98a4f" roughness={0.58} />
      </mesh>
      <mesh position={[6.4, 1.1, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshStandardMaterial color="#b98a4f" roughness={0.58} />
      </mesh>
    </group>
  );
}

function InnerCourtThresholdZone() {
  return (
    <group position={[0, 0, -8.3]}>
      <mesh position={[0, 0.84, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.6, 1.68, 1.48]} />
        <meshStandardMaterial color="#622430" roughness={0.58} metalness={0.07} />
      </mesh>
      <mesh position={[0, 1.74, 0.04]} castShadow>
        <boxGeometry args={[8.55, 0.28, 1.92]} />
        <meshStandardMaterial color="#ad8042" roughness={0.48} metalness={0.18} />
      </mesh>
      <mesh position={[0, 2.34, 0.08]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[4.05, 1.02, 4]} />
        <meshStandardMaterial color="#7d232d" roughness={0.42} metalness={0.12} />
      </mesh>
      <mesh position={[-6.1, 0.78, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.55, 1.25]} />
        <meshStandardMaterial color="#ae8348" roughness={0.62} />
      </mesh>
      <mesh position={[6.1, 0.78, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.55, 1.25]} />
        <meshStandardMaterial color="#ae8348" roughness={0.62} />
      </mesh>
    </group>
  );
}

function SymmetricalCourtMasses() {
  return (
    <>
      <mesh position={[-6.1, 0.82, 3.1]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 1.65, 2.25]} />
        <meshStandardMaterial color="#b88c54" roughness={0.6} />
      </mesh>
      <mesh position={[6.1, 0.82, 3.1]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 1.65, 2.25]} />
        <meshStandardMaterial color="#b88c54" roughness={0.6} />
      </mesh>
      <mesh position={[-6.8, 0.82, -3.7]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 1.65, 2.55]} />
        <meshStandardMaterial color="#b1864e" roughness={0.6} />
      </mesh>
      <mesh position={[6.8, 0.82, -3.7]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 1.65, 2.55]} />
        <meshStandardMaterial color="#b1864e" roughness={0.6} />
      </mesh>
      <mesh position={[-7.2, 0.9, -8.3]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 1.8, 1.9]} />
        <meshStandardMaterial color="#9f7641" roughness={0.62} />
      </mesh>
      <mesh position={[7.2, 0.9, -8.3]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 1.8, 1.9]} />
        <meshStandardMaterial color="#9f7641" roughness={0.62} />
      </mesh>
    </>
  );
}

export function SceneBlockout() {
  return (
    <group>
      <GroundPlane />
      <AxialCauseway />
      <SideWalls />
      <SymmetricalCourtMasses />
      <MeridianGateZone />
      <TaiheGateZone />
      <HallOfSupremeHarmonyZone />
      <InnerCourtThresholdZone />
    </group>
  );
}
