import type { InterviewCoachApi } from "@/lib/api/interview-contracts";
import { mockInterviewApi } from "@/lib/mock/mock-interview-api";

/**
 * Central switch: return a real HTTP client in production and keep mocks for tests.
 */
export function getInterviewCoachApi(): InterviewCoachApi {
  return mockInterviewApi;
}
