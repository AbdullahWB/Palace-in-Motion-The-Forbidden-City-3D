"use client";

// ── Color palette ───────────────────────────────────────────────────────────
const C = {
  // Roofing – glazed imperial yellow
  roofTile:    "#C27A14",
  roofTileLit: "#E09424",
  roofTileShd: "#A86510",
  roofRidge:   "#7A4E0C",
  roofEave:    "#B07018",
  // Walls – vermillion red
  wallRed:     "#8B1F26",
  wallRedLit:  "#A32830",
  wallDark:    "#651620",
  wallAccent:  "#5A1018",
  // Marble / stone
  marble:      "#EDE5CF",
  marbleMid:   "#DDD0B8",
  marbleDark:  "#C8B89A",
  // Ground
  ground:      "#C0AE88",
  paving:      "#D0BF9A",
  axisPave:    "#DDD0B0",
  // Water – jade-tinted
  water:       "#2E607C",
  waterLit:    "#3878A0",
  waterSheen:  "#4A90B8",
  // Nature
  trunk:       "#3C2A18",
  foliage:     "#244E20",
  foliage2:    "#2E5C28",
  foliage3:    "#3A6E34",
  foliage4:    "#447840",
  // Metal
  gold:        "#C49010",
  goldShine:   "#DEB040",
  bronze:      "#4A5E28",
  bronzeLit:   "#5E7632",
  // Column
  col:         "#721C22",
  // Stone
  stone:       "#8A7864",
  stoneDark:   "#6A5C4C",
  // Garden
  grass:       "#8A9C68",
};

type V3 = [number, number, number];

// ── Geometry helpers ────────────────────────────────────────────────────────
function Box({ p, s, c, r = 0.8, m = 0, rx = 0, ry = 0, rz = 0 }: {
  p: V3; s: V3; c: string; r?: number; m?: number; rx?: number; ry?: number; rz?: number;
}) {
  return (
    <mesh position={p} rotation={[rx, ry, rz]} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={r} metalness={m} />
    </mesh>
  );
}

function Cyl({ p, rt, rb, h, c, r = 0.82, m = 0, segs = 12 }: {
  p: V3; rt: number; rb: number; h: number; c: string; r?: number; m?: number; segs?: number;
}) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <cylinderGeometry args={[rt, rb, h, segs]} />
      <meshStandardMaterial color={c} roughness={r} metalness={m} />
    </mesh>
  );
}

function Sphere({ p, rad, c, r = 0.82, m = 0 }: { p: V3; rad: number; c: string; r?: number; m?: number }) {
  return (
    <mesh position={p} castShadow>
      <sphereGeometry args={[rad, 10, 10]} />
      <meshStandardMaterial color={c} roughness={r} metalness={m} />
    </mesh>
  );
}

function Cone({ p, rad, h, c, r = 0.5, m = 0, ry = 0, segs = 4 }: {
  p: V3; rad: number; h: number; c: string; r?: number; m?: number; ry?: number; segs?: number;
}) {
  return (
    <mesh position={p} rotation={[0, ry, 0]} castShadow>
      <coneGeometry args={[rad, h, segs]} />
      <meshStandardMaterial color={c} roughness={r} metalness={m} />
    </mesh>
  );
}

