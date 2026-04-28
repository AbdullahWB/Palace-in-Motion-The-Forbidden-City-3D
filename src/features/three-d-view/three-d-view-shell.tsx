"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ContactShadows,
  Html,
  Line,
  OrbitControls,
  PerspectiveCamera,
  Sky,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { LanguageToggleButton } from "@/components/preferences/language-toggle-button";
import { MusicToggleButton } from "@/components/media/music-toggle-button";
import { ThemeToggleButton } from "@/components/preferences/theme-toggle-button";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { ForbiddenCityPlaceholderScene } from "@/features/three-d-view/forbidden-city-placeholder-scene";
import { pickLocalizedText } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type { ExploreJourneyRouteId } from "@/types/content";
import type {
  ThreeDCameraView,
  ThreeDHotspot,
  ThreeDLayerId,
  ThreeDLightingMode,
  ThreeDQualityMode,
  ThreeDRouteOverlay,
  ThreeDSeasonMode,
  ThreeDViewerConfig,
} from "@/features/three-d-view/viewer-config";

type ThreeDViewShellProps = {
  config: ThreeDViewerConfig;
  hasModelAsset: boolean;
};

type ViewerSceneProps = {
  config: ThreeDViewerConfig;
  cameraView: ThreeDCameraView;
  hasModelAsset: boolean;
  enabledLayerIds: ThreeDLayerId[];
  activeRouteId: ExploreJourneyRouteId | null;
  selectedHotspotId: string | null;
  lightingMode: ThreeDLightingMode;
  seasonMode: ThreeDSeasonMode;
  qualityMode: ThreeDQualityMode;
  onSelectHotspot: (hotspot: ThreeDHotspot) => void;
};

const shellCopy = {
  zh: {
    eyebrow: "三维模型导览",
    readyLabel: "真实模型已连接",
    fallbackLabel: "程序化占位模型",
    orbitHint: "可拖动旋转，也可用按钮切换视角",
    resetView: "重置视角",
    backHome: "返回首页",
    modelAsset: "模型资产",
    controls: "导览控制",
    routes: "路线叠加",
    flythrough: "开始路线飞行",
    nextStop: "下一站",
    layers: "信息图层",
    lighting: "光照",
    season: "季节",
    quality: "质量",
    webxr: "VR / AR",
    webxrReady: "当前浏览器检测到 WebXR。接入真实模型后可连接 XR 会话。",
    webxrUnavailable: "VR/AR 需要 HTTPS、兼容设备和 WebXR 会话；当前提供界面与能力检测。",
    annotation: "热点说明",
    openPlace: "打开地点",
    askCompanion: "询问 Companion",
    noHotspot: "选择一个屋顶、门、院落或路线热点查看说明。",
    challenge: "3D 挑战",
    completeChallenge: "完成挑战并盖章",
    challengeDone: "已解锁 3D 探索印章",
    sourceLabel: "Based on Palace Guide Source",
    minimap: "方向与比例",
    north: "北",
    scale: "示意比例 100m",
  },
  en: {
    eyebrow: "3D model guide",
    readyLabel: "Real model connected",
    fallbackLabel: "Procedural placeholder",
    orbitHint: "Drag to orbit, or use buttons for camera moves",
    resetView: "Reset view",
    backHome: "Back home",
    modelAsset: "Model asset",
    controls: "Guide controls",
    routes: "Route overlays",
    flythrough: "Start route fly-through",
    nextStop: "Next stop",
    layers: "Information layers",
    lighting: "Lighting",
    season: "Season",
    quality: "Quality",
    webxr: "VR / AR",
    webxrReady: "This browser exposes WebXR. Connect an XR session after the final model asset is installed.",
    webxrUnavailable: "VR/AR needs HTTPS, a compatible device, and a WebXR session; this release includes the UI and capability check.",
    annotation: "Hotspot annotation",
    openPlace: "Open place",
    askCompanion: "Ask Companion",
    noHotspot: "Select a roof, gate, courtyard, or route hotspot to read the annotation.",
    challenge: "3D challenge",
    completeChallenge: "Complete challenge and stamp",
    challengeDone: "3D exploration stamp unlocked",
    sourceLabel: "Based on Palace Guide Source",
    minimap: "Orientation and scale",
    north: "N",
    scale: "Illustrative 100m scale",
  },
} as const;

