import type { InterviewConfig, InterviewSession } from "@/types";

export function createMockSession(setup: InterviewConfig): InterviewSession {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sess_${Date.now()}`;

  return {
    id,
    setup,
    startedAtIso: new Date().toISOString(),
    durationSeconds: 25 * 60,
  };
}
