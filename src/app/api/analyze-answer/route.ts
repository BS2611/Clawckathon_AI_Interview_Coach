import type {
  AnalyzeAnswerRequestBody,
  AnalyzeAnswerResponseBody,
  ApiErrorBody,
} from "@/lib/api/http-route-types";
import {
  DEFAULT_LLM_ANSWER_EVALUATION,
  evaluateAnswerWithLlm,
  llmJsonToAnswerEvaluation,
} from "@/lib/llm/answer-evaluation-llm";
import { getQuestionPromptForId } from "@/lib/llm/resolve-question-prompt";
import { createMockAnswerEvaluation } from "@/lib/mock/answer-evaluation-factory";
import type { AnswerEvaluation } from "@/types";
import { NextResponse } from "next/server";

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

  const { sessionId, questionId, answerText } = body as AnalyzeAnswerRequestBody;

  if (typeof sessionId !== "string" || !sessionId.trim()) {
    return NextResponse.json<ApiErrorBody>(
      { error: "sessionId is required" },
      { status: 400 },
    );
  }
  if (typeof questionId !== "string" || !questionId.trim()) {
    return NextResponse.json<ApiErrorBody>(
      { error: "questionId is required" },
      { status: 400 },
    );
  }
  if (typeof answerText !== "string") {
    return NextResponse.json<ApiErrorBody>(
      { error: "answerText must be a string" },
      { status: 400 },
    );
  }

  const qid = questionId.trim();
  const question = getQuestionPromptForId(qid);
  const answer = answerText;

  let evaluation: AnswerEvaluation;

  try {
    const llm = await evaluateAnswerWithLlm(question, answer);
    evaluation = llmJsonToAnswerEvaluation(qid, llm);
  } catch {
    try {
      evaluation = llmJsonToAnswerEvaluation(
        qid,
        DEFAULT_LLM_ANSWER_EVALUATION,
      );
    } catch {
      evaluation = createMockAnswerEvaluation({
        questionId: qid,
        answerText: answer,
      });
    }
  }

  return NextResponse.json<AnalyzeAnswerResponseBody>({ evaluation });
}