// ── Single-eave hip roof (庑殿顶) ──────────────────────────────────────────
// All children are relative to parent group origin; y = vertical offset
function HipRoof({ w, d, h, y, ov = 1.2 }: { w: number; d: number; h: number; y: number; ov?: number }) {
  const ew = w + ov * 2;
  const ed = d + ov * 2;

  const corners: V3[] = [
    [-ew * 0.48, 0.18, ed * 0.46],
    [ ew * 0.48, 0.18, ed * 0.46],
    [-ew * 0.48, 0.18,-ed * 0.46],
    [ ew * 0.48, 0.18,-ed * 0.46],
  ];

  return (
    <group position={[0, y, 0]}>
      {/* Eave plate */}
      <Box p={[0, 0, 0]} s={[ew, 0.24, ed]} c={C.roofTile} r={0.48} m={0.08} />
      {/* South slope (lit) */}
      <mesh position={[0, h * 0.42, ed * 0.28]} rotation={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[ew * 0.87, 0.14, h * 1.08]} />
        <meshStandardMaterial color={C.roofTileLit} roughness={0.42} metalness={0.1} />
      </mesh>
      {/* North slope */}
      <mesh position={[0, h * 0.42, -ed * 0.28]} rotation={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[ew * 0.87, 0.14, h * 1.08]} />
        <meshStandardMaterial color={C.roofTile} roughness={0.44} metalness={0.09} />
      </mesh>
      {/* West slope */}
      <mesh position={[-ew * 0.3, h * 0.42, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[h * 0.92, 0.14, ed * 0.64]} />
        <meshStandardMaterial color={C.roofEave} roughness={0.46} metalness={0.08} />
      </mesh>
      {/* East slope */}
      <mesh position={[ew * 0.3, h * 0.42, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[h * 0.92, 0.14, ed * 0.64]} />
        <meshStandardMaterial color={C.roofEave} roughness={0.46} metalness={0.08} />
      </mesh>
      {/* Ridge beam */}
      <Box p={[0, h * 0.86, 0]} s={[w * 0.46, 0.26, 0.36]} c={C.roofRidge} r={0.64} />
      {/* Ridge-end owl-tail ornaments (鸱吻) */}
      <Box p={[ w * 0.23, h * 0.94, 0]} s={[0.22, 0.48, 0.22]} c={C.roofRidge} r={0.6} />
      <Box p={[-w * 0.23, h * 0.94, 0]} s={[0.22, 0.48, 0.22]} c={C.roofRidge} r={0.6} />
      {/* Upturned corner finials */}
      {corners.map((cp, i) => (
        <Sphere key={i} p={cp} rad={0.21} c={C.roofTileLit} r={0.48} />
      ))}
    </group>
  );
}

// ── Double-eave hip roof (重檐庑殿顶) ─────────────────────────────────────
function DoubleHipRoof({ w, d, h, y, ov = 1.4 }: { w: number; d: number; h: number; y: number; ov?: number }) {
  const lh = h * 0.38;
  const band = h * 0.14;
  const uh = h * 0.62;
  const bandY = y + lh;
  const upperY = bandY + band;
  const bw = w + ov * 1.15;
  const bd = d + ov * 1.15;
  return (
    <>
      <HipRoof w={w} d={d} h={lh} y={y} ov={ov} />
      {/* Interstitial wall band */}
      <Box p={[0, bandY + band * 0.5, 0]} s={[bw, band, bd]} c={C.wallRed} r={0.6} />
      <HipRoof w={w * 0.77} d={d * 0.77} h={uh} y={upperY} ov={ov * 0.77} />
    </>
  );
}

// ── Pyramidal roof (攒尖顶) ─────────────────────────────────────────────────
function PyramidRoof({ w, d, h, y, ov = 1.1 }: { w: number; d: number; h: number; y: number; ov?: number }) {
  const ew = w + ov * 2;
  const ed = d + ov * 2;
  return (
    <group position={[0, y, 0]}>
      <Box p={[0, 0, 0]} s={[ew, 0.22, ed]} c={C.roofTile} r={0.48} m={0.08} />
      <Cone p={[0, h * 0.52, 0]} rad={Math.max(ew, ed) * 0.52} h={h} c={C.roofTileLit} r={0.43} m={0.1} ry={Math.PI / 4} />
      <Box p={[0, h * 1.07, 0]} s={[0.22, 0.4, 0.22]} c={C.roofRidge} r={0.5} />
      <Sphere p={[0, h * 1.28, 0]} rad={0.18} c={C.goldShine} r={0.22} m={0.8} />
    </group>
  );
}

// ── Marble balustrade terrace ───────────────────────────────────────────────
function Terrace({ p, w, d, h }: { p: V3; w: number; d: number; h: number }) {
  return (
    <group position={p}>
      <Box p={[0, 0, 0]} s={[w, h, d]} c={C.marble} r={0.76} />
      {/* Top balustrade rails */}
      <Box p={[0, h * 0.5 + 0.28, d * 0.5 - 0.13]} s={[w - 0.4, 0.14, 0.22]} c={C.marble} r={0.64} />
      <Box p={[0, h * 0.5 + 0.28, -(d * 0.5 - 0.13)]} s={[w - 0.4, 0.14, 0.22]} c={C.marble} r={0.64} />
      <Box p={[w * 0.5 - 0.13, h * 0.5 + 0.28, 0]} s={[0.22, 0.14, d - 0.4]} c={C.marble} r={0.64} />
      <Box p={[-(w * 0.5 - 0.13), h * 0.5 + 0.28, 0]} s={[0.22, 0.14, d - 0.4]} c={C.marble} r={0.64} />
    </group>
  );
}

// ── Three-tier marble Dragon Terrace (三台) ────────────────────────────────
function DragonTerrace({ bw, bd }: { bw: number; bd: number }) {
  return (
    <>
      {/* Three tiers */}
      <Terrace p={[0,  0.55, 0]} w={bw}      d={bd}      h={1.1} />
      <Terrace p={[0,  1.65, 0]} w={bw - 4.8} d={bd - 4.0} h={1.0} />
      <Terrace p={[0,  2.65, 0]} w={bw - 9.6} d={bd - 8.0} h={0.92} />
      {/* Central axial stairways */}
      <Box p={[0, 0.35, bd * 0.5 + 1.8]} s={[bw * 0.28, 0.7, 3.6]} c={C.marble} r={0.8} />
      <Box p={[0, 1.15, (bd - 4) * 0.5 + 1.4]} s={[(bw - 4.8) * 0.25, 0.6, 2.8]} c={C.marble} r={0.8} />
      <Box p={[0, 2.14, (bd - 8) * 0.5 + 1.1]} s={[(bw - 9.6) * 0.22, 0.5, 2.2]} c={C.marble} r={0.8} />
      {/* Side stairways tier 1 */}
      <Box p={[-bw * 0.36, 0.35, bd * 0.5 + 1.2]} s={[bw * 0.14, 0.7, 2.4]} c={C.marble} r={0.8} />
      <Box p={[ bw * 0.36, 0.35, bd * 0.5 + 1.2]} s={[bw * 0.14, 0.7, 2.4]} c={C.marble} r={0.8} />
    </>
  );
}

// ── Column colonnade ────────────────────────────────────────────────────────
function Cols({ n, tw, z, baseY, h }: { n: number; tw: number; z: number; baseY: number; h: number }) {
  const sp = tw / (n - 1);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <Cyl key={i}
          p={[-tw / 2 + i * sp, baseY + h * 0.5, z]}
          rt={0.19} rb={0.23} h={h} c={C.col} r={0.5} segs={14}
        />
      ))}
    </>
  );
}

