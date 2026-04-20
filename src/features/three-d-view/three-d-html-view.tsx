"use client";

import { useEffect, useRef, useState } from "react";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { ImmersiveAssetLoadingOverlay } from "@/components/ui/app-status-screens";
import { cn } from "@/lib/utils";

const SCENE_READY_MESSAGE = "forbidden-city-scene-ready";

export function ThreeDHtmlView() {
  const { theme } = useSitePreferences();
  const [shouldMountScene, setShouldMountScene] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isDarkTheme = theme === "dark";
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    let cancelled = false;
    const scheduler = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

    const mountScene = () => {
      if (!cancelled) {
        setShouldMountScene(true);
      }
    };

    if (typeof scheduler.requestIdleCallback === "function") {
      idleId = scheduler.requestIdleCallback(mountScene, { timeout: 900 });
    } else {
      timeoutId = globalThis.setTimeout(mountScene, 180);
    }

    return () => {
      cancelled = true;

      if (
        idleId !== undefined &&
        typeof scheduler.cancelIdleCallback === "function"
      ) {
        scheduler.cancelIdleCallback(idleId);
      }

      if (timeoutId !== undefined) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === SCENE_READY_MESSAGE) {
        setIsLoaded(true);

        if (fallbackTimerRef.current) {
          globalThis.clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        globalThis.clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  return (
    <section
      className={cn(
        "relative h-[100svh] overflow-hidden",
        isDarkTheme ? "bg-[#04070d] text-white" : "bg-[#f0e6d5] text-foreground"
      )}
    >
      <div className="absolute inset-0">
        {shouldMountScene ? (
          <iframe
            src="/3d-view/scene"
            title="Forbidden City 3D View"
            className={cn(
              "block h-full w-full border-0 transition-opacity duration-700",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
            allow="fullscreen"
            onLoad={() => {
              if (fallbackTimerRef.current) {
                globalThis.clearTimeout(fallbackTimerRef.current);
              }

              fallbackTimerRef.current = globalThis.setTimeout(() => {
                setIsLoaded(true);
              }, 1400);
            }}
          />
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(244,220,179,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(103,144,192,0.16),transparent_28%),linear-gradient(180deg,rgba(4,7,13,0.08),rgba(4,7,13,0.2)_52%,rgba(4,7,13,0.4)_100%)]" />

      <ImmersiveAssetLoadingOverlay
        visible={!isLoaded}
        eyebrow={{ zh: "三维视图", en: "3D View" }}
        title={{
          zh: "正在接入完整故宫三维场景…",
          en: "Attaching the full Forbidden City 3D scene...",
        }}
        description={{
          zh: "外层页面已准备完成，正在连接更重的 WebGL 展示场景。",
          en: "The fullscreen shell is ready. The heavier WebGL showcase scene is now being attached.",
        }}
      />
    </section>
  );
}
