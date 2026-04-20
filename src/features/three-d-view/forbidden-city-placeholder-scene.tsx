function StoneTerrace({
  position,
  size,
  color = "#e7d7bc",
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.92} />
    </mesh>
  );
}

function RoofMass({
  width,
  depth,
  y,
  roofHeight,
}: {
  width: number;
  depth: number;
  y: number;
  roofHeight: number;
}) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow>
        <boxGeometry args={[width + 1.2, 0.18, depth + 1.3]} />
        <meshStandardMaterial color="#b88a43" roughness={0.42} metalness={0.2} />
      </mesh>
      <mesh position={[0, roofHeight * 0.45, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[Math.max(width * 0.44, depth * 0.72), roofHeight, 4]} />
        <meshStandardMaterial color="#c79a51" roughness={0.36} metalness={0.18} />
      </mesh>
      <mesh position={[0, roofHeight * 0.92, 0]} castShadow>
        <boxGeometry args={[width * 0.16, 0.12, depth * 0.16]} />
        <meshStandardMaterial color="#8c2531" roughness={0.48} />
      </mesh>
    </group>
  );
}

function ColumnRow({
  count,
  width,
  z,
}: {
  count: number;
  width: number;
  z: number;
}) {
  const spacing = width / (count + 1);
  const start = -width / 2 + spacing;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <mesh
          key={`${z}-${index}`}
          position={[start + spacing * index, 1.5, z]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.16, 0.18, 3, 16]} />
          <meshStandardMaterial color="#80303a" roughness={0.56} metalness={0.08} />
        </mesh>
      ))}
    </>
  );
}

function ImperialHall({
  position,
  width,
  depth,
  bodyHeight,
  roofHeight,
  plinthHeight,
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  bodyHeight: number;
  roofHeight: number;
  plinthHeight: number;
}) {
  return (
    <group position={position}>
      <StoneTerrace position={[0, plinthHeight * 0.3, 0]} size={[width + 8, plinthHeight * 0.6, depth + 8]} color="#e9dcc2" />
      <StoneTerrace position={[0, plinthHeight * 0.72, 0]} size={[width + 4.5, plinthHeight * 0.38, depth + 4.2]} color="#ddc7a4" />

      <mesh position={[0, plinthHeight + bodyHeight * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, bodyHeight, depth]} />
        <meshStandardMaterial color="#8d313a" roughness={0.56} metalness={0.08} />
      </mesh>

      <mesh position={[0, plinthHeight + bodyHeight * 0.2, depth * 0.51]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.35, bodyHeight * 0.62, 0.36]} />
        <meshStandardMaterial color="#742530" roughness={0.52} metalness={0.07} />
      </mesh>

      <ColumnRow count={7} width={width * 0.92} z={depth * 0.54} />
      <RoofMass width={width} depth={depth} y={plinthHeight + bodyHeight + 0.28} roofHeight={roofHeight} />
    </group>
  );
}

function SideCourtPavilions() {
  const pavilionPositions: Array<[number, number, number]> = [
    [-18, 0, 11],
    [18, 0, 11],
    [-20, 0, -6],
    [20, 0, -6],
    [-22, 0, -22],
    [22, 0, -22],
  ];

  return (
    <>
      {pavilionPositions.map((position, index) => (
        <group key={index} position={position}>
          <StoneTerrace position={[0, 0.22, 0]} size={[5.2, 0.44, 5]} color="#e2d1b3" />
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[4, 2.1, 3.6]} />
            <meshStandardMaterial color="#8a3038" roughness={0.58} />
          </mesh>
          <RoofMass width={4.2} depth={3.8} y={2.42} roofHeight={1.8} />
        </group>
      ))}
    </>
  );
}