// ── Stone lion (石狮) ───────────────────────────────────────────────────────
function Lion({ p, flip = false }: { p: V3; flip?: boolean }) {
  return (
    <group position={p} scale={[flip ? -1 : 1, 1, 1]}>
      <Box p={[0, 0.2, 0]} s={[0.72, 0.4, 1.0]} c={C.stoneDark} r={0.9} />
      <Box p={[0, 0.72, 0]} s={[0.54, 0.64, 0.72]} c={C.stone} r={0.86} />
      {/* Mane sphere */}
      <Sphere p={[0.04, 1.08, 0.12]} rad={0.32} c={C.stoneDark} r={0.9} />
      {/* Head */}
      <Sphere p={[0.06, 1.22, 0.3]} rad={0.26} c={C.stone} r={0.85} />
      {/* Paw */}
      <Box p={[0.18, 0.42, 0.44]} s={[0.2, 0.1, 0.26]} c={C.stone} r={0.88} />
    </group>
  );
}

// ── Huabiao ornamental pillar (华表) ───────────────────────────────────────
function Huabiao({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {/* Octagonal base */}
      <Box p={[0, 0.18, 0]} s={[0.64, 0.36, 0.64]} c={C.marble} r={0.7} />
      {/* Shaft */}
      <Cyl p={[0, 3.0, 0]} rt={0.11} rb={0.16} h={6.0} c={C.marble} r={0.58} segs={14} />
      {/* Cloud collar 1 */}
      <mesh position={[0, 4.0, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.16, 0.22, 10]} />
        <meshStandardMaterial color={C.marble} roughness={0.6} />
      </mesh>
      {/* Cloud collar 2 */}
      <mesh position={[0, 5.4, 0]} castShadow>
        <cylinderGeometry args={[0.54, 0.14, 0.22, 10]} />
        <meshStandardMaterial color={C.marble} roughness={0.6} />
      </mesh>
      {/* Top disc */}
      <Cyl p={[0, 5.9, 0]} rt={0.4} rb={0.4} h={0.22} c={C.marble} r={0.55} segs={10} />
      {/* Finial beast */}
      <Sphere p={[0, 6.2, 0]} rad={0.2} c={C.marbleMid} r={0.5} />
    </group>
  );
}

