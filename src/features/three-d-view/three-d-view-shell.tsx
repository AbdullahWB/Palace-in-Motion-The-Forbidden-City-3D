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
import type { ThreeDViewerConfig } from "@/features/three-d-view/viewer-config";

type ThreeDViewShellProps = {
  config: ThreeDViewerConfig;
  hasModelAsset: boolean;
};

const shellCopy = {
  zh: {
    eyebrow: "ä¸‰ç»´æ¨¡åž‹å±•ç¤º",
    readyLabel: "æ¨¡åž‹å°±ç»ª",
    fallbackLabel: "å ä½åœºæ™¯",
    orbitHint: "æ‹–åŠ¨æ—‹è½¬ï¼Œæ»šè½®æˆ–æåˆç¼©æ”¾",
    resetView: "é‡ç½®è§†è§’",
    backHome: "è¿”å›žé¦–é¡µ",
    sceneNoteTitle: "åœºæ™¯è¯´æ˜Ž",
    sceneNoteBody:
      "å½“å‰æ˜¯ä¸€ä¸ªé¢å‘çœŸå®žæ¨¡åž‹çš„å…¨å±æŸ¥çœ‹å™¨ï¼ŒçŽ°é˜¶æ®µç”¨æ›´å®Œæ•´çš„ç¦åŸŽä½“é‡å…³ç³»å’Œä¸­è½´æž„å›¾æ¥ä»£æ›¿çœŸå®ž GLB æ¨¡åž‹ã€‚",
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
      "This is a fullscreen viewer shell prepared for a real Forbidden City model. Until the GLB is added, the page uses a fuller ceremonial placeholder scene with stronger massing and axial composition.",
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
  hasModelAsset,
}: {
  config: ThreeDViewerConfig;
  hasModelAsset: boolean;
}) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={config.initialCamera.position}
        fov={config.initialCamera.fov}
      />
      <color attach="background" args={["#c9d8ea"]} />
      <fog attach="fog" args={["#d4dfec", 24, 78]} />
      <Sky
        distance={450000}
        sunPosition={[5.5, 2.6, 1.2]}
        inclination={0.48}
        azimuth={0.2}
        turbidity={7.2}
        rayleigh={1.3}
      />
      <hemisphereLight intensity={1.05} color="#f4ebd8" groundColor="#8a6140" />
      <ambientLight intensity={0.42} />
      <directionalLight
        castShadow
        position={[26, 34, 18]}
        intensity={2.2}
        color="#fff3d6"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
      />
      <directionalLight position={[-18, 14, -14]} intensity={0.72} color="#c98b54" />

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
        opacity={0.34}
        scale={92}
        blur={2.6}
        far={28}
        color="#4a2f21"
      />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={config.orbitLimits.minDistance}
        maxDistance={config.orbitLimits.maxDistance}
        minPolarAngle={config.orbitLimits.minPolarAngle}
        maxPolarAngle={config.orbitLimits.maxPolarAngle}
        target={config.initialCamera.target}
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
  const isDarkTheme = theme === "dark";
  const copy = shellCopy[language];
  const localizedTitle = pickLocalizedText(config.title, language);
  const localizedSubtitle = pickLocalizedText(config.subtitle, language);
  const localizedDescription = pickLocalizedText(config.description, language);

  return (
    <section
      className={cn(
        "relative h-[100svh] overflow-hidden",
        isDarkTheme ? "bg-[#04070d] text-white" : "bg-[#f0e6d5] text-foreground"
      )}
    >
      <div className="absolute inset-0">
        <Canvas
          key={viewerVersion}
          dpr={[1, 1.5]}
          shadows
          gl={{ antialias: true, powerPreference: "high-performance" }}
          performance={{ min: 0.8 }}
        >
          <ViewerScene config={config} hasModelAsset={hasModelAsset} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(249,214,155,0.22),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(95,138,189,0.2),transparent_28%),linear-gradient(180deg,rgba(3,7,12,0.08),rgba(3,7,12,0.18)_40%,rgba(3,7,12,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-[linear-gradient(180deg,rgba(4,7,13,0),rgba(4,7,13,0.66))]" />

      <div className="absolute left-4 top-4 z-20 w-[min(28rem,calc(100vw-2rem))] pointer-events-auto md:left-6 md:top-6">
        <div
          className={cn(
            "rounded-[1.9rem] border p-5 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl",
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

          <p className={cn("mt-5 font-display text-4xl leading-none md:text-5xl", isDarkTheme ? "text-white" : "text-foreground")}>
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

      <div className="absolute right-4 top-4 z-20 flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-end gap-2 pointer-events-auto md:right-6 md:top-6">
        <span
          className={cn(
            "rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]",
            isDarkTheme
              ? "border-white/12 bg-[rgba(7,10,16,0.54)] text-white/72"
              : "border-white/55 bg-[rgba(255,248,238,0.78)] text-foreground/72"
          )}
        >
          {copy.orbitHint}
        </span>
        <button
          type="button"
          onClick={() => setViewerVersion((current) => current + 1)}
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

      <div className="absolute right-4 bottom-4 z-20 w-[min(25rem,calc(100vw-2rem))] pointer-events-auto md:right-6 md:bottom-6">
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