const lightingSettings: Record<
  ThreeDLightingMode,
  {
    background: string;
    fog: string;
    sun: [number, number, number];
    hemisphere: number;
    ambient: number;
    directional: number;
    fill: number;
    skyRayleigh: number;
    skyTurbidity: number;
  }
> = {
  morning: {
    background: "#d9e7ef",
    fog: "#dfe8ed",
    sun: [8, 4.2, 4],
    hemisphere: 1.1,
    ambient: 0.36,
    directional: 1.85,
    fill: 0.5,
    skyRayleigh: 1.6,
    skyTurbidity: 5.4,
  },
  noon: {
    background: "#d6e1e8",
    fog: "#dfe5ea",
    sun: [5, 9, 3],
    hemisphere: 1.24,
    ambient: 0.42,
    directional: 2.2,
    fill: 0.46,
    skyRayleigh: 1.15,
    skyTurbidity: 4.6,
  },
  sunset: {
    background: "#f1d0a8",
    fog: "#e2c0a0",
    sun: [20, 5, 10],
    hemisphere: 0.94,
    ambient: 0.26,
    directional: 2.3,
    fill: 0.72,
    skyRayleigh: 2.1,
    skyTurbidity: 8.4,
  },
  night: {
    background: "#07101d",
    fog: "#101726",
    sun: [-8, 1.8, -2],
    hemisphere: 0.34,
    ambient: 0.18,
    directional: 0.34,
    fill: 0.18,
    skyRayleigh: 0.38,
    skyTurbidity: 2.4,
  },
};