// ── Corner tower (角楼) ─────────────────────────────────────────────────────
function CornerTower({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {/* Marble base */}
      <Box p={[0, 0.38, 0]} s={[6.0, 0.76, 6.0]} c={C.marbleMid} r={0.8} />
      {/* Body tier 1 */}
      <Box p={[0, 1.72, 0]} s={[5.2, 2.3, 5.2]} c={C.wallRed} r={0.62} />
      <Box p={[0, 2.9, 0]} s={[6.4, 0.2, 6.4]} c={C.roofTile} r={0.46} m={0.1} />
      {/* Body tier 2 */}
      <Box p={[0, 3.66, 0]} s={[4.4, 1.52, 4.4]} c={C.wallRed} r={0.62} />
      <Box p={[0, 4.52, 0]} s={[5.4, 0.18, 5.4]} c={C.roofTile} r={0.46} m={0.1} />
      {/* Body tier 3 */}
      <Box p={[0, 5.32, 0]} s={[3.6, 1.4, 3.6]} c={C.wallRed} r={0.62} />
      <Box p={[0, 6.14, 0]} s={[4.4, 0.16, 4.4]} c={C.roofTile} r={0.46} m={0.1} />
      {/* Body tier 4 */}
      <Box p={[0, 7.02, 0]} s={[2.8, 1.24, 2.8]} c={C.wallRed} r={0.62} />
      <Box p={[0, 7.76, 0]} s={[3.6, 0.15, 3.6]} c={C.roofTile} r={0.46} m={0.1} />
      {/* Top pyramidal roof */}
      <Cone p={[0, 9.3, 0]} rad={2.0} h={3.4} c={C.roofTileLit} r={0.42} m={0.12} ry={Math.PI / 4} />
      {/* Gold finial */}
      <Sphere p={[0, 11.2, 0]} rad={0.24} c={C.goldShine} r={0.22} m={0.82} />
    </group>
  );
}

// ── Meridian Gate (午门) ────────────────────────────────────────────────────
function WuMen({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {/* Marble platform */}
      <Box p={[0, 0.58, 0]} s={[42, 1.16, 9.5]} c={C.marble} r={0.8} />
      {/* Main gate wall */}
      <Box p={[0, 5.2, 0]} s={[40, 8.9, 8.0]} c={C.wallRed} r={0.7} />
      {/* 5 gate apertures (darkened recesses) */}
      {([-13, -6.5, 0, 6.5, 13] as number[]).map((x, i) => (
        <Box key={i} p={[x, 3.4, 4.08]} s={[2.6, 5.2, 0.28]} c={C.wallDark} r={0.55} />
      ))}
      {/* Central gate tower body */}
      <Box p={[0, 12.8, 0]} s={[14.5, 5.8, 7.5]} c={C.wallRed} r={0.62} />
      <HipRoof w={14} d={8} h={5.0} y={15.8} ov={1.7} />
      {/* West arm wall */}
      <Box p={[-25, 5.0, -5.5]} s={[9, 8.8, 22]} c={C.wallRed} r={0.7} />
      {/* West arm tower */}
      <Box p={[-25, 12.6, -5.5]} s={[8, 4.0, 8]} c={C.wallRed} r={0.65} />
      <group position={[-25, 0, -5.5]}>
        <HipRoof w={8.5} d={9} h={3.8} y={14.6} ov={1.2} />
      </group>
      {/* East arm wall */}
      <Box p={[25, 5.0, -5.5]} s={[9, 8.8, 22]} c={C.wallRed} r={0.7} />
      {/* East arm tower */}
      <Box p={[25, 12.6, -5.5]} s={[8, 4.0, 8]} c={C.wallRed} r={0.65} />
      <group position={[25, 0, -5.5]}>
        <HipRoof w={8.5} d={9} h={3.8} y={14.6} ov={1.2} />
      </group>
    </group>
  );
}

// ── Golden Water River with 5 marble bridges (内金水河) ────────────────────
function GoldenWaterRiver({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {/* Water channel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 6.5]} />
        <meshStandardMaterial color={C.waterSheen} roughness={0.08} metalness={0.52} />
      </mesh>
      {/* 5 marble bridges */}
      {([-15, -7.5, 0, 7.5, 15] as number[]).map((x, i) => (
        <group key={i} position={[x, 0.38, 0]}>
          <Box p={[0, 0, 0]} s={[3.6, 0.76, 7.8]} c={C.marble} r={0.74} />
          <Box p={[-1.68, 0.48, 0]} s={[0.24, 0.32, 7.6]} c={C.marble} r={0.64} />
          <Box p={[ 1.68, 0.48, 0]} s={[0.24, 0.32, 7.6]} c={C.marble} r={0.64} />
          {/* Bridge lion heads at ends */}
          <Sphere p={[-1.68, 0.76, 3.6]} rad={0.18} c={C.marbleDark} r={0.7} />
          <Sphere p={[ 1.68, 0.76, 3.6]} rad={0.18} c={C.marbleDark} r={0.7} />
        </group>
      ))}
    </group>
  );
}

