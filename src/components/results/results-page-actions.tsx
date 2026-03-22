import Link from "next/link";

export function ResultsPageActions() {
  return (
    <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200/80 pt-8 dark:border-zinc-800">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Demo data — connect{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-900">
          endSession
        </code>{" "}
        to populate this from a real run.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        Start another session
      </Link>
    </div>
  );
}
