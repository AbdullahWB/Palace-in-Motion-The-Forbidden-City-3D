"use client";

import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { useSiteMusic } from "@/components/media/site-music-provider";
import { cn } from "@/lib/utils";

type MusicToggleButtonProps = {
  className?: string;
  tone?: "light" | "dark";
  compact?: boolean;
};

export function MusicToggleButton({
  className,
  tone = "light",
  compact = false,
}: MusicToggleButtonProps) {
  const { enabled, hasStarted, isPlaying, toggleMusic } = useSiteMusic();
  const { language } = useSitePreferences();

  const wrapperClassName =
    tone === "dark"
      ? "border-white/22 bg-[rgba(9,10,14,0.46)] text-white hover:bg-[rgba(9,10,14,0.58)]"
      : "border-border/80 bg-white/88 text-foreground hover:bg-white";

  const statusLabel =
    language === "zh"
      ? !enabled
        ? "关闭"
        : isPlaying
          ? "播放中"
          : hasStarted
            ? "继续"
            : "开始"
      : !enabled
        ? "Off"
        : isPlaying
          ? "Playing"
          : hasStarted
            ? "Resume"
            : "Start";

  const sectionLabel = language === "zh" ? "宫乐" : "Palace music";
  const ariaLabel =
    language === "zh"
      ? enabled
        ? "关闭宫廷背景音乐"
        : "播放宫廷背景音乐"
      : enabled
        ? "Mute palace background music"
        : "Play palace background music";

  return (
    <button
      type="button"
      onClick={toggleMusic}
      className={cn(
        "inline-flex items-center gap-3 rounded-full border px-4 py-3 text-left shadow-[0_16px_36px_rgba(36,22,18,0.18)] backdrop-blur-md",
        wrapperClassName,
        compact && "px-3 py-2.5 text-sm",
        className
      )}
      aria-pressed={enabled}
      aria-label={ariaLabel}
    >
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold",
          tone === "dark" ? "bg-white/12 text-[#f5ddb4]" : "bg-accent/10 text-accent"
        )}
      >
        音
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-[10px] font-semibold uppercase tracking-[0.22em]",
            tone === "dark" ? "text-white/58" : "text-accent-soft"
          )}
        >
          {sectionLabel}
        </span>
        <span className="block truncate text-sm font-semibold">{statusLabel}</span>
      </span>
    </button>
  );
}
