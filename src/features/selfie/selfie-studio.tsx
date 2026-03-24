"use client";

import { postcardFrames } from "@/data/selfie";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

const frameStyles = {
  "imperial-red": {
    frame: "border-[#8a2230] bg-gradient-to-br from-[#fff6ef] via-[#f5e5d6] to-[#efd7c0]",
    ribbon: "bg-[#8a2230] text-white",
  },
  "sunlit-bronze": {
    frame: "border-[#b78a4c] bg-gradient-to-br from-[#fff8ee] via-[#f0e1c7] to-[#e8d1a8]",
    ribbon: "bg-[#b78a4c] text-[#2a1e16]",
  },
  "jade-ink": {
    frame: "border-[#29453c] bg-gradient-to-br from-[#f2f1ea] via-[#dde6dd] to-[#c9d8ce]",
    ribbon: "bg-[#29453c] text-white",
  },
} as const;

export function SelfieStudio() {
  const selectedPostcardFrame = useAppStore(
    (state) => state.selectedPostcardFrame
  );
  const setSelectedPostcardFrame = useAppStore(
    (state) => state.setSelectedPostcardFrame
  );

  const activeFrame =
    postcardFrames.find((frame) => frame.id === selectedPostcardFrame) ??
    postcardFrames[0];
  const activeStyle = frameStyles[activeFrame.accentToken];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_24rem]">
      <section
        className={cn(
          "paper-panel rounded-[1.9rem] border p-6 md:p-8",
          activeStyle.frame
        )}
      >
        <div className="rounded-[1.5rem] border border-white/70 bg-white/55 p-5 backdrop-blur md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Postcard preview
              </p>
              <h2 className="mt-3 font-display text-4xl text-foreground">
                Palace memory card
              </h2>
            </div>
            <div
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]",
                activeStyle.ribbon
              )}
            >
              {activeFrame.title}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_16rem]">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-5">
              <div className="flex h-[24rem] items-center justify-center rounded-[1.2rem] border border-dashed border-accent/20 bg-gradient-to-br from-white/80 to-white/40">
                <div className="max-w-xs text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                    Future capture area
                  </p>
                  <p className="mt-3 font-display text-3xl text-foreground">
                    Visitor portrait or scene snapshot
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    This preview is intentionally static for now. Upload, camera
                    capture, and export flows are deferred to the next stage.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/70 bg-white/65 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Message panel
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                Greetings from the Forbidden City.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted">
                A future version of this route can add user captions, templates,
                localization, and downloadable share formats.
              </p>
            </div>
          </div>
        </div>
      </section>

      <aside className="paper-panel rounded-[1.8rem] border border-border p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
          Frame selection
        </p>
        <h3 className="mt-3 font-display text-3xl text-foreground">
          Choose a postcard mood
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted">
          Frame choice is already connected to the global store so later media
          tools can reuse the same state.
        </p>

        <div className="mt-6 space-y-3">
          {postcardFrames.map((frame) => {
            const isActive = frame.id === activeFrame.id;

            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => setSelectedPostcardFrame(frame.id)}
                className={cn(
                  "w-full rounded-[1.35rem] border px-4 py-4 text-left",
                  isActive
                    ? "border-accent/25 bg-accent/10"
                    : "border-border bg-white/80 hover:bg-white"
                )}
              >
                <p className="font-semibold text-foreground">{frame.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Accent token: {frame.accentToken}
                </p>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
