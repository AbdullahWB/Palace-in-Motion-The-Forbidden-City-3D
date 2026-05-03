"use client";

import { usePathname } from "next/navigation";
import { MusicToggleButton } from "@/components/media/music-toggle-button";
import { isGlobalMusicHiddenPathname } from "@/lib/app-routes";

export function GlobalMusicToggle() {
  const pathname = usePathname();

  if (isGlobalMusicHiddenPathname(pathname)) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-[5.75rem] z-[44]">
      <MusicToggleButton
        className="pointer-events-auto"
        tone="light"
      />
    </div>
  );
}
