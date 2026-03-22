import type {
  AnswerEvaluation,
  FinalReport,
  InterviewConfig,
  InterviewSession,
} from "@/types";

/** Wire these DTOs to your backend or edge functions later. */
export interface StartInterviewRequest {
  setup: InterviewConfig;
}

export interface StartInterviewResponse {
  session: InterviewSession;
}

export interface EndInterviewRequest {
  sessionId: string;
  /** When omitted, mock implementations may synthesize a minimal evaluation. */
  evaluations?: AnswerEvaluation[];
}

export interface EndInterviewResponse {
  results: FinalReport;
}

/**
 * Contract for any transport (REST, tRPC, server actions).
 * Implement with real HTTP; swap the default export in one place.
 */
export interface InterviewCoachApi {
  startSession(body: StartInterviewRequest): Promise<StartInterviewResponse>;
  endSession(body: EndInterviewRequest): Promise<EndInterviewResponse>;
}
