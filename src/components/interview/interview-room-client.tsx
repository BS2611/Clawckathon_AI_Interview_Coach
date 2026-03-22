"use client";

import { InterviewLiveMetrics } from "./interview-live-metrics";
import { MOCK_INTERVIEW_QUESTIONS } from "@/lib/constants/mock-interview-questions";
import { FINAL_REPORT_STORAGE_KEY } from "@/lib/constants/storage-keys";
import { cn } from "@/lib/cn";
import type {
  AnalyzeAnswerResponseBody,
  FinalReportResponseBody,
  StartSessionResponseBody,
} from "@/lib/api/http-route-types";
import type {
  AnswerEvaluation,
  InterviewConfig,
  InterviewSession,
} from "@/types";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface InterviewRoomClientProps {
  initialConfig: InterviewConfig;
}

export function InterviewRoomClient({ initialConfig }: InterviewRoomClientProps) {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [evaluations, setEvaluations] = useState<AnswerEvaluation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerDraft, setAnswerDraft] = useState("");
  const [pipelineBusy, setPipelineBusy] = useState(false);
  const submitLockRef = useRef(false);

  const currentQuestion = MOCK_INTERVIEW_QUESTIONS[questionIndex];
  const allAnswered = questionIndex >= MOCK_INTERVIEW_QUESTIONS.length;

  const latestEvaluation = useMemo(
    () => (evaluations.length ? evaluations[evaluations.length - 1]! : null),
    [evaluations],
  );

  const busy = bootLoading || analyzing || finishing || pipelineBusy;

  const speech = useSpeechToText({
    value: answerDraft,
    onChange: setAnswerDraft,
    disabled: busy,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setBootLoading(true);
      try {
        const res = await fetch("/api/start-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setup: initialConfig }),
        });
        const data = (await res.json()) as
          | StartSessionResponseBody
          | { error?: string };
        if (!res.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Failed to start session",
          );
        }
        if (!cancelled) {
          setSession((data as StartSessionResponseBody).session);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to start session");
        }
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialConfig]);

  const finishInterview = useCallback(
    async (
      activeSession: InterviewSession,
      sessionEvaluations: AnswerEvaluation[],
    ) => {
      setFinishing(true);
      setError(null);
      try {
        const res = await fetch("/api/final-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSession.id,
            evaluations: sessionEvaluations,
          }),
        });
        const data = (await res.json()) as
          | FinalReportResponseBody
          | { error?: string };
        if (!res.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Failed to load final report",
          );
        }
        const { results } = data as FinalReportResponseBody;
        console.log("[Interview Coach] Saving final report to localStorage", {
          sessionId: results.sessionId,
        });
        localStorage.setItem(FINAL_REPORT_STORAGE_KEY, JSON.stringify(results));
        router.push("/results");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to finish interview");
      } finally {
        setFinishing(false);
      }
    },
    [router],
  );

  const submitAnswer = async () => {
    if (
      submitLockRef.current ||
      pipelineBusy ||
      !session ||
      !currentQuestion ||
      analyzing ||
      finishing ||
      bootLoading
    ) {
      return;
    }
    const text = answerDraft.trim();
    if (!text) return;

    submitLockRef.current = true;
    setPipelineBusy(true);
    setAnalyzing(true);
    setError(null);
    let shouldFinish = false;
    let nextEvaluations: AnswerEvaluation[] = [];
    try {
      const res = await fetch("/api/analyze-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          questionId: currentQuestion.id,
          answerText: text,
        }),
      });
      const data = (await res.json()) as
        | AnalyzeAnswerResponseBody
        | { error?: string };
      if (!res.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Failed to analyze answer",
        );
      }
      const { evaluation } = data as AnalyzeAnswerResponseBody;
      nextEvaluations = [...evaluations, evaluation];
      setEvaluations(nextEvaluations);
      setAnswerDraft("");
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      shouldFinish = nextIndex >= MOCK_INTERVIEW_QUESTIONS.length;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze answer");
    } finally {
      setAnalyzing(false);
    }

    try {
      if (shouldFinish && session && nextEvaluations.length > 0) {
        await finishInterview(session, nextEvaluations);
      }
    } finally {
      submitLockRef.current = false;
      setPipelineBusy(false);
    }
  };

  const snapshot: Record<string, unknown> = {
    setup: initialConfig,
    session,
    evaluations,
    currentQuestion: allAnswered ? null : currentQuestion,
  };

  return (
    <>
      {error ? (
        <p className="mt-6 text-sm text-amber-700 dark:text-amber-400">
          {error}
        </p>
      ) : null}

      <InterviewLiveMetrics
        latest={latestEvaluation}
        isAnalyzing={analyzing}
      />

      {latestEvaluation?.coachNote ? (
        <div
          className={cn(
            "mt-4 rounded-xl border border-zinc-200/90 bg-white/70 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950/50",
            analyzing && "opacity-60",
          )}
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Coach note
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {latestEvaluation.coachNote}
          </p>
        </div>
      ) : null}

      <pre className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        {JSON.stringify(snapshot, null, 2)}
      </pre>

      {session && !allAnswered && currentQuestion ? (
        <div
          className="mt-6 space-y-3"
          aria-busy={analyzing || pipelineBusy}
        >
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {currentQuestion.prompt}
          </p>
          <div className="flex items-start gap-2">
            <textarea
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              disabled={busy || speech.isRecording}
              rows={4}
              className="min-h-[7rem] w-full min-w-0 flex-1 resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              placeholder="Type your answer…"
            />
            <button
              type="button"
              onClick={() => speech.toggleRecording()}
              disabled={busy || !speech.browserSupported}
              aria-label={
                speech.isRecording ? "Stop voice input" : "Start voice input"
              }
              aria-pressed={speech.isRecording}
              className={cn(
                "mt-0 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
                speech.isRecording &&
                  "border-red-400/80 bg-red-50 text-red-700 motion-safe:animate-pulse dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-300",
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
            </button>
          </div>
          {speech.isRecording ? (
            <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
              <span
                className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500 motion-reduce:animate-none"
                aria-hidden
              />
              Listening…
            </div>
          ) : null}
          {!speech.browserSupported ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Voice input not supported in this browser
            </p>
          ) : null}
          {speech.speechError ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {speech.speechError}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void submitAnswer()}
              disabled={busy || !answerDraft.trim()}
              aria-busy={analyzing}
              className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
            >
              {analyzing
                ? "Analyzing…"
                : finishing
                  ? "Generating results…"
                  : "Submit answer"}
            </button>
            {analyzing ? (
              <span className="text-xs font-medium text-[var(--accent)]">
                Analyzing…
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