function CypressCluster({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.28, 3.6, 12]} />
        <meshStandardMaterial color="#523828" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.3, 0]} castShadow>
        <sphereGeometry args={[1.35, 18, 18]} />
        <meshStandardMaterial color="#3d5d3d" roughness={0.96} />
      </mesh>
      <mesh position={[0.75, 4.05, 0.3]} castShadow>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial color="#446645" roughness={0.95} />
      </mesh>
      <mesh position={[-0.68, 4.05, -0.2]} castShadow>
        <sphereGeometry args={[0.95, 16, 16]} />
        <meshStandardMaterial color="#355436" roughness={0.95} />
      </mesh>
    </group>
  );
}

function PalaceAxisGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#d4c09b" roughness={0.98} />
      </mesh>

      <StoneTerrace position={[0, 0.06, -6]} size={[9, 0.12, 78]} color="#eadbc0" />
      <StoneTerrace position={[0, 0.1, -6]} size={[2.2, 0.08, 76]} color="#d7c2a0" />
      <StoneTerrace position={[0, 0.14, 17]} size={[23, 0.16, 7]} color="#e8d9be" />
      <StoneTerrace position={[0, 0.18, 1]} size={[31, 0.2, 9.2]} color="#e8d9be" />
      <StoneTerrace position={[0, 0.28, -14]} size={[38, 0.22, 11.5]} color="#e6d4b6" />
      <StoneTerrace position={[0, 0.44, -29]} size={[28, 0.26, 9]} color="#e2ccb0" />
      <StoneTerrace position={[0, 0.22, 30]} size={[44, 0.2, 6]} color="#cfb489" />
      <StoneTerrace position={[-28, 0.18, -6]} size={[5, 0.36, 84]} color="#cda878" />
      <StoneTerrace position={[28, 0.18, -6]} size={[5, 0.36, 84]} color="#cda878" />
    </group>
  );
}

function OuterWalls() {
  return (
    <group>
      <mesh position={[-36, 2.1, -6]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 4.2, 92]} />
        <meshStandardMaterial color="#b15746" roughness={0.84} />
      </mesh>
      <mesh position={[36, 2.1, -6]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 4.2, 92]} />
        <meshStandardMaterial color="#b15746" roughness={0.84} />
      </mesh>
      <mesh position={[0, 2.1, 38]} castShadow receiveShadow>
        <boxGeometry args={[74, 4.2, 1.8]} />
        <meshStandardMaterial color="#b15746" roughness={0.84} />
      </mesh>
      <mesh position={[0, 2.1, -50]} castShadow receiveShadow>
        <boxGeometry args={[74, 4.2, 1.8]} />
        <meshStandardMaterial color="#b15746" roughness={0.84} />
      </mesh>
    </group>
  );
}

export function ForbiddenCityPlaceholderScene() {
  return (
    <group position={[0, 0, 4]}>
      <PalaceAxisGround />
      <OuterWalls />

      <ImperialHall position={[0, 0, 23]} width={18} depth={6.2} bodyHeight={3.5} roofHeight={3.2} plinthHeight={0.72} />
      <ImperialHall position={[0, 0, 6]} width={14.2} depth={5.4} bodyHeight={3} roofHeight={2.6} plinthHeight={0.68} />
      <ImperialHall position={[0, 0, -12]} width={23} depth={10} bodyHeight={5.2} roofHeight={4.6} plinthHeight={1.2} />
      <ImperialHall position={[0, 0, -30]} width={12.4} depth={5.2} bodyHeight={3} roofHeight={2.4} plinthHeight={0.6} />

      <SideCourtPavilions />

      <CypressCluster x={-12} z={17} scale={1.2} />
      <CypressCluster x={12} z={17} scale={1.15} />
      <CypressCluster x={-16} z={-3} scale={1.1} />
      <CypressCluster x={16} z={-3} scale={1.08} />
      <CypressCluster x={-18} z={-19} scale={1.05} />
      <CypressCluster x={18} z={-19} scale={1.05} />
      <CypressCluster x={-28} z={28} scale={1.3} />
      <CypressCluster x={28} z={28} scale={1.24} />
      <CypressCluster x={-29} z={-35} scale={1.18} />
      <CypressCluster x={29} z={-35} scale={1.18} />
    </group>
  );
}
