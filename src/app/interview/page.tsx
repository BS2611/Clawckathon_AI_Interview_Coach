import { InterviewRoomClient } from "@/components/interview";
import { searchParamsToInterviewConfig } from "@/lib/interview-config-params";
import Link from "next/link";

interface InterviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InterviewPage({ searchParams }: InterviewPageProps) {
  const sp = await searchParams;
  const raw = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") raw.set(k, v);
    else if (Array.isArray(v) && v[0]) raw.set(k, v[0]);
  }
  const config = searchParamsToInterviewConfig(raw);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Interview room
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        This route is next on the roadmap (question, transcript, metrics, timer).
      </p>
      {config ? (
        <InterviewRoomClient initialConfig={config} />
      ) : (
        <p className="mt-6 text-sm text-amber-700 dark:text-amber-400">
          Missing or invalid setup query params.{" "}
          <Link href="/" className="font-medium underline">
            Go back
          </Link>{" "}
          and start from the landing form.
        </p>
      )}
      <Link
        href="/"
        className="mt-8 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
      >
        ← Back to landing
      </Link>
    </div>
  );
}