// ── Gate of Supreme Harmony (太和门) ──────────────────────────────────────
function TaiHeMen({ p }: { p: V3 }) {
  const w = 17; const d = 6.5; const bh = 5.0;
  return (
    <group position={p}>
      <Terrace p={[0, 0.48, 0]} w={w + 6} d={d + 5.5} h={0.96} />
      <Box p={[0, 0.96 + bh * 0.5, 0]} s={[w, bh, d]} c={C.wallRed} r={0.58} />
      {/* Facade wall */}
      <Box p={[0, 0.96 + bh * 0.42, d * 0.52]} s={[w + 0.4, bh * 0.82, 0.34]} c={C.wallDark} r={0.52} />
      {/* 3 gate apertures */}
      {([-5, 0, 5] as number[]).map((x, i) => (
        <Box key={i} p={[x, 0.96 + 2.1, d * 0.53]} s={[3.0, 4.0, 0.26]} c={C.wallAccent} r={0.55} />
      ))}
      <Cols n={8} tw={w * 0.9} z={d * 0.54} baseY={0.96} h={bh * 0.9} />
      <HipRoof w={w} d={d} h={4.2} y={0.96 + bh} ov={1.5} />
      <Lion p={[-w * 0.5 - 2.2, 0.96, d * 0.3]} />
      <Lion p={[ w * 0.5 + 2.2, 0.96, d * 0.3]} flip />
    </group>
  );
}

// ── Hall of Supreme Harmony (太和殿) ──────────────────────────────────────
function TaiHeDian({ p }: { p: V3 }) {
  const bw = 26; const bd = 11.5; const bh = 7.0; const tt = 3.9;
  return (
    <group position={p}>
      <DragonTerrace bw={bw + 11} bd={bd + 11} />
      {/* Main hall body */}
      <Box p={[0, tt + bh * 0.5, 0]} s={[bw, bh, bd]} c={C.wallRed} r={0.54} />
      {/* South facade wall */}
      <Box p={[0, tt + bh * 0.42, bd * 0.51]} s={[bw + 0.44, bh * 0.82, 0.38]} c={C.wallDark} r={0.52} />
      {/* Decorative gold trim band */}
      <Box p={[0, tt + bh * 0.12, 0]} s={[bw + 0.06, 0.3, bd + 0.06]} c={C.gold} r={0.38} m={0.28} />
      {/* Column colonnade */}
      <Cols n={12} tw={bw * 0.92} z={bd * 0.54} baseY={tt} h={bh * 0.88} />
      {/* Double-eave hip roof */}
      <DoubleHipRoof w={bw} d={bd} h={8.5} y={tt + bh} ov={2.0} />
    </group>
  );
}

// ── Bronze incense urn (铜鼎) ───────────────────────────────────────────────
function BronzeUrn({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Cyl p={[0, 0.24, 0]} rt={0.26} rb={0.3} h={0.48} c={C.bronze} r={0.42} m={0.28} segs={12} />
      <Cyl p={[0, 0.72, 0]} rt={0.42} rb={0.28} h={0.56} c={C.bronzeLit} r={0.38} m={0.3} segs={12} />
      <Cyl p={[0, 1.18, 0]} rt={0.32} rb={0.4} h={0.56} c={C.bronze} r={0.4} m={0.28} segs={12} />
      <Cyl p={[0, 1.56, 0]} rt={0.24} rb={0.3} h={0.3} c={C.bronze} r={0.36} m={0.3} segs={10} />
      {/* Smoke/spirit wisps */}
      <Sphere p={[0, 2.0, 0]} rad={0.14} c={"#D0C090"} r={0.9} />
    </group>
  );
}

// ── Hall of Middle Harmony (中和殿) – square pavilion ─────────────────────
function ZhongHeDian({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Terrace p={[0, 0.46, 0]} w={14} d={12} h={0.92} />
      <Box p={[0, 1.7, 0]} s={[9.0, 4.8, 9.0]} c={C.wallRed} r={0.56} />
      <Box p={[0, 1.7 + 4.8 * 0.42, 4.54]} s={[9.4, 4.8 * 0.82, 0.32]} c={C.wallDark} r={0.52} />
      <Cols n={6} tw={8.0} z={4.54} baseY={0.92} h={4.8} />
      <PyramidRoof w={11} d={11} h={5.2} y={6.5} ov={1.3} />
    </group>
  );
}

