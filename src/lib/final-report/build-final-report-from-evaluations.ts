import type {
  AnswerEvaluation,
  CategoryScore,
  FinalReport,
  ResultScoreCategory,
} from "@/types";

function roundScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function blurbForDimension(score: number): string {
  if (score >= 75) return "Strong average across your answers.";
  if (score >= 55) return "Solid with room to refine.";
  return "Priority area for your next practice session.";
}

function trimNote(note: string, max = 160): string {
  const t = note.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

type WithAvg = { evaluation: AnswerEvaluation; avg: number };

function summarizeStrength(e: AnswerEvaluation, avg: number): string {
  const note = e.coachNote?.trim();
  if (note) return trimNote(note, 200);
  return `Stronger performance on this response (average score ${Math.round(avg)}).`;
}

function summarizeWeakness(e: AnswerEvaluation, avg: number): string {
  const note = e.coachNote?.trim();
  if (note) return `Focus next: ${trimNote(note, 180)}`;
  return `Scores were lower on this answer (average ${Math.round(avg)}); add examples and structure.`;
}

function uniqueStrings(items: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of items) {
    const k = s.trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(k);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Builds a session report from per-answer evaluations returned by /api/analyze-answer.
 */
export function buildFinalReportFromEvaluations(
  sessionId: string,
  evaluations: AnswerEvaluation[],
): FinalReport {
  if (!evaluations.length) {
    throw new Error("evaluations must be a non-empty array");
  }

  const n = evaluations.length;
  const clarityAvg = average(evaluations.map((e) => e.clarity));
  const confidenceAvg = average(evaluations.map((e) => e.confidence));
  const completenessAvg = average(evaluations.map((e) => e.completeness));

  const overallScore = roundScore(
    (clarityAvg + confidenceAvg + completenessAvg) / 3,
  );

  const categoryScores: CategoryScore[] = (
    [
      ["clarity", "Clarity", clarityAvg],
      ["confidence", "Confidence", confidenceAvg],
      ["completeness", "Completeness", completenessAvg],
    ] as const
  ).map(([category, label, avg]) => ({
    category: category as ResultScoreCategory,
    label,
    score: roundScore(avg),
    blurb: blurbForDimension(roundScore(avg)),
  }));

  const withAvg: WithAvg[] = evaluations.map((evaluation) => ({
    evaluation,
    avg:
      (evaluation.clarity + evaluation.confidence + evaluation.completeness) / 3,
  }));

  const sorted = [...withAvg].sort((a, b) => a.avg - b.avg);
  const weakest = sorted[0]!;

  const strengthCandidates = [...sorted]
    .reverse()
    .map(({ evaluation, avg }) => summarizeStrength(evaluation, avg));
  const weaknessCandidates = sorted.map(({ evaluation, avg }) =>
    summarizeWeakness(evaluation, avg),
  );

  const strengths = uniqueStrings(strengthCandidates, 4);
  const weaknesses = uniqueStrings(weaknessCandidates, 4);

  const improvedTip =
    weakest.evaluation.coachNote?.trim() ||
    "Lead with a one-sentence takeaway, then one concrete example with metrics, then a short closing line.";

  const improvedAnswer = `Apply this feedback on your next attempt: ${trimNote(improvedTip, 400)}`;

  let summary = `Across ${n} answer${n === 1 ? "" : "s"}, your overall score was ${overallScore}/100 (clarity ${roundScore(clarityAvg)}, confidence ${roundScore(confidenceAvg)}, completeness ${roundScore(completenessAvg)}). `;
  if (overallScore >= 75) {
    summary +=
      "Strong, consistent communication—keep iterating on specifics under time pressure.";
  } else if (overallScore >= 55) {
    summary +=
      "Good foundation—tighten structure, examples, and closing summaries.";
  } else {
    summary +=
      "Keep practicing: prioritize a clear thesis, one solid example, and explicit tradeoffs.";
  }

  return {
    sessionId,
    overallScore,
    categoryScores,
    strengths:
      strengths.length > 0
        ? strengths
        : ["You completed all prompts—keep building on this baseline."],
    weaknesses:
      weaknesses.length > 0
        ? weaknesses
        : ["Add more concrete detail and signal confidence without hedging."],
    improvedAnswer,
    weakestAnswerOriginal: undefined,
    summary,
  };
}
