import type { AnswerEvaluation } from "@/types";

/**
 * Deterministic-ish mock scores from answer length (demo only).
 * Replace with model output later.
 */
export function createMockAnswerEvaluation(input: {
  questionId: string;
  answerText: string;
}): AnswerEvaluation {
  const len = input.answerText.trim().length;
  const base = Math.min(92, 58 + Math.floor(len / 40));
  const clarity = Math.min(100, base + (len > 120 ? 6 : 0));
  const confidence = Math.min(100, base - (len < 40 ? 8 : 0));
  const completeness = Math.min(100, base + (len > 200 ? 5 : -4));

  let coachNote =
    "Good pacing—tighten the opening thesis so the interviewer hears your recommendation in the first 20 seconds.";
  if (len < 50) {
    coachNote =
      "Answer is thin—add one concrete example and name one tradeoff you considered.";
  } else if (len > 280) {
    coachNote =
      "Strong detail—consider summarizing with a crisp closing line so it lands under time pressure.";
  }

  return {
    questionId: input.questionId,
    clarity,
    confidence,
    completeness,
    coachNote,
  };
}