// ── Hall of Preserving Harmony (保和殿) ───────────────────────────────────
function BaoHeDian({ p }: { p: V3 }) {
  const bw = 21; const bd = 9.5; const bh = 6.2; const tt = 2.15;
  return (
    <group position={p}>
      <Terrace p={[0, 0.58, 0]} w={bw + 7.5} d={bd + 6.5} h={1.16} />
      <Terrace p={[0, 1.74, 0]} w={bw + 3.5} d={bd + 3.0} h={1.0} />
      <Box p={[0, tt + bh * 0.5, 0]} s={[bw, bh, bd]} c={C.wallRed} r={0.55} />
      <Box p={[0, tt + bh * 0.42, bd * 0.51]} s={[bw + 0.38, bh * 0.82, 0.34]} c={C.wallDark} r={0.52} />
      <Box p={[0, tt + bh * 0.12, 0]} s={[bw + 0.06, 0.26, bd + 0.06]} c={C.gold} r={0.4} m={0.24} />
      <Cols n={10} tw={bw * 0.92} z={bd * 0.54} baseY={tt} h={bh * 0.88} />
      <DoubleHipRoof w={bw} d={bd} h={7.5} y={tt + bh} ov={1.7} />
    </group>
  );
}

// ── Gate of Heavenly Purity (乾清门) ──────────────────────────────────────
function QianQingMen({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Terrace p={[0, 0.42, 0]} w={24} d={5.5} h={0.84} />
      <Box p={[0, 0.84 + 2.6, 0]} s={[24, 5.2, 5.2]} c={C.wallRed} r={0.62} />
      {([-7, 0, 7] as number[]).map((x, i) => (
        <Box key={i} p={[x, 0.84 + 2.4, 2.64]} s={[3.2, 4.5, 0.26]} c={C.wallDark} r={0.55} />
      ))}
      <HipRoof w={24} d={6} h={4.2} y={6.46} ov={1.35} />
      <Lion p={[-6, 0.84, 2.0]} />
      <Lion p={[ 6, 0.84, 2.0]} flip />
    </group>
  );
}

// ── Inner palace (乾清宫, 坤宁宫, etc.) ───────────────────────────────────
function InnerPalace({ p, w, d, bh, rh }: { p: V3; w: number; d: number; bh: number; rh: number }) {
  const tt = 0.96;
  return (
    <group position={p}>
      <Terrace p={[0, 0.48, 0]} w={w + 4.5} d={d + 4} h={0.96} />
      <Box p={[0, tt + bh * 0.5, 0]} s={[w, bh, d]} c={C.wallRed} r={0.57} />
      <Box p={[0, tt + bh * 0.42, d * 0.51]} s={[w + 0.34, bh * 0.82, 0.32]} c={C.wallDark} r={0.52} />
      <Cols n={8} tw={w * 0.9} z={d * 0.54} baseY={tt} h={bh * 0.88} />
      <DoubleHipRoof w={w} d={d} h={rh} y={tt + bh} ov={1.45} />
    </group>
  );
}

// ── Imperial Garden pavilion (御花园) ──────────────────────────────────────
function ImperialGarden({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {/* Garden lawn */}
      <Box p={[0, 0.07, 0]} s={[34, 0.14, 22]} c={C.grass} r={0.98} />
      {/* Central pavilion */}
      <Terrace p={[0, 0.42, 0]} w={7.5} d={7.5} h={0.84} />
      <Box p={[0, 1.56, 0]} s={[6.0, 2.4, 6.0]} c={C.wallRed} r={0.6} />
      <PyramidRoof w={7.0} d={7.0} h={4.5} y={2.96} ov={1.25} />
      {/* Side planters */}
      {([-11, 11] as number[]).map((x, i) => (
        <group key={i} position={[x, 0.14, 0]}>
          <Box p={[0, 0.3, 0]} s={[3.2, 0.6, 3.2]} c={C.marbleDark} r={0.82} />
          <Sphere p={[0, 0.9, 0]} rad={1.1} c={C.foliage4} r={0.98} />
        </group>
      ))}
    </group>
  );
}

// ── Side pavilion ───────────────────────────────────────────────────────────
function SidePavilion({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Terrace p={[0, 0.32, 0]} w={7.0} d={5.8} h={0.64} />
      <Box p={[0, 1.64, 0]} s={[6.2, 2.6, 5.0]} c={C.wallRed} r={0.6} />
      <HipRoof w={6.5} d={5.4} h={2.9} y={2.94} ov={1.05} />
    </group>
  );
}

