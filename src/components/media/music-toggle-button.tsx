"use client";

import { cn } from "@/lib/utils";
import { useSiteMusic } from "@/components/media/site-music-provider";

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

  const wrapperClassName =
    tone === "dark"
      ? "border-white/22 bg-[rgba(9,10,14,0.46)] text-white hover:bg-[rgba(9,10,14,0.58)]"
      : "border-border/80 bg-white/88 text-foreground hover:bg-white";

  const statusLabel = !enabled
    ? "Off"
    : isPlaying
      ? "Playing"
      : hasStarted
        ? "Resume"
        : "Start";

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
      aria-label={enabled ? "Mute palace background music" : "Play palace background music"}
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
          Palace music
        </span>
        <span className="block truncate text-sm font-semibold">
          宫乐 {statusLabel}
        </span>
      </span>
    </button>
  );
}
