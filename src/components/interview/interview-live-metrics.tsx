"use client";

import { cn } from "@/lib/cn";
import type { AnswerEvaluation } from "@/types";
import { useEffect, useState } from "react";

type MetricKey = "clarity" | "confidence" | "completeness";

const ROWS: { key: MetricKey; label: string }[] = [
  { key: "clarity", label: "Clarity" },
  { key: "confidence", label: "Confidence" },
  { key: "completeness", label: "Completeness" },
];

export interface InterviewLiveMetricsProps {
  latest: AnswerEvaluation | null;
  isAnalyzing: boolean;
}

export function InterviewLiveMetrics({
  latest,
  isAnalyzing,
}: InterviewLiveMetricsProps) {
  const [scoreBump, setScoreBump] = useState(false);
  const scoresSig = latest
    ? `${latest.clarity}-${latest.confidence}-${latest.completeness}`
    : "";

  useEffect(() => {
    if (!scoresSig) return;
    setScoreBump(true);
    const id = window.setTimeout(() => setScoreBump(false), 520);
    return () => window.clearTimeout(id);
  }, [scoresSig]);

  return (
    <div
      className={cn(
        "relative mt-4 rounded-xl border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40",
        isAnalyzing && "ring-1 ring-[var(--accent)]/25",
      )}
    >
      {isAnalyzing ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] rounded-xl bg-zinc-100/50 animate-pulse dark:bg-zinc-950/40"
          aria-hidden
        />
      ) : null}

      <div className="relative flex items-center justify-between border-b border-zinc-200/90 px-3 py-2 dark:border-zinc-800">
        <span className="sr-only" aria-live="polite">
          {isAnalyzing ? "Analyzing your answer." : ""}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Live metrics
        </span>
        <div className="flex items-center gap-2">
          {isAnalyzing ? (
            <>
              <span
                className="inline-flex h-2 w-2 rounded-full bg-[var(--accent)] opacity-90 motion-safe:animate-pulse"
                aria-hidden
              />
              <span className="text-xs font-medium text-[var(--accent)]">
                Analyzing…
              </span>
            </>
          ) : (
            <span
              className="inline-flex h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600"
              aria-hidden
            />
          )}
        </div>
      </div>

      <div className="relative space-y-3 p-3">
        {ROWS.map(({ key, label }) => {
          const raw = latest?.[key];
          const pct =
            typeof raw === "number" && Number.isFinite(raw)
              ? Math.min(100, Math.max(0, raw))
              : null;

          return (
            <div
              key={key}
              className={cn(
                scoreBump &&
                  pct != null &&
                  "motion-safe:animate-interview-metric-row",
              )}
            >
              <div className="mb-1 flex justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <span>{label}</span>
                <span
                  className={cn(
                    "tabular-nums text-zinc-800 transition-all duration-300 dark:text-zinc-200",
                    isAnalyzing && "opacity-60",
                    scoreBump && pct != null && "text-[var(--accent)]",
                  )}
                >
                  {pct != null ? `${Math.round(pct)}` : "—"}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-800">
                <div
                  className={cn(
                    "h-full origin-left rounded-full bg-[var(--accent)] will-change-[width,transform]",
                    "transition-[width] duration-500 ease-out motion-reduce:transition-none",
                    isAnalyzing && "opacity-70",
                    scoreBump &&
                      pct != null &&
                      "motion-safe:animate-interview-metric-bar",
                  )}
                  style={{ width: pct != null ? `${pct}%` : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
