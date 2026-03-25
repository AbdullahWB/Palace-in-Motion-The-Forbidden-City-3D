"use client";

import Link from "next/link";
import { siteOverview } from "@/data/heritage/site-overview";

type TourCompletionProps = {
  onRestart: () => void;
};

export function TourCompletion({ onRestart }: TourCompletionProps) {
  return (
    <aside className="paper-panel h-fit rounded-[1.8rem] border border-border p-6 xl:sticky xl:top-28">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
        Tour complete
      </p>

      <h2 className="mt-3 font-display text-4xl leading-tight text-foreground">
        The guided route is complete.
      </h2>

      <p className="mt-4 text-sm leading-7 text-muted">
        {siteOverview.completionSummary}
      </p>

      <div className="mt-6 rounded-[1.45rem] border border-accent/15 bg-accent/8 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
          Completion
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-accent/10">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-accent to-accent-soft" />
        </div>
        <p className="mt-4 text-sm leading-7 text-muted">
          Restart to revisit the six stops or return to the free exploration
          view to inspect the same scene without guided pacing.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-4 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-accent-strong"
        >
          Restart tour
        </button>

        <Link
          href="/explore"
          className="inline-flex items-center justify-center rounded-full border border-border bg-white/82 px-4 py-3 text-sm font-semibold text-foreground hover:-translate-y-0.5 hover:bg-white"
        >
          Back to explore
        </Link>
      </div>
    </aside>
  );
}
