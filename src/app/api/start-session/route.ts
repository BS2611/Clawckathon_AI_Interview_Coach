import type {
  ApiErrorBody,
  StartSessionRequestBody,
  StartSessionResponseBody,
} from "@/lib/api/http-route-types";
import {
  isExperienceLevel,
  isInterviewType,
} from "@/lib/interview-config-params";
import { createMockSession } from "@/lib/mock/session-factory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorBody>(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const setup = (body as StartSessionRequestBody)?.setup;
  if (!setup || typeof setup !== "object") {
    return NextResponse.json<ApiErrorBody>(
      { error: "Missing setup object" },
      { status: 400 },
    );
  }

  const { roleTitle, interviewType, experienceLevel } = setup;
  if (typeof roleTitle !== "string" || !roleTitle.trim()) {
    return NextResponse.json<ApiErrorBody>(
      { error: "setup.roleTitle is required" },
      { status: 400 },
    );
  }
  if (typeof interviewType !== "string" || !isInterviewType(interviewType)) {
    return NextResponse.json<ApiErrorBody>(
      { error: "setup.interviewType is invalid" },
      { status: 400 },
    );
  }
  if (typeof experienceLevel !== "string" || !isExperienceLevel(experienceLevel)) {
    return NextResponse.json<ApiErrorBody>(
      { error: "setup.experienceLevel is invalid" },
      { status: 400 },
    );
  }

  const session = createMockSession({
    roleTitle: roleTitle.trim(),
    interviewType,
    experienceLevel,
  });

  return NextResponse.json<StartSessionResponseBody>({ session });
}