function RealModelLayer({ src }: { src: string }) {
  const { scene } = useGLTF(src);

  useEffect(() => {
    scene.traverse((child) => {
      const shadowTarget = child as {
        castShadow?: boolean;
        receiveShadow?: boolean;
      };

      if ("castShadow" in shadowTarget) {
        shadowTarget.castShadow = true;
      }

      if ("receiveShadow" in shadowTarget) {
        shadowTarget.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

function SceneLighting({
  lightingMode,
  seasonMode,
  qualityMode,
}: {
  lightingMode: ThreeDLightingMode;
  seasonMode: ThreeDSeasonMode;
  qualityMode: ThreeDQualityMode;
}) {
  const settings = lightingSettings[lightingMode];
  const shadowMapSize = qualityMode === "high" ? 2048 : qualityMode === "medium" ? 1024 : 512;
  const isWinter = seasonMode === "winter";

  return (
    <>
      <color attach="background" args={[isWinter ? "#dce6ea" : settings.background]} />
      <fog attach="fog" args={[isWinter ? "#e8edf0" : settings.fog, 34, 132]} />
      <Sky
        distance={450000}
        sunPosition={settings.sun}
        inclination={lightingMode === "night" ? 0.56 : 0.46}
        azimuth={lightingMode === "sunset" ? 0.12 : 0.18}
        turbidity={settings.skyTurbidity}
        rayleigh={settings.skyRayleigh}
      />
      <hemisphereLight
        intensity={settings.hemisphere}
        color={isWinter ? "#eef8ff" : "#f8edd5"}
        groundColor={isWinter ? "#b9c3c2" : "#71573b"}
      />
      <ambientLight intensity={settings.ambient} />
      <directionalLight
        castShadow={qualityMode !== "low"}
        position={[28, 36, 20]}
        intensity={settings.directional}
        color={lightingMode === "night" ? "#9eb6ff" : "#fff1cc"}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-52}
        shadow-camera-right={52}
        shadow-camera-top={52}
        shadow-camera-bottom={-52}
      />
      <directionalLight
        position={[-20, 16, -12]}
        intensity={settings.fill}
        color={lightingMode === "sunset" ? "#d68642" : "#c88944"}
      />
      <directionalLight
        position={[0, 20, -30]}
        intensity={lightingMode === "night" ? 0.4 : 0.24}
        color={lightingMode === "night" ? "#8fa8ff" : "#98b8d8"}
      />
      {lightingMode === "night" ? (
        <>
          <pointLight position={[0, 7, 1]} intensity={2.2} color="#f2c36d" distance={34} />
          <pointLight position={[0, 5, -44]} intensity={1.4} color="#e6b968" distance={30} />
        </>
      ) : null}
    </>
  );
}

function RouteOverlayLayer({
  route,
  isActive,
  qualityMode,
}: {
  route: ThreeDRouteOverlay;
  isActive: boolean;
  qualityMode: ThreeDQualityMode;
}) {
  return (
    <group>
      <Line
        points={route.points}
        color={route.color}
        lineWidth={isActive ? (qualityMode === "low" ? 4 : 7) : 3}
        transparent
        opacity={isActive ? 0.96 : 0.38}
      />
      {route.points.map((point, index) => (
        <mesh key={`${route.id}-${index}`} position={point}>
          <sphereGeometry args={[isActive ? 0.56 : 0.34, 18, 18]} />
          <meshStandardMaterial
            color={route.color}
            emissive={route.color}
            emissiveIntensity={isActive ? 0.18 : 0.05}
            transparent
            opacity={isActive ? 0.95 : 0.48}
          />
        </mesh>
      ))}
    </group>
  );
}

function InformationLayerVisuals({
  enabledLayerIds,
  seasonMode,
}: {
  enabledLayerIds: ThreeDLayerId[];
  seasonMode: ThreeDSeasonMode;
}) {
  const showHierarchy = enabledLayerIds.includes("hierarchy");
  const showDefense = enabledLayerIds.includes("defense");
  const showCourtyardReveal = enabledLayerIds.includes("courtyard-reveal");
  const showMeasure = enabledLayerIds.includes("measure");

  return (
    <group>
      {showHierarchy ? (
        <>
          <Line
            points={[
              [-18, 0.62, 14],
              [18, 0.62, 14],
              [18, 0.62, -33],
              [-18, 0.62, -33],
              [-18, 0.62, 14],
            ]}
            color="#f8d27b"
            lineWidth={4}
            transparent
            opacity={0.9}
          />
          <Line
            points={[
              [0, 0.82, 55],
              [0, 0.82, -79],
            ]}
            color="#fff2b7"
            lineWidth={3}
            transparent
            opacity={0.72}
          />
          <Html position={[12, 7, 5]} center>
            <span className="rounded-full border border-[#f8d27b]/40 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffe2a3] backdrop-blur-md">
              Roof and plinth hierarchy
            </span>
          </Html>
        </>
      ) : null}

      {showDefense ? (
        <>
          <Line
            points={[
              [-42, 0.72, 60],
              [42, 0.72, 60],
              [42, 0.72, -84],
              [-42, 0.72, -84],
              [-42, 0.72, 60],
            ]}
            color="#9fb6c4"
            lineWidth={4}
            transparent
            opacity={0.78}
          />
          <Html position={[36, 8, 50]} center>
            <span className="rounded-full border border-slate-200/40 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-100 backdrop-blur-md">
              Defensive wall frame
            </span>
          </Html>
        </>
      ) : null}

      {showCourtyardReveal ? (
        <>
          {[
            [0, 0.11, 25, 30, 28],
            [0, 0.12, -10, 28, 32],
            [0, 0.13, -52, 34, 28],
            [0, 0.14, -74, 30, 14],
          ].map(([x, y, z, width, height], index) => (
            <mesh key={`court-${index}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[width, height]} />
              <meshBasicMaterial
                color={seasonMode === "winter" ? "#e8eef0" : "#f2d8a4"}
                transparent
                opacity={0.18}
                depthWrite={false}
              />
            </mesh>
          ))}
        </>
      ) : null}

      {showMeasure ? (
        <>
          <Line
            points={[
              [-35, 0.75, 66],
              [-15, 0.75, 66],
            ]}
            color="#ffffff"
            lineWidth={5}
          />
          <Line
            points={[
              [-35, 0.75, 66],
              [-35, 2.1, 66],
            ]}
            color="#ffffff"
            lineWidth={3}
          />
          <Line
            points={[
              [-15, 0.75, 66],
              [-15, 2.1, 66],
            ]}
            color="#ffffff"
            lineWidth={3}
          />
          <Html position={[-25, 2.8, 66]} center>
            <span className="rounded-full border border-white/30 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              100m scale
            </span>
          </Html>
        </>
      ) : null}
    </group>
  );
}

function HotspotLayer({
  hotspots,
  selectedHotspotId,
  activeRouteId,
  onSelectHotspot,
}: {
  hotspots: ThreeDHotspot[];
  selectedHotspotId: string | null;
  activeRouteId: ExploreJourneyRouteId | null;
  onSelectHotspot: (hotspot: ThreeDHotspot) => void;
}) {
  const { language } = useSitePreferences();

  return (
    <group>
      {hotspots.map((hotspot) => {
        const isSelected = hotspot.id === selectedHotspotId;
        const isRouteActive = !activeRouteId || activeRouteId === hotspot.routeId;

        return (
          <Html
            key={hotspot.id}
            position={hotspot.position}
            center
            distanceFactor={22}
            style={{ pointerEvents: "auto" }}
          >
            <button
              type="button"
              onClick={() => onSelectHotspot(hotspot)}
              className={cn(
                "group flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] shadow-[0_10px_34px_rgba(0,0,0,0.22)] outline-none transition focus-visible:ring-2 focus-visible:ring-[#f7cf7c]",
                isSelected
                  ? "border-[#f7cf7c]/70 bg-[#f7cf7c] text-black"
                  : "border-white/24 bg-black/58 text-white backdrop-blur-md hover:bg-black/75",
                isRouteActive ? "opacity-100" : "opacity-40"
              )}
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  isSelected ? "bg-black" : "bg-[#f7cf7c]"
                )}
              />
              <span className="max-w-36 truncate">
                {pickLocalizedText(hotspot.label, language)}
              </span>
            </button>
          </Html>
        );
      })}
    </group>
  );
}

function ViewerScene({
  config,
  cameraView,
  hasModelAsset,
  enabledLayerIds,
  activeRouteId,
  selectedHotspotId,
  lightingMode,
  seasonMode,
  qualityMode,
  onSelectHotspot,
}: ViewerSceneProps) {
  const routesToRender = enabledLayerIds.includes("routes")
    ? activeRouteId
      ? config.routeOverlays.filter((route) => route.id === activeRouteId)
      : config.routeOverlays
    : [];

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={cameraView.position}
        fov={cameraView.fov}
      />
      <SceneLighting
        lightingMode={lightingMode}
        seasonMode={seasonMode}
        qualityMode={qualityMode}
      />

      {hasModelAsset && config.modelSrc ? (
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <RealModelLayer src={config.modelSrc} />
          </group>
        </Suspense>
      ) : (
        <ForbiddenCityPlaceholderScene />
      )}

      {routesToRender.map((route) => (
        <RouteOverlayLayer
          key={route.id}
          route={route}
          isActive={route.id === activeRouteId}
          qualityMode={qualityMode}
        />
      ))}

      <InformationLayerVisuals
        enabledLayerIds={enabledLayerIds}
        seasonMode={seasonMode}
      />

      {enabledLayerIds.includes("hotspots") ? (
        <HotspotLayer
          hotspots={config.hotspots}
          selectedHotspotId={selectedHotspotId}
          activeRouteId={activeRouteId}
          onSelectHotspot={onSelectHotspot}
        />
      ) : null}

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={qualityMode === "low" ? 0.18 : 0.28}
        scale={118}
        blur={qualityMode === "high" ? 3.2 : 2.2}
        far={40}
        color={seasonMode === "winter" ? "#41545a" : "#3a2010"}
      />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.07}
        enablePan={false}
        minDistance={config.orbitLimits.minDistance}
        maxDistance={config.orbitLimits.maxDistance}
        minPolarAngle={config.orbitLimits.minPolarAngle}
        maxPolarAngle={config.orbitLimits.maxPolarAngle}
        target={cameraView.target}
      />
    </>
  );
}

function PillButton({
  children,
  isActive,
  onClick,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={cn(
        "rounded-full border px-3 py-2 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#f7cf7c]",
        isActive
          ? "border-[#f7cf7c]/60 bg-[#f7cf7c] text-black"
          : "border-white/12 bg-white/8 text-white/78 hover:bg-white/14",
        className
      )}
    >
      {children}
    </button>
  );
}

function ControlGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f1c76f]">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function ThreeDViewShell({
  config,
  hasModelAsset,
}: ThreeDViewShellProps) {
  const { language, theme } = useSitePreferences();
  const markExplorePlaceVisited = useAppStore((state) => state.markExplorePlaceVisited);
  const answerPassportMission = useAppStore((state) => state.answerPassportMission);
  const [viewerVersion, setViewerVersion] = useState(0);
  const [activeCameraId, setActiveCameraId] = useState(config.initialCamera.id);
  const [activeRouteId, setActiveRouteId] =
    useState<ExploreJourneyRouteId | null>("ceremonial-axis");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(
    config.hotspots[1]?.id ?? null
  );
  const [routeStopIndex, setRouteStopIndex] = useState(0);
  const [enabledLayerIds, setEnabledLayerIds] = useState<ThreeDLayerId[]>([
    "routes",
    "hotspots",
    "measure",
  ]);
  const [lightingMode, setLightingMode] =
    useState<ThreeDLightingMode>("sunset");
  const [seasonMode, setSeasonMode] = useState<ThreeDSeasonMode>("summer");
  const [qualityMode, setQualityMode] = useState<ThreeDQualityMode>("medium");
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [hasWebXr] = useState(
    () =>
      typeof navigator !== "undefined" &&
      Boolean((navigator as Navigator & { xr?: unknown }).xr)
  );
  const isDarkTheme = theme === "dark";
  const copy = shellCopy[language];
  const localizedTitle = pickLocalizedText(config.title, language);
  const localizedSubtitle = pickLocalizedText(config.subtitle, language);
  const localizedDescription = pickLocalizedText(config.description, language);
  const cameraView =
    config.cameraPresets.find((preset) => preset.id === activeCameraId) ??
    config.initialCamera;
  const selectedHotspot = useMemo(
    () => config.hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ?? null,
    [config.hotspots, selectedHotspotId]
  );
  const activeRoute = useMemo(
    () => config.routeOverlays.find((route) => route.id === activeRouteId) ?? null,
    [activeRouteId, config.routeOverlays]
  );
  const canvasDpr: [number, number] =
    qualityMode === "low"
      ? [0.75, 1]
      : qualityMode === "high"
        ? [1, 2]
        : [1, 1.5];

  function selectHotspot(hotspot: ThreeDHotspot) {
    setSelectedHotspotId(hotspot.id);
    setActiveRouteId(hotspot.routeId);
    setActiveCameraId(hotspot.cameraPresetId);
    const route = config.routeOverlays.find(
      (candidate) => candidate.id === hotspot.routeId
    );
    const stopIndex = route?.stopHotspotIds.indexOf(hotspot.id) ?? -1;

    if (stopIndex >= 0) {
      setRouteStopIndex(stopIndex);
    }
  }

  function startRouteFlythrough(route: ThreeDRouteOverlay) {
    const firstHotspot = config.hotspots.find(
      (hotspot) => hotspot.id === route.stopHotspotIds[0]
    );

    setActiveRouteId(route.id);
    setActiveCameraId(route.cameraPresetId);
    setRouteStopIndex(0);

    if (firstHotspot) {
      setSelectedHotspotId(firstHotspot.id);
      setActiveCameraId(firstHotspot.cameraPresetId);
    }
  }

  function moveToNextStop() {
    if (!activeRoute) {
      return;
    }

    const nextIndex = (routeStopIndex + 1) % activeRoute.stopHotspotIds.length;
    const nextHotspot = config.hotspots.find(
      (hotspot) => hotspot.id === activeRoute.stopHotspotIds[nextIndex]
    );

    setRouteStopIndex(nextIndex);

    if (nextHotspot) {
      selectHotspot(nextHotspot);
    }
  }

  function toggleLayer(layerId: ThreeDLayerId) {
    setEnabledLayerIds((currentLayerIds) =>
      currentLayerIds.includes(layerId)
        ? currentLayerIds.filter((currentLayerId) => currentLayerId !== layerId)
        : [...currentLayerIds, layerId]
    );
  }

  function completeChallenge() {
    const rewardHotspot = selectedHotspot ?? config.hotspots[1];

    if (!rewardHotspot) {
      return;
    }

    markExplorePlaceVisited(rewardHotspot.placeSlug);
    answerPassportMission(rewardHotspot.placeSlug, true);
    setChallengeComplete(true);
  }

  return (
    <section
      className={cn(
        "relative h-[100svh] overflow-hidden",
        isDarkTheme ? "bg-[#04070d] text-white" : "bg-[#f0e6d5] text-foreground"
      )}
    >
      <div className="absolute inset-0">
        <Canvas
          key={`${viewerVersion}:${cameraView.id}:${qualityMode}`}
          aria-label={localizedTitle}
          dpr={canvasDpr}
          shadows={qualityMode !== "low"}
          gl={{ antialias: qualityMode !== "low", powerPreference: "high-performance" }}
          performance={{ min: qualityMode === "low" ? 0.6 : 0.8 }}
        >
          <ViewerScene
            config={config}
            cameraView={cameraView}
            hasModelAsset={hasModelAsset}
            enabledLayerIds={enabledLayerIds}
            activeRouteId={activeRouteId}
            selectedHotspotId={selectedHotspotId}
            lightingMode={lightingMode}
            seasonMode={seasonMode}
            qualityMode={qualityMode}
            onSelectHotspot={selectHotspot}
          />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(249,214,155,0.22),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(95,138,189,0.2),transparent_28%),linear-gradient(180deg,rgba(3,7,12,0.08),rgba(3,7,12,0.18)_40%,rgba(3,7,12,0.52)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(180deg,rgba(4,7,13,0),rgba(4,7,13,0.72))]" />

      <div className="absolute left-3 top-3 z-20 w-[min(28rem,calc(100vw-1.5rem))] pointer-events-auto sm:left-4 sm:top-4 md:left-6 md:top-6">
        <div
          className={cn(
            "max-h-[50svh] overflow-y-auto rounded-[1.5rem] border p-4 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:rounded-[1.9rem] sm:p-5",
            isDarkTheme
              ? "border-white/12 bg-[rgba(7,10,16,0.66)] text-white"
              : "border-white/55 bg-[rgba(255,248,238,0.84)] text-foreground"
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
                isDarkTheme
                  ? "border-[#d5b27a]/26 bg-[#d5b27a]/14 text-[#f3dcb3]"
                  : "border-accent/18 bg-accent/8 text-accent-soft"
              )}
            >
              {copy.eyebrow}
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
                hasModelAsset
                  ? "border-emerald-400/28 bg-emerald-400/12 text-emerald-200"
                  : "border-[#d5b27a]/26 bg-[#d5b27a]/14 text-[#f3dcb3]"
              )}
            >
              {hasModelAsset ? copy.readyLabel : copy.fallbackLabel}
            </span>
          </div>

          <p className="mt-5 font-display text-3xl leading-none text-white md:text-5xl">
            {localizedTitle}
          </p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
            {localizedSubtitle}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78">
            {localizedDescription}
          </p>

          <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-black/24 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f1c76f]">
              {copy.modelAsset}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/74">
              <span className="font-semibold text-white">
                {config.modelImport.targetPath}
              </span>{" "}
              - {pickLocalizedText(config.modelImport.optimizationNote, language)}
            </p>
            {!hasModelAsset ? (
              <p className="mt-2 text-xs leading-5 text-white/54">
                {pickLocalizedText(config.modelImport.fallbackNote, language)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-3 z-20 flex max-w-[calc(100vw-1.5rem)] flex-wrap items-start justify-end gap-2 pointer-events-auto sm:right-4 sm:top-4 md:right-6 md:top-6">
        <span className="hidden rounded-full border border-white/12 bg-black/44 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/72 backdrop-blur-xl sm:inline-flex">
          {copy.orbitHint}
        </span>
        <div
          className="flex max-w-full flex-wrap items-center gap-1 rounded-full border border-white/12 bg-black/44 p-1 backdrop-blur-xl"
          role="group"
          aria-label="Camera viewpoints"
        >
          {config.cameraPresets.map((preset) => {
            const isActive = preset.id === cameraView.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActiveCameraId(preset.id)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full px-3 py-2 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#f7cf7c]",
                  isActive
                    ? "bg-[#d5b27a]/24 text-[#f3dcb3]"
                    : "text-white/72 hover:bg-white/10"
                )}
              >
                {pickLocalizedText(preset.label, language)}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveCameraId(config.initialCamera.id);
            setSelectedHotspotId(config.hotspots[1]?.id ?? null);
            setActiveRouteId("ceremonial-axis");
            setRouteStopIndex(0);
            setViewerVersion((current) => current + 1);
          }}
          className="rounded-full border border-white/12 bg-black/44 px-4 py-3 text-sm font-semibold text-white outline-none backdrop-blur-xl transition hover:bg-black/62 focus-visible:ring-2 focus-visible:ring-[#f7cf7c]"
        >
          {copy.resetView}
        </button>
        <Link
          href="/"
          className="inline-flex rounded-full border border-[#d5b27a]/28 bg-[#d5b27a]/16 px-4 py-3 text-sm font-semibold text-[#f3dcb3] outline-none backdrop-blur-xl transition hover:bg-[#d5b27a]/24 focus-visible:ring-2 focus-visible:ring-[#f7cf7c]"
        >
          {copy.backHome}
        </Link>
      </div>

      <div className="absolute bottom-4 left-3 right-3 z-20 grid gap-3 pointer-events-none lg:left-6 lg:right-auto lg:w-[min(35rem,calc(100vw-2rem))]">
        <div className="pointer-events-auto max-h-[42svh] overflow-y-auto rounded-[1.45rem] border border-white/12 bg-black/58 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f1c76f]">
            {copy.controls}
          </p>
          <div className="mt-4 grid gap-4">
            <ControlGroup title={copy.routes}>
              {config.routeOverlays.map((route) => (
                <PillButton
                  key={route.id}
                  isActive={activeRouteId === route.id}
                  onClick={() => startRouteFlythrough(route)}
                >
                  {pickLocalizedText(route.label, language)}
                </PillButton>
              ))}
              <PillButton
                isActive={!activeRouteId}
                onClick={() => setActiveRouteId(null)}
              >
                Full palace
              </PillButton>
              <PillButton
                onClick={moveToNextStop}
                className="border-[#ff747c]/40 bg-[#ff747c]/18 text-[#ffd7da] hover:bg-[#ff747c]/26"
              >
                {copy.nextStop}
              </PillButton>
            </ControlGroup>

            <ControlGroup title={copy.layers}>
              {config.informationLayers.map((layer) => (
                <PillButton
                  key={layer.id}
                  isActive={enabledLayerIds.includes(layer.id)}
                  onClick={() => toggleLayer(layer.id)}
                >
                  {pickLocalizedText(layer.label, language)}
                </PillButton>
              ))}
            </ControlGroup>

            <div className="grid gap-4 md:grid-cols-3">
              <ControlGroup title={copy.lighting}>
                {config.lightingModes.map((mode) => (
                  <PillButton
                    key={mode.id}
                    isActive={lightingMode === mode.id}
                    onClick={() => setLightingMode(mode.id)}
                  >
                    {pickLocalizedText(mode.label, language)}
                  </PillButton>
                ))}
              </ControlGroup>
              <ControlGroup title={copy.season}>
                {config.seasonModes.map((mode) => (
                  <PillButton
                    key={mode.id}
                    isActive={seasonMode === mode.id}
                    onClick={() => setSeasonMode(mode.id)}
                  >
                    {pickLocalizedText(mode.label, language)}
                  </PillButton>
                ))}
              </ControlGroup>
              <ControlGroup title={copy.quality}>
                {config.qualityModes.map((mode) => (
                  <PillButton
                    key={mode.id}
                    isActive={qualityMode === mode.id}
                    onClick={() => setQualityMode(mode.id)}
                  >
                    {pickLocalizedText(mode.label, language)}
                  </PillButton>
                ))}
              </ControlGroup>
            </div>

            <div className="rounded-[1.2rem] border border-white/12 bg-black/38 p-4 lg:hidden">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f1c76f]">
                {copy.annotation}
              </p>
              {selectedHotspot ? (
                <>
                  <p className="mt-2 font-display text-2xl leading-tight text-white">
                    {pickLocalizedText(selectedHotspot.label, language)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    {pickLocalizedText(selectedHotspot.description, language)}
                  </p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">
                    {copy.sourceLabel}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/?view=place&place=${selectedHotspot.placeSlug}&route=${selectedHotspot.routeId}`}
                      className="rounded-full bg-[#f1c76f] px-4 py-2 text-xs font-bold text-black outline-none transition hover:bg-[#ffd987] focus-visible:ring-2 focus-visible:ring-[#f7cf7c]"
                    >
                      {copy.openPlace}
                    </Link>
                    <Link
                      href="/companion"
                      className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold text-white outline-none transition hover:bg-white/16 focus-visible:ring-2 focus-visible:ring-[#f7cf7c]"
                    >
                      {copy.askCompanion}
                    </Link>
                    <button
                      type="button"
                      onClick={completeChallenge}
                      disabled={challengeComplete}
                      className={cn(
                        "rounded-full px-4 py-2 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#f7cf7c]",
                        challengeComplete
                          ? "bg-emerald-400/18 text-emerald-100"
                          : "bg-[#ff747c] text-black hover:bg-[#ff8b91]"
                      )}
                    >
                      {challengeComplete ? copy.challengeDone : copy.completeChallenge}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm leading-6 text-white/70">
                  {copy.noHotspot}
                </p>
              )}
              <p className="mt-3 text-xs leading-5 text-white/50">
                {hasWebXr ? copy.webxrReady : copy.webxrUnavailable}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] flex-wrap gap-2">
          <MusicToggleButton tone={isDarkTheme ? "dark" : "light"} compact />
          <LanguageToggleButton tone={isDarkTheme ? "dark" : "light"} />
          <ThemeToggleButton tone={isDarkTheme ? "dark" : "light"} />
        </div>
      </div>

      <div className="absolute bottom-4 right-3 z-20 hidden w-[min(27rem,calc(100vw-2rem))] pointer-events-auto lg:block md:right-6">
        <div className="space-y-3">
          <div className="rounded-[1.45rem] border border-white/12 bg-black/60 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f1c76f]">
              {copy.annotation}
            </p>
            {selectedHotspot ? (
              <>
                <p className="mt-3 font-display text-3xl leading-tight text-white">
                  {pickLocalizedText(selectedHotspot.label, language)}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/74">
                  {pickLocalizedText(selectedHotspot.description, language)}
                </p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/42">
                  {copy.sourceLabel}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/?view=place&place=${selectedHotspot.placeSlug}&route=${selectedHotspot.routeId}`}
                    className="rounded-full bg-[#f1c76f] px-4 py-2 text-xs font-bold text-black outline-none transition hover:bg-[#ffd987] focus-visible:ring-2 focus-visible:ring-[#f7cf7c]"
                  >
                    {copy.openPlace}
                  </Link>
                  <Link
                    href="/companion"
                    className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold text-white outline-none transition hover:bg-white/16 focus-visible:ring-2 focus-visible:ring-[#f7cf7c]"
                  >
                    {copy.askCompanion}
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm leading-7 text-white/70">{copy.noHotspot}</p>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="rounded-[1.25rem] border border-white/12 bg-black/54 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f1c76f]">
                {copy.challenge}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/74">
                {selectedHotspot?.challengePrompt
                  ? pickLocalizedText(selectedHotspot.challengePrompt, language)
                  : "Find how route, roofline, and courtyard scale create palace order."}
              </p>
              <button
                type="button"
                onClick={completeChallenge}
                disabled={challengeComplete}
                className={cn(
                  "mt-3 rounded-full px-4 py-2 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#f7cf7c]",
                  challengeComplete
                    ? "bg-emerald-400/18 text-emerald-100"
                    : "bg-[#ff747c] text-black hover:bg-[#ff8b91]"
                )}
              >
                {challengeComplete ? copy.challengeDone : copy.completeChallenge}
              </button>
            </div>

            <div className="rounded-[1.25rem] border border-white/12 bg-black/54 p-4 text-center backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f1c76f]">
                {copy.minimap}
              </p>
              <div className="relative mx-auto mt-3 h-28 w-20 rounded-[999px] border border-white/18 bg-white/8">
                <div className="absolute left-1/2 top-2 h-5 w-px -translate-x-1/2 bg-[#f1c76f]" />
                <span className="absolute left-1/2 top-7 -translate-x-1/2 text-xs font-black text-[#f1c76f]">
                  {copy.north}
                </span>
                <div className="absolute left-1/2 top-12 h-12 w-1 -translate-x-1/2 rounded-full bg-white/38" />
                {activeRoute ? (
                  <div
                    className="absolute left-1/2 top-16 h-3 w-3 -translate-x-1/2 rounded-full"
                    style={{ backgroundColor: activeRoute.color }}
                    suppressHydrationWarning
                  />
                ) : null}
              </div>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                {copy.scale}
              </p>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-white/12 bg-black/54 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f1c76f]">
              {copy.webxr}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              {hasWebXr ? copy.webxrReady : copy.webxrUnavailable}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
