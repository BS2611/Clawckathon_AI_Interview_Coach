/**
 * Shared domain types for Interview Coach.
 * Keep API DTOs aligned with these shapes in `lib/api`.
 */

export type InterviewType =
  | "behavioral"
  | "technical"
  | "system_design"
  | "case_study"
  | "mixed";

export type ExperienceLevel =
  | "intern"
  | "new_grad"
  | "mid"
  | "senior"
  | "staff"
  | "executive";

/** Landing / session bootstrap: role, format, seniority. */
export interface InterviewConfig {
  roleTitle: string;
  interviewType: InterviewType;
  experienceLevel: ExperienceLevel;
}

export interface InterviewSession {
  id: string;
  setup: InterviewConfig;
  startedAtIso: string;
  /** Total planned duration in seconds (for timer UI). */
  durationSeconds: number;
}

/** A single interviewer prompt in the room flow. */
export interface Question {
  id: string;
  prompt: string;
  /** 1-based position in the planned question list. */
  order: number;
  interviewType?: InterviewType;
}

/** Per-answer coaching scores (e.g. after each response). */
export interface AnswerEvaluation {
  questionId: string;
  /** 0–100 */
  clarity: number;
  /** 0–100 */
  confidence: number;
  /** 0–100 */
  completeness: number;
  coachNote?: string;
}

export type TranscriptRole = "coach" | "candidate";

export interface TranscriptLine {
  id: string;
  role: TranscriptRole;
  text: string;
  timestampIso: string;
}

export interface LiveMetric {
  id: string;
  label: string;
  value: number;
  /** 0–100 for progress-style UI */
  score?: number;
  hint?: string;
}

export type ResultScoreCategory =
  | "clarity"
  | "confidence"
  | "completeness";

/** Per-dimension scores (0–100) on the closing report. */
export interface CategoryScore {
  category: ResultScoreCategory;
  label: string;
  score: number;
  blurb?: string;
}

/** End-of-session report payload (mock or API). */
export interface FinalReport {
  sessionId: string;
  overallScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  weakestAnswerOriginal?: string;
  summary: string;
}
