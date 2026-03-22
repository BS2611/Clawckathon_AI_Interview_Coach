import type { InterviewCoachApi } from "@/lib/api/interview-contracts";
import { buildFinalReportFromEvaluations } from "@/lib/final-report/build-final-report-from-evaluations";
import { createMockSession } from "@/lib/mock/session-factory";
import type { AnswerEvaluation } from "@/types";

const FALLBACK_EVALUATIONS: AnswerEvaluation[] = [
  {
    questionId: "mock",
    clarity: 50,
    confidence: 50,
    completeness: 50,
    coachNote:
      "No per-answer evaluations were passed to this mock endSession call.",
  },
];

/** Deterministic mock for demos; replace with `fetch` implementation. */
export const mockInterviewApi: InterviewCoachApi = {
  async startSession({ setup }) {
    await new Promise((r) => setTimeout(r, 400));
    return { session: createMockSession(setup) };
  },

  async endSession({ sessionId, evaluations }) {
    await new Promise((r) => setTimeout(r, 500));
    const evals =
      evaluations?.length && evaluations.length > 0
        ? evaluations
        : FALLBACK_EVALUATIONS;
    return { results: buildFinalReportFromEvaluations(sessionId, evals) };
  },
};
