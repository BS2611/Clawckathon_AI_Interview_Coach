import type { Question } from "@/types";

/** Client-side question list until GET /api/next-question exists */
export const MOCK_INTERVIEW_QUESTIONS: Question[] = [
  {
    id: "q1",
    order: 1,
    prompt:
      "Tell me about a time you influenced a technical decision when you did not have formal authority.",
  },
  {
    id: "q2",
    order: 2,
    prompt:
      "Walk me through how you would debug a sudden latency spike affecting one service in production.",
  },
  {
    id: "q3",
    order: 3,
    prompt: "Where do you want to grow professionally over the next 12 months?",
  },
];
