import OpenAI from "openai";
import type { AnswerEvaluation } from "@/types";

/** Strict JSON shape from the model (documented for the prompt). */
export interface LlmAnswerEvaluationJson {
  fillerWords: number;
  clarityScore: number;
  confidenceScore: number;
  completenessScore: number;
  strengths: string[];
  weaknesses: string[];
  improvedTip: string;
}

const SYSTEM_PROMPT = `You are an expert interview coach. Evaluate a spoken-style written answer to an interview question.

Respond with ONLY a single JSON object and no other text. The JSON must match this shape exactly:
{
  "fillerWords": <non-negative integer: estimated count of filler words/phrases like "um", "uh", "like", "you know", "basically", "sort of", "kind of">,
  "clarityScore": <integer from 1 to 10>,
  "confidenceScore": <integer from 1 to 10>,
  "completenessScore": <integer from 1 to 10>,
  "strengths": <array of 2-4 short strings>,
  "weaknesses": <array of 2-4 short strings>,
  "improvedTip": <one concise paragraph with concrete advice>
}

Scoring rubric:
- clarityScore: structure, logical flow, easy to follow.
- confidenceScore: directness, hedging vs conviction (not arrogance).
- completenessScore: addresses the question, depth, examples where relevant.

Be fair and constructive. Use integers only for scores.`;

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function asStringArray(x: unknown, fallback: string[]): string[] {
  if (!Array.isArray(x)) return fallback;
  const out = x
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((s) => s.trim());
  return out.length ? out.slice(0, 6) : fallback;
}

/** Normalize parsed JSON; throws if unusable. */
export function parseLlmAnswerEvaluationJson(raw: unknown): LlmAnswerEvaluationJson {
  if (!isRecord(raw)) {
    throw new Error("Root JSON value must be an object");
  }

  const fillerWords = clampInt(Number(raw.fillerWords), 0, 500);
  const clarityScore = clampInt(Number(raw.clarityScore), 1, 10);
  const confidenceScore = clampInt(Number(raw.confidenceScore), 1, 10);
  const completenessScore = clampInt(Number(raw.completenessScore), 1, 10);
  const strengths = asStringArray(raw.strengths, ["Clear intent in parts of the answer"]);
  const weaknesses = asStringArray(raw.weaknesses, ["Could add more specificity"]);
  const improvedTip =
    typeof raw.improvedTip === "string" && raw.improvedTip.trim()
      ? raw.improvedTip.trim()
      : "Lead with a one-sentence thesis, then support with one concrete example.";

  return {
    fillerWords,
    clarityScore,
    confidenceScore,
    completenessScore,
    strengths,
    weaknesses,
    improvedTip,
  };
}

export function extractJsonObjectString(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fenced?.[1]) return fenced[1].trim();
  return trimmed;
}

export const DEFAULT_LLM_ANSWER_EVALUATION: LlmAnswerEvaluationJson = {
  fillerWords: 0,
  clarityScore: 6,
  confidenceScore: 6,
  completenessScore: 6,
  strengths: ["Answer addresses the topic at a high level"],
  weaknesses: ["Automated scoring was unavailable; keep practicing structure"],
  improvedTip:
    "Open with a clear takeaway, add one specific example with metrics, then close with what you learned.",
};

export function llmJsonToAnswerEvaluation(
  questionId: string,
  data: LlmAnswerEvaluationJson,
): AnswerEvaluation {
  const clarity = clampInt(data.clarityScore * 10, 0, 100);
  const confidence = clampInt(data.confidenceScore * 10, 0, 100);
  const completeness = clampInt(data.completenessScore * 10, 0, 100);

  const coachNote = [
    `Est. filler words: ${data.fillerWords}.`,
    data.improvedTip,
    `Strengths: ${data.strengths.slice(0, 2).join("; ")}`,
    `Watch: ${data.weaknesses.slice(0, 2).join("; ")}`,
  ].join(" ");

  return {
    questionId,
    clarity,
    confidence,
    completeness,
    coachNote,
  };
}

function buildUserContent(question: string, answer: string): string {
  return `Interview question:\n${question}\n\nCandidate answer:\n${answer}`;
}

export async function evaluateAnswerWithLlm(
  question: string,
  answer: string,
): Promise<LlmAnswerEvaluationJson> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_EVAL_MODEL ?? "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserContent(question, answer) },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty completion from model");
  }

  const jsonStr = extractJsonObjectString(content);
  const parsed = parseJsonLenient(jsonStr);
  return parseLlmAnswerEvaluationJson(parsed);
}

/** Parse JSON; if model adds prose, try the first {...} block. */
function parseJsonLenient(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Model output was not valid JSON");
  }
}
