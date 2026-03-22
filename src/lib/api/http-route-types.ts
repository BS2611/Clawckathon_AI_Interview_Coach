import type {
  AnswerEvaluation,
  FinalReport,
  InterviewConfig,
  InterviewSession,
} from "@/types";

/** POST /api/start-session */
export interface StartSessionRequestBody {
  setup: InterviewConfig;
}

export interface StartSessionResponseBody {
  session: InterviewSession;
}

/** POST /api/analyze-answer */
export interface AnalyzeAnswerRequestBody {
  sessionId: string;
  questionId: string;
  answerText: string;
}

export interface AnalyzeAnswerResponseBody {
  evaluation: AnswerEvaluation;
}

/** POST /api/final-report */
export interface FinalReportRequestBody {
  sessionId: string;
  /** All /api/analyze-answer evaluations from the session (order preserved). */
  evaluations: AnswerEvaluation[];
}

export interface FinalReportResponseBody {
  results: FinalReport;
}

export interface ApiErrorBody {
  error: string;
}
