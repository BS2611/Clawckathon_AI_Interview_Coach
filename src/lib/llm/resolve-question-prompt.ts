import { MOCK_INTERVIEW_QUESTIONS } from "@/lib/constants/mock-interview-questions";

/** Resolve question text on the server from id (matches client mock list). */
export function getQuestionPromptForId(questionId: string): string {
  const q = MOCK_INTERVIEW_QUESTIONS.find((x) => x.id === questionId);
  return q?.prompt ?? `Interview question (id: ${questionId})`;
}
