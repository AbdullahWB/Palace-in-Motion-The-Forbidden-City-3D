"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { ImmersiveAssetLoadingOverlay } from "@/components/ui/app-status-screens";
import { cn } from "@/lib/utils";

export function ThreeDHtmlView() {
  const { theme } = useSitePreferences();
  const [shouldMountScene, setShouldMountScene] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isDarkTheme = theme === "dark";

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
            className="block h-full w-full border-0"
            loading="lazy"
            allow="fullscreen"
            onLoad={() => setIsLoaded(true)}
          />
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(241,216,178,0.18),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(86,126,175,0.16),transparent_30%),linear-gradient(180deg,rgba(4,7,13,0.06),rgba(4,7,13,0.16)_46%,rgba(4,7,13,0.36)_100%)]" />

      <ImmersiveAssetLoadingOverlay
        visible={!isLoaded}
        eyebrow={{ zh: "三维视图", en: "3D View" }}
        title={{ zh: "正在附加完整三维场景…", en: "Attaching the full 3D scene..." }}
        description={{
          zh: "页面外壳已加载完成，正在接入更重的 WebGL 场景资源。",
          en: "The immersive shell is ready. The heavier WebGL scene is now being attached.",
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute right-4 top-4 z-20 flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-end gap-2 md:right-6 md:top-6">
          <Link
            href="/"
            className={cn(
              "inline-flex rounded-full border px-4 py-3 text-sm font-semibold shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl",
              isDarkTheme
                ? "border-white/12 bg-[rgba(7,10,16,0.64)] text-white hover:bg-[rgba(7,10,16,0.78)]"
                : "border-white/70 bg-[rgba(255,248,238,0.88)] text-foreground hover:bg-white"
            )}
          >
            Back home
          </Link>
          <Link
            href="/?view=map"
            className={cn(
              "inline-flex rounded-full border px-4 py-3 text-sm font-semibold shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl",
              isDarkTheme
                ? "border-[#d5b27a]/28 bg-[#d5b27a]/14 text-[#f3dcb3] hover:bg-[#d5b27a]/22"
                : "border-accent/18 bg-accent/8 text-accent-strong hover:bg-accent/12"
            )}
          >
            Open explore
          </Link>
        </div>
      </div>
    </section>
  );
}
