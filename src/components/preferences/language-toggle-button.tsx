"use client";

import { cn } from "@/lib/utils";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { SUPPORTED_APP_LOCALES } from "@/lib/site-preferences";

type LanguageToggleButtonProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function LanguageToggleButton({
  className,
  tone = "light",
}: LanguageToggleButtonProps) {
  const { language, setLanguage } = useSitePreferences();
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
      aria-label={language === "zh" ? "语言切换" : "Language toggle"}
    >
      {SUPPORTED_APP_LOCALES.map((option) => {
        const isActive = language === option.language;

        return (
          <button
            key={option.language}
            type="button"
            onClick={() => setLanguage(option.language)}
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
            {option.language === "zh" ? option.nativeLabel : "EN"}
          </button>
        );
      })}
    </div>
  );
}
