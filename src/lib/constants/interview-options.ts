import type { ExperienceLevel, InterviewType } from "@/types";

export const INTERVIEW_TYPE_OPTIONS: ReadonlyArray<{
  value: InterviewType;
  label: string;
  description: string;
}> = [
  {
    value: "behavioral",
    label: "Behavioral",
    description: "STAR-style stories, culture fit, leadership",
  },
  {
    value: "technical",
    label: "Technical",
    description: "Coding, algorithms, stack depth",
  },
  {
    value: "system_design",
    label: "System design",
    description: "Architecture, tradeoffs, scale",
  },
  {
    value: "case_study",
    label: "Case study",
    description: "Structured problem solving, estimation",
  },
  {
    value: "mixed",
    label: "Mixed",
    description: "A realistic blend of formats",
  },
];

export const EXPERIENCE_LEVEL_OPTIONS: ReadonlyArray<{
  value: ExperienceLevel;
  label: string;
}> = [
  { value: "intern", label: "Intern" },
  { value: "new_grad", label: "New grad" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "staff", label: "Staff / principal" },
  { value: "executive", label: "Executive / director" },
];
