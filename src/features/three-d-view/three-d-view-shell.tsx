"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ContactShadows, OrbitControls, PerspectiveCamera, Sky, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { LanguageToggleButton } from "@/components/preferences/language-toggle-button";
import { MusicToggleButton } from "@/components/media/music-toggle-button";
import { ThemeToggleButton } from "@/components/preferences/theme-toggle-button";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { ForbiddenCityPlaceholderScene } from "@/features/three-d-view/forbidden-city-placeholder-scene";
import { pickLocalizedText } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type {
  ThreeDCameraView,
  ThreeDViewerConfig,
} from "@/features/three-d-view/viewer-config";

type ThreeDViewShellProps = {
  config: ThreeDViewerConfig;
  hasModelAsset: boolean;
};

const shellCopy = {
  zh: {
    eyebrow: "三维模型展示",
    readyLabel: "模型就绪",
    fallbackLabel: "占位场景",
    orbitHint: "拖动旋转，滚轮或捏合缩放",
    resetView: "重置视角",
    backHome: "返回首页",
    sceneNoteTitle: "场景说明",
    sceneNoteBody:
      "当前为增强版程序化场景，包含太和殿三台、午门、角楼、金水河、华表、石狮、铜鼎及御花园等主要建筑群。真实 GLB 模型加入后即可无缝切换。",
  },
  en: {
    eyebrow: "3D model showcase",
    readyLabel: "Model ready",
    fallbackLabel: "Placeholder scene",
    orbitHint: "Drag to orbit, scroll or pinch to zoom",
    resetView: "Reset view",
    backHome: "Back home",
    sceneNoteTitle: "Scene note",
    sceneNoteBody:
      "Enhanced procedural model featuring the Hall of Supreme Harmony on its triple marble terrace, Meridian Gate, corner watchtowers, Golden Water River, Huabiao pillars, stone lions, bronze urns, and Imperial Garden — built entirely from geometric primitives. Drop in a real GLB to replace instantly.",
  },
} as const;

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

function ViewerScene({
  config,
  cameraView,
  hasModelAsset,
}: {
  config: ThreeDViewerConfig;
  cameraView: ThreeDCameraView;
  hasModelAsset: boolean;
}) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={cameraView.position}
        fov={cameraView.fov}
      />
      <color attach="background" args={["#d5dfeb"]} />
      <fog attach="fog" args={["#dbe3ec", 36, 128]} />
      <Sky
        distance={450000}
        sunPosition={[6.0, 2.8, 1.0]}
        inclination={0.46}
        azimuth={0.18}
        turbidity={6.8}
        rayleigh={1.2}
      />
      {/* Warm afternoon hemisphere */}
      <hemisphereLight intensity={1.05} color="#f8edd5" groundColor="#71573b" />
      <ambientLight intensity={0.32} />
      {/* Main sun */}
      <directionalLight
        castShadow
        position={[28, 36, 20]}
        intensity={2.15}
        color="#fff1cc"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-52}
        shadow-camera-right={52}
        shadow-camera-top={52}
        shadow-camera-bottom={-52}
      />
      {/* Warm fill from west */}
      <directionalLight position={[-20, 16, -12]} intensity={0.62} color="#c88944" />
      {/* Cool sky bounce */}
      <directionalLight position={[0, 20, -30]} intensity={0.24} color="#98b8d8" />

      {hasModelAsset && config.modelSrc ? (
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <RealModelLayer src={config.modelSrc} />
          </group>
        </Suspense>
      ) : (
        <ForbiddenCityPlaceholderScene />
      )}

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.28}
        scale={118}
        blur={3.2}
        far={40}
        color="#3a2010"
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