// ── Long corridor wall (廊庑) ───────────────────────────────────────────────
function CorridorWall({ p, w }: { p: V3; w: number }) {
  return (
    <group position={p}>
      <Box p={[0, 1.1, 0]} s={[w, 2.2, 0.8]} c={C.wallRed} r={0.65} />
      <HipRoof w={w} d={1.0} h={1.6} y={2.2} ov={0.7} />
    </group>
  );
}

// ── Cypress tree ────────────────────────────────────────────────────────────
function Cypress({ p, s = 1.0 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 2.1, 0]} rt={0.17} rb={0.25} h={4.2} c={C.trunk} r={0.96} segs={10} />
      <Cone p={[0, 6.0, 0]} rad={1.1} h={5.6} c={C.foliage} r={0.98} segs={8} />
      <Cone p={[0, 3.9, 0]} rad={1.5} h={2.3} c={C.foliage2} r={0.97} segs={8} />
      <Sphere p={[0.44, 5.5, 0.3]} rad={0.7} c={C.foliage3} r={0.96} />
      <Sphere p={[-0.38, 5.2, -0.24]} rad={0.6} c={C.foliage4} r={0.97} />
    </group>
  );
}

// ── Pine tree ───────────────────────────────────────────────────────────────
function Pine({ p, s = 1.0 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 2.8, 0]} rt={0.22} rb={0.34} h={5.6} c={C.trunk} r={0.95} segs={8} />
      {([2.4, 4.7, 6.6] as number[]).map((y, i) => (
        <Cone key={i} p={[0, y, 0]} rad={2.4 - i * 0.6} h={2.2} c={[C.foliage2, C.foliage, C.foliage3][i]} r={0.97} segs={8} />
      ))}
    </group>
  );
}

// ── Moat (护城河) ───────────────────────────────────────────────────────────
function Moat() {
  return (
    <mesh position={[0, -0.1, -12]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[130, 148]} />
      <meshStandardMaterial color={C.waterLit} roughness={0.07} metalness={0.55} />
    </mesh>
  );
}

