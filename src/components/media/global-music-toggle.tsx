"use client";

import { usePathname } from "next/navigation";
import { MusicToggleButton } from "@/components/media/music-toggle-button";

export function GlobalMusicToggle() {
  const pathname = usePathname();

  if (pathname === "/explore") {
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