export function ThreeDViewShell({
  config,
  hasModelAsset,
}: ThreeDViewShellProps) {
  const { language, theme } = useSitePreferences();
  const [viewerVersion, setViewerVersion] = useState(0);
  const [activeCameraId, setActiveCameraId] = useState(config.initialCamera.id);
  const isDarkTheme = theme === "dark";
  const copy = shellCopy[language];
  const localizedTitle = pickLocalizedText(config.title, language);
  const localizedSubtitle = pickLocalizedText(config.subtitle, language);
  const localizedDescription = pickLocalizedText(config.description, language);
  const cameraView =
    config.cameraPresets.find((preset) => preset.id === activeCameraId) ??
    config.initialCamera;

  return (
    <section
      className={cn(
        "relative h-[100svh] overflow-hidden",
        isDarkTheme ? "bg-[#04070d] text-white" : "bg-[#f0e6d5] text-foreground"
      )}
    >
      <div className="absolute inset-0">
        <Canvas
          key={`${viewerVersion}:${cameraView.id}`}
          aria-label={localizedTitle}
          dpr={[1, 1.5]}
          shadows
          gl={{ antialias: true, powerPreference: "high-performance" }}
          performance={{ min: 0.8 }}
        >
          <ViewerScene
            config={config}
            cameraView={cameraView}
            hasModelAsset={hasModelAsset}
          />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(249,214,155,0.22),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(95,138,189,0.2),transparent_28%),linear-gradient(180deg,rgba(3,7,12,0.08),rgba(3,7,12,0.18)_40%,rgba(3,7,12,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-[linear-gradient(180deg,rgba(4,7,13,0),rgba(4,7,13,0.66))]" />

      <div className="absolute left-3 top-3 z-20 w-[min(24rem,calc(100vw-1.5rem))] pointer-events-auto sm:left-4 sm:top-4 md:left-6 md:top-6">
        <div
          className={cn(
            "max-h-[42svh] overflow-y-auto rounded-[1.5rem] border p-4 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:max-h-none sm:rounded-[1.9rem] sm:p-5",
            isDarkTheme
              ? "border-white/12 bg-[rgba(7,10,16,0.58)] text-white"
              : "border-white/55 bg-[rgba(255,248,238,0.8)] text-foreground"
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
                  ? isDarkTheme
                    ? "border-emerald-400/28 bg-emerald-400/12 text-emerald-200"
                    : "border-emerald-600/20 bg-emerald-600/8 text-emerald-800"
                  : isDarkTheme
                    ? "border-[#d5b27a]/26 bg-[#d5b27a]/14 text-[#f3dcb3]"
                    : "border-accent/18 bg-accent/8 text-accent-soft"
              )}
            >
              {hasModelAsset ? copy.readyLabel : copy.fallbackLabel}
            </span>
          </div>

          <p className={cn("mt-5 font-display text-3xl leading-none md:text-5xl", isDarkTheme ? "text-white" : "text-foreground")}>
            {localizedTitle}
          </p>
          <p className={cn("mt-3 text-[11px] font-semibold uppercase tracking-[0.28em]", isDarkTheme ? "text-white/58" : "text-foreground/58")}>
            {localizedSubtitle}
          </p>
          <p className={cn("mt-5 max-w-2xl text-sm leading-7", isDarkTheme ? "text-white/78" : "text-foreground/74")}>
            {localizedDescription}
          </p>
        </div>
      </div>

      <div className="absolute bottom-24 right-3 z-20 flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-end gap-2 pointer-events-auto sm:right-4 sm:top-4 sm:bottom-auto md:right-6 md:top-6">
        <span
          className={cn(
            "hidden rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] sm:inline-flex",
            isDarkTheme
              ? "border-white/12 bg-[rgba(7,10,16,0.54)] text-white/72"
              : "border-white/55 bg-[rgba(255,248,238,0.78)] text-foreground/72"
          )}
        >
          {copy.orbitHint}
        </span>
        <div
          className={cn(
            "flex max-w-full flex-wrap items-center gap-1 rounded-full border p-1 backdrop-blur-xl",
            isDarkTheme
              ? "border-white/12 bg-[rgba(7,10,16,0.54)]"
              : "border-white/55 bg-[rgba(255,248,238,0.78)]"
          )}
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
                  "rounded-full px-3 py-2 text-xs font-semibold",
                  isActive
                    ? isDarkTheme
                      ? "bg-[#d5b27a]/22 text-[#f3dcb3]"
                      : "bg-accent/12 text-accent-strong"
                    : isDarkTheme
                      ? "text-white/72 hover:bg-white/10"
                      : "text-foreground/72 hover:bg-white/70"
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
            setViewerVersion((current) => current + 1);
          }}
          className={cn(
            "rounded-full border px-4 py-3 text-sm font-semibold",
            isDarkTheme
              ? "border-white/12 bg-[rgba(7,10,16,0.54)] text-white hover:bg-[rgba(7,10,16,0.68)]"
              : "border-white/55 bg-[rgba(255,248,238,0.82)] text-foreground hover:bg-white"
          )}
        >
          {copy.resetView}
        </button>
        <Link
          href="/"
          className={cn(
            "inline-flex rounded-full border px-4 py-3 text-sm font-semibold",
            isDarkTheme
              ? "border-[#d5b27a]/28 bg-[#d5b27a]/14 text-[#f3dcb3] hover:bg-[#d5b27a]/22"
              : "border-accent/18 bg-accent/8 text-accent-strong hover:bg-accent/12"
          )}
        >
          {copy.backHome}
        </Link>
      </div>

      <div className="absolute left-4 bottom-4 z-20 flex max-w-[calc(100vw-2rem)] flex-wrap gap-2 pointer-events-auto md:left-6 md:bottom-6">
        <MusicToggleButton tone={isDarkTheme ? "dark" : "light"} compact />
        <LanguageToggleButton tone={isDarkTheme ? "dark" : "light"} />
        <ThemeToggleButton tone={isDarkTheme ? "dark" : "light"} />
      </div>

      <div className="absolute right-4 bottom-4 z-20 hidden w-[min(25rem,calc(100vw-2rem))] pointer-events-auto lg:block md:right-6 md:bottom-6">
        <div
          className={cn(
            "rounded-[1.7rem] border p-5 shadow-[0_20px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl",
            isDarkTheme
              ? "border-white/12 bg-[rgba(7,10,16,0.58)] text-white"
              : "border-white/55 bg-[rgba(255,248,238,0.82)] text-foreground"
          )}
        >
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.26em]", isDarkTheme ? "text-[#f3dcb3]" : "text-accent-soft")}>
            {copy.sceneNoteTitle}
          </p>
          <p className={cn("mt-4 text-sm leading-7", isDarkTheme ? "text-white/76" : "text-foreground/74")}>
            {copy.sceneNoteBody}
          </p>
        </div>
      </div>
    </section>
  );
}
