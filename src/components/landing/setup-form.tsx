"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InputField,
  SelectField,
} from "@/components/ui";
import {
  EXPERIENCE_LEVEL_OPTIONS,
  INTERVIEW_TYPE_OPTIONS,
} from "@/lib/constants/interview-options";
import { interviewConfigToSearchParams } from "@/lib/interview-config-params";
import type { ExperienceLevel, InterviewType } from "@/types";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const defaultType: InterviewType = INTERVIEW_TYPE_OPTIONS[0]!.value;
const defaultLevel: ExperienceLevel = EXPERIENCE_LEVEL_OPTIONS[2]!.value;

export function SetupForm() {
  const router = useRouter();
  const [roleTitle, setRoleTitle] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>(defaultType);
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>(defaultLevel);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = roleTitle.trim();
    if (!trimmed) {
      setError("Add a role title so the coach can tailor questions.");
      return;
    }
    setError(null);
    const params = interviewConfigToSearchParams({
      roleTitle: trimmed,
      interviewType,
      experienceLevel,
    });
    router.push(`/interview?${params.toString()}`);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Session setup</CardTitle>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Mock flow: we pass these as query params; the interview room can read
          them until you wire a real session API.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <InputField
            id="role"
            name="role"
            label="Role"
            placeholder="e.g. Senior frontend engineer"
            value={roleTitle}
            onChange={(ev) => setRoleTitle(ev.target.value)}
            autoComplete="organization-title"
            required
          />

          <SelectField<InterviewType>
            id="interview-type"
            name="interviewType"
            label="Interview type"
            value={interviewType}
            onChange={(ev) =>
              setInterviewType(ev.target.value as InterviewType)
            }
            options={INTERVIEW_TYPE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            hint={INTERVIEW_TYPE_OPTIONS.find((o) => o.value === interviewType)?.description}
          />

          <SelectField<ExperienceLevel>
            id="experience-level"
            name="experienceLevel"
            label="Experience level"
            value={experienceLevel}
            onChange={(ev) =>
              setExperienceLevel(ev.target.value as ExperienceLevel)
            }
            options={[...EXPERIENCE_LEVEL_OPTIONS]}
          />

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" className="min-w-[160px]">
              Start mock interview
            </Button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Next: interview room page
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
