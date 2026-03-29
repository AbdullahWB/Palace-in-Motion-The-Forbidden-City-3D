"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GuideMode, GuideRequest, GuideResponse } from "@/types/ai-guide";
import type { HeritageZoneId } from "@/types/content";

type GuidePanelProps = {
  sceneId: string;
  contextLabel: string;
  hotspotId?: HeritageZoneId | null;
  tourStepId?: string | null;
  className?: string;
};

const guideModes: Array<{ value: GuideMode; label: string }> = [
  { value: "short", label: "Short" },
  { value: "detailed", label: "Detailed" },
  { value: "fun", label: "Fun" },
];

const starterQuestions = [
  "How does symmetry shape this part of the palace?",
  "Why is this stop important in ceremonial terms?",
  "What changes as the route moves toward the inner court?",
];

export function GuidePanel({
  sceneId,
  contextLabel,
  hotspotId = null,
  tourStepId = null,
  className,
}: GuidePanelProps) {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<GuideMode>("short");
  const [response, setResponse] = useState<GuideResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    setResponse(null);
    setError(null);
  }, [contextLabel, hotspotId, sceneId, tourStepId]);

  function applyStarterQuestion(nextQuestion: string) {
    setQuestion(nextQuestion);
    setError(null);
    textareaRef.current?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Enter a question about the current scene or stop.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: GuideRequest = {
        sceneId,
        hotspotId,
        tourStepId,
        question: trimmedQuestion,
        mode,
      };

      const result = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await result.json()) as GuideResponse & { error?: string };

      if (!result.ok) {
        throw new Error(data.error ?? "The AI guide could not answer right now.");
      }

      setResponse(data);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The AI guide could not answer right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <aside className={cn("paper-panel rounded-[1.8rem] border border-border p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            AI cultural guide
          </p>
          <h2 className="mt-3 font-display text-3xl text-foreground">
            Ask from the current scene
          </h2>
        </div>

        <span className="rounded-full border border-accent/15 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
          Helper layer
        </span>
      </div>

      <p className="mt-3 text-sm leading-7 text-muted">
        The guide stays grounded in the current scene, stop, and local heritage
        content instead of answering as a generic chatbot.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-accent/15 bg-accent/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
          {contextLabel}
        </span>
        {hotspotId ? (
          <span className="rounded-full border border-accent/15 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
            Hotspot active
          </span>
        ) : null}
        {tourStepId ? (
          <span className="rounded-full border border-accent/15 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
            Guided step
          </span>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {guideModes.map((guideMode) => {
            const isActive = mode === guideMode.value;

            return (
              <button
                key={guideMode.value}
                type="button"
                onClick={() => setMode(guideMode.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold",
                  isActive
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white/80 text-foreground hover:bg-white"
                )}
              >
                {guideMode.label}
              </button>
            );
          })}
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Your question
          </span>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
            placeholder="Ask about symmetry, ceremonial meaning, or the current zone."
            className="mt-2 w-full rounded-[1.25rem] border border-border bg-white/85 px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-accent/30"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold",
            isSubmitting
              ? "cursor-wait border-border bg-white/60 text-muted"
              : "border-accent bg-accent text-white hover:-translate-y-0.5 hover:bg-accent-strong"
          )}
        >
          {isSubmitting ? "Consulting guide..." : "Ask the guide"}
        </button>
      </form>

      <div aria-live="polite" className="mt-4">
        {error ? (
          <p className="rounded-[1.1rem] border border-accent/15 bg-accent/8 px-4 py-3 text-sm leading-6 text-muted">
            {error}
          </p>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          {response ? (
            <motion.div
              key="response"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
              }
              className="rounded-[1.45rem] border border-accent/15 bg-accent/8 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                  Latest answer
                </p>
                <span className="rounded-full border border-accent/15 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
                  {response.fallback ? "Local fallback" : "AI response"}
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-muted">{response.answer}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-accent/15 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
                  {response.contextLabel}
                </span>
                <span className="rounded-full border border-accent/15 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
                  {response.mode}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
              }
              className="rounded-[1.45rem] border border-accent/15 bg-accent/8 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Starter questions
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Use the current scene as your anchor. The guide answers best when
                the question stays tied to symmetry, hierarchy, thresholds, or
                the meaning of the selected stop.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {starterQuestions.map((starterQuestion) => (
                  <button
                    key={starterQuestion}
                    type="button"
                    onClick={() => applyStarterQuestion(starterQuestion)}
                    className="rounded-full border border-accent/15 bg-white/78 px-4 py-2 text-left text-sm font-medium text-foreground hover:border-accent/25 hover:bg-white"
                  >
                    {starterQuestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
