"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type { AccessibilityPreferences } from "@/types/preferences";

const accessibilityCopy = {
  zh: {
    open: "无障碍",
    title: "无障碍与舒适模式",
    body: "这些设置会保存在本机，并应用到导览、地图、护照、三维视图与课堂页面。",
    close: "关闭无障碍设置",
    reset: "重置",
    controls: [
      { key: "largeText", label: "大字" },
      { key: "extraLargeText", label: "超大字" },
      { key: "highContrast", label: "高对比" },
      { key: "reduceMotion", label: "减少动效" },
      { key: "simplified", label: "简化说明" },
      { key: "keyboardFocus", label: "键盘焦点" },
    ],
  },
  en: {
    open: "Access",
    title: "Accessibility and Comfort",
    body: "These local preferences apply across Explore, map, Passport, 3D, Companion, and Classroom.",
    close: "Close accessibility settings",
    reset: "Reset",
    controls: [
      { key: "largeText", label: "Large text" },
      { key: "extraLargeText", label: "XL text" },
      { key: "highContrast", label: "High contrast" },
      { key: "reduceMotion", label: "Reduce motion" },
      { key: "simplified", label: "Simplify" },
      { key: "keyboardFocus", label: "Keyboard focus" },
    ],
  },
} as const;

function isPreferenceActive(
  key: (typeof accessibilityCopy.en.controls)[number]["key"],
  preferences: AccessibilityPreferences
) {
  if (key === "largeText") {
    return preferences.textScale !== "standard";
  }

  if (key === "extraLargeText") {
    return preferences.textScale === "extra-large";
  }

  if (key === "highContrast") {
    return preferences.contrast === "high";
  }

  if (key === "reduceMotion") {
    return preferences.reduceMotion;
  }

  if (key === "simplified") {
    return preferences.simplified;
  }

  return preferences.keyboardFocus;
}

function getNextPreferencePatch(
  key: (typeof accessibilityCopy.en.controls)[number]["key"],
  preferences: AccessibilityPreferences
): Partial<AccessibilityPreferences> {
  if (key === "largeText") {
    return {
      textScale: preferences.textScale === "standard" ? "large" : "standard",
    };
  }

  if (key === "extraLargeText") {
    return {
      textScale:
        preferences.textScale === "extra-large" ? "large" : "extra-large",
    };
  }

  if (key === "highContrast") {
    return {
      contrast: preferences.contrast === "high" ? "standard" : "high",
    };
  }

  if (key === "reduceMotion") {
    return { reduceMotion: !preferences.reduceMotion };
  }

  if (key === "simplified") {
    return { simplified: !preferences.simplified };
  }

  return {
    keyboardFocus: !preferences.keyboardFocus,
    readableLabels: !preferences.keyboardFocus,
  };
}

export function GlobalAccessibilityControl() {
  const pathname = usePathname();
  const { language, theme } = useSitePreferences();
  const preferences = useAppStore((state) => state.accessibilityPreferences);
  const updateAccessibilityPreferences = useAppStore(
    (state) => state.updateAccessibilityPreferences
  );
  const [isOpen, setIsOpen] = useState(false);
  const copy = accessibilityCopy[language];
  const isDarkTheme = theme === "dark";
  const isImmersive3D = pathname === "/3d-view";

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[46]",
        isImmersive3D
          ? "right-5 top-[6.25rem]"
          : "bottom-5 left-[5.25rem] sm:left-6"
      )}
    >
      {isOpen ? (
        <section
          className={cn(
            "pointer-events-auto mb-3 w-[min(22rem,calc(100vw-2rem))] rounded-[1.35rem] border p-4 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl",
            isDarkTheme
              ? "border-white/12 bg-[#11141c]/92 text-white"
              : "border-[#7c5b35]/20 bg-[#fff8ee]/94 text-[#241811]"
          )}
          role="dialog"
          aria-label={copy.title}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black">{copy.title}</p>
              <p className="mt-2 text-xs font-semibold leading-5 opacity-70">
                {copy.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-sm font-black"
              aria-label={copy.close}
            >
              X
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {copy.controls.map((control) => {
              const isActive = isPreferenceActive(control.key, preferences);

              return (
                <button
                  key={control.key}
                  type="button"
                  onClick={() =>
                    updateAccessibilityPreferences(
                      getNextPreferencePatch(control.key, preferences)
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-black",
                    isActive
                      ? "border-[#e8bd73] bg-[#e8bd73] text-black"
                      : "border-white/12 bg-white/8 opacity-76"
                  )}
                  aria-pressed={isActive}
                >
                  {control.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() =>
              updateAccessibilityPreferences({
                textScale: "standard",
                contrast: "standard",
                reduceMotion: false,
                simplified: false,
                readableLabels: false,
                keyboardFocus: false,
              })
            }
            className="mt-3 w-full rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-black"
          >
            {copy.reset}
          </button>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "pointer-events-auto rounded-full border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] shadow-[0_14px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl",
          isDarkTheme
            ? "border-[#d6b071]/30 bg-[#10141d]/84 text-[#f5ddb4]"
            : "border-[#7c5b35]/20 bg-[#fff8ee]/94 text-[#7c5128]"
        )}
        aria-expanded={isOpen}
        aria-label={copy.title}
      >
        {copy.open}
      </button>
    </div>
  );
}
