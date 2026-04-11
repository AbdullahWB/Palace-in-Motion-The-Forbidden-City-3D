"use client";

import { cn } from "@/lib/utils";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";

type ThemeToggleButtonProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function ThemeToggleButton({
  className,
  tone = "light",
}: ThemeToggleButtonProps) {
  const { language, theme, setTheme } = useSitePreferences();
  const isDarkTone = tone === "dark";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-md",
        isDarkTone
          ? "border-white/16 bg-[rgba(8,12,20,0.56)]"
          : "border-border/70 bg-surface/92",
        className
      )}
      aria-label={language === "zh" ? "主题切换" : "Theme toggle"}
    >
      {[
        { value: "dark" as const, label: language === "zh" ? "深色" : "Dark" },
        { value: "light" as const, label: language === "zh" ? "亮色" : "Light" },
      ].map((option) => {
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "rounded-full px-3 py-2 text-xs font-semibold transition-colors",
              isActive
                ? isDarkTone
                  ? "bg-[#d6b071]/20 text-[#f5ddb4]"
                  : "bg-accent text-white"
                : isDarkTone
                  ? "text-white/66 hover:bg-white/8"
                  : "text-foreground/72 hover:bg-background/80"
            )}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