// ── Ground ──────────────────────────────────────────────────────────────────
function Ground() {
  return (
    <group>
      {/* Inner courtyard paving */}
      <mesh position={[0, 0, -12]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[88, 116]} />
        <meshStandardMaterial color={C.paving} roughness={0.96} />
      </mesh>
      {/* Central axial path */}
      <Box p={[0, 0.07, -10]} s={[9.5, 0.14, 106]} c={C.axisPave} r={0.93} />
      <Box p={[0, 0.11, -10]} s={[2.4, 0.06, 104]} c={C.marbleDark} r={0.87} />
      {/* Outer ground */}
      <mesh position={[0, -0.04, -12]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={C.ground} roughness={0.98} />
      </mesh>
    </group>
  );
}

// ── Outer walls with battlements ────────────────────────────────────────────
function OuterWalls() {
  const wh = 5.2; const wt = 2.3; const wx = 41; const wz = 56; const cz = -12;
  return (
    <group>
      <Box p={[0, wh * 0.5, cz + wz]} s={[wx * 2, wh, wt]} c={C.wallRed} r={0.72} />
      <Box p={[0, wh * 0.5, cz - wz]} s={[wx * 2, wh, wt]} c={C.wallRed} r={0.72} />
      <Box p={[-wx, wh * 0.5, cz]} s={[wt, wh, wz * 2]} c={C.wallRed} r={0.72} />
      <Box p={[wx, wh * 0.5, cz]} s={[wt, wh, wz * 2]} c={C.wallRed} r={0.72} />
      {/* Parapet walkway */}
      <Box p={[0, wh + 0.2, cz + wz]} s={[wx * 2, 0.4, wt * 1.3]} c={C.marbleDark} r={0.8} />
      {/* Battlement crenels – south wall */}
      {Array.from({ length: 16 }).map((_, i) => (
        <Box key={i} p={[-wx + 4 + i * 5, wh + 0.9, cz + wz]} s={[2.2, 1.0, wt * 0.8]} c={C.wallRedLit} r={0.7} />
      ))}
      {/* Corner towers */}
      <CornerTower p={[-wx, wh, cz + wz]} />
      <CornerTower p={[ wx, wh, cz + wz]} />
      <CornerTower p={[-wx, wh, cz - wz]} />
      <CornerTower p={[ wx, wh, cz - wz]} />
    </group>
  );
}

// ── Main scene export ────────────────────────────────────────────────────────
export function ForbiddenCityPlaceholderScene() {
  return (
    <group position={[0, 0, 10]}>
      <Moat />
      <Ground />
      <OuterWalls />

      {/* Meridian Gate (午门) */}
      <WuMen p={[0, 0, 44]} />

      {/* Huabiao pillars flanking the approach */}
      <Huabiao p={[-7.5, 0, 34]} />
      <Huabiao p={[ 7.5, 0, 34]} />

      {/* Inner Golden Water River (内金水河) */}
      <GoldenWaterRiver p={[0, 0.12, 25]} />

      {/* Gate of Supreme Harmony (太和门) */}
      <TaiHeMen p={[0, 0, 16]} />

      {/* Huabiao at Tai He Men */}
      <Huabiao p={[-12, 0, 12]} />
      <Huabiao p={[ 12, 0, 12]} />

      {/* ── Hall of Supreme Harmony (太和殿) – the centrepiece */}
      <TaiHeDian p={[0, 0, 1]} />

      {/* Bronze urns on the Dragon Terrace */}
      {([-10, -5, 5, 10] as number[]).map((x, i) => (
        <BronzeUrn key={i} p={[x, 3.9, 7.5]} />
      ))}
      {/* Side urns */}
      <BronzeUrn p={[-14, 0, 4]} />
      <BronzeUrn p={[ 14, 0, 4]} />

      {/* Stone lions at the outer approach */}
      <Lion p={[-5.5, 0.12, 30]} />
      <Lion p={[ 5.5, 0.12, 30]} flip />

      {/* Hall of Middle Harmony (中和殿) */}
      <ZhongHeDian p={[0, 0, -15]} />

      {/* Hall of Preserving Harmony (保和殿) */}
      <BaoHeDian p={[0, 0, -29]} />

      {/* Gate of Heavenly Purity (乾清门) */}
      <QianQingMen p={[0, 0, -40]} />

      {/* Palace of Heavenly Purity (乾清宫) */}
      <InnerPalace p={[0, 0, -49]} w={16} d={8.5} bh={5.2} rh={5.8} />

      {/* Hall of Union (交泰殿) – square pavilion */}
      <group position={[0, 0, -59]}>
        <Terrace p={[0, 0.44, 0]} w={11} d={9} h={0.88} />
        <Box p={[0, 1.62, 0]} s={[7.5, 4.0, 7.5]} c={C.wallRed} r={0.57} />
        <PyramidRoof w={9} d={9} h={4.2} y={5.62} ov={1.15} />
      </group>

      {/* Palace of Earthly Tranquility (坤宁宫) */}
      <InnerPalace p={[0, 0, -67]} w={14} d={7.5} bh={4.6} rh={5.0} />

      {/* Imperial Garden (御花园) */}
      <ImperialGarden p={[0, 0, -77]} />

      {/* Side hall corridors (廊庑) – east and west */}
      {([-22, 22] as number[]).map((x, i) => (
        <CorridorWall key={i} p={[x, 0, -20]} w={8} z={0} />
      ))}

      {/* Side pavilions flanking main halls */}
      {([
        [-25, 0,  16], [25, 0,  16],
        [-25, 0,   1], [25, 0,   1],
        [-25, 0, -15], [25, 0, -15],
        [-25, 0, -29], [25, 0, -29],
        [-22, 0, -49], [22, 0, -49],
      ] as V3[]).map((pp, i) => (
        <SidePavilion key={i} p={pp} />
      ))}

      {/* Cypress rows lining the axial courts */}
      {([-38, -32, -26, -20, -14, -7] as number[]).map((z) =>
        ([-16, 16] as number[]).map((x) => (
          <Cypress key={`${x}${z}`} p={[x, 0, z]} s={0.92 + Math.abs(z) * 0.003} />
        ))
      )}
      {/* Cypresses flanking southern approach */}
      {([30, 36] as number[]).map((z) =>
        ([-9, 9] as number[]).map((x) => (
          <Cypress key={`s${x}${z}`} p={[x, 0, z]} s={1.08} />
        ))
      )}
      {/* Pine trees in the imperial garden zone */}
      {([-15, 15, -24, 24] as number[]).map((x, i) => (
        <Pine key={`pine${i}`} p={[x, 0, -74]} s={0.82} />
      ))}
      {([-10, 10] as number[]).map((x, i) => (
        <Pine key={`pine2-${i}`} p={[x, 0, -80]} s={0.9} />
      ))}
    </group>
  );
}
