import type {
  ApiErrorBody,
  FinalReportRequestBody,
  FinalReportResponseBody,
} from "@/lib/api/http-route-types";
import type { AnswerEvaluation } from "@/types";
import { buildFinalReportFromEvaluations } from "@/lib/final-report/build-final-report-from-evaluations";
import { NextResponse } from "next/server";

function isValidEvaluation(x: unknown): x is AnswerEvaluation {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.questionId === "string" &&
    typeof o.clarity === "number" &&
    typeof o.confidence === "number" &&
    typeof o.completeness === "number"
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorBody>(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { sessionId, evaluations } = body as FinalReportRequestBody;

  if (typeof sessionId !== "string" || !sessionId.trim()) {
    return NextResponse.json<ApiErrorBody>(
      { error: "sessionId is required" },
      { status: 400 },
    );
  }

  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    return NextResponse.json<ApiErrorBody>(
      {
        error:
          "evaluations must be a non-empty array of answer evaluations from your session",
      },
      { status: 400 },
    );
  }

  const cleaned: AnswerEvaluation[] = [];
  for (const item of evaluations) {
    if (!isValidEvaluation(item)) {
      return NextResponse.json<ApiErrorBody>(
        { error: "Each evaluation must include questionId, clarity, confidence, completeness" },
        { status: 400 },
      );
    }
    cleaned.push({
      questionId: item.questionId,
      clarity: item.clarity,
      confidence: item.confidence,
      completeness: item.completeness,
      coachNote: item.coachNote,
    });
  }

  console.log("[Interview Coach] Building final report from evaluations", {
    sessionId: sessionId.trim(),
    count: cleaned.length,
    evaluations: cleaned,
  });

  let results: FinalReportResponseBody["results"];
  try {
    results = buildFinalReportFromEvaluations(sessionId.trim(), cleaned);
  } catch (e) {
    console.warn("[Interview Coach] Failed to build final report", e);
    return NextResponse.json<ApiErrorBody>(
      { error: "Could not build final report from evaluations" },
      { status: 422 },
    );
  }

  console.log("[Interview Coach] Computed final report", {
    sessionId: results.sessionId,
    overallScore: results.overallScore,
    categoryScores: results.categoryScores,
    strengthsCount: results.strengths.length,
    weaknessesCount: results.weaknesses.length,
  });

  return NextResponse.json<FinalReportResponseBody>({ results });
}
