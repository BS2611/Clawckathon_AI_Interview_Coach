import {
  EXPERIENCE_LEVEL_OPTIONS,
  INTERVIEW_TYPE_OPTIONS,
} from "@/lib/constants/interview-options";
import type { ExperienceLevel, InterviewConfig, InterviewType } from "@/types";

const TYPE_SET = new Set<InterviewType>(
  INTERVIEW_TYPE_OPTIONS.map((o) => o.value),
);

const LEVEL_SET = new Set<ExperienceLevel>(
  EXPERIENCE_LEVEL_OPTIONS.map((o) => o.value),
);

export function isInterviewType(value: string): value is InterviewType {
  return TYPE_SET.has(value as InterviewType);
}

export function isExperienceLevel(value: string): value is ExperienceLevel {
  return LEVEL_SET.has(value as ExperienceLevel);
}

export function interviewConfigToSearchParams(
  config: InterviewConfig,
): URLSearchParams {
  const p = new URLSearchParams();
  p.set("role", config.roleTitle);
  p.set("type", config.interviewType);
  p.set("level", config.experienceLevel);
  return p;
}

export function searchParamsToInterviewConfig(
  params: URLSearchParams,
): InterviewConfig | null {
  const role = params.get("role");
  const type = params.get("type");
  const level = params.get("level");
  if (!role?.trim() || !type || !level) return null;
  if (!isInterviewType(type) || !isExperienceLevel(level)) return null;
  return {
    roleTitle: role.trim(),
    interviewType: type,
    experienceLevel: level,
  };
}
