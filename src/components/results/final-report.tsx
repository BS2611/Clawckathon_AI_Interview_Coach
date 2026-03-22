import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { CategoryScore, FinalReport } from "@/types";

export interface FinalReportViewProps {
  report: FinalReport;
  /** Display scale for the headline score (default 100). */
  maxScore?: number;
  /** Page-level title, e.g. session complete. */
  headline?: string;
  className?: string;
}

/** Derives a one-line insight from real category scores only (no mock data). */
function categoryInsight(report: FinalReport): string | null {
  const scores = report.categoryScores;
  if (scores.length < 2) return null;
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const top = sorted[0]!;
  const bottom = sorted[sorted.length - 1]!;
  if (top.category === bottom.category) return null;
  return `Strongest: ${top.label} (${Math.round(top.score)}). Most room to grow: ${bottom.label} (${Math.round(bottom.score)}).`;
}

function ScoreRing({
  score,
  maxScore,
  size = 168,
  stroke = 10,
}: {
  score: number;
  maxScore: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const offset = c * (1 - pct / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Overall score ${score} out of ${maxScore}`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-zinc-200 dark:stroke-zinc-800"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-[var(--accent)] transition-[stroke-dashoffset] duration-700 ease-out"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-50 sm:text-5xl">
          {score}
        </span>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          / {maxScore}
        </span>
      </div>
    </div>
  );
}

function CategoryScoreCard({ item }: { item: CategoryScore }) {
  const pct = Math.min(100, Math.max(0, item.score));

  return (
    <Card className="border-zinc-200/90 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/80">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {item.label}
            </p>
            {item.blurb ? (
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.blurb}
              </p>
            ) : null}
          </div>
          <span className="text-2xl font-semibold tabular-nums text-[var(--accent)]">
            {item.score}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-600 to-[var(--accent)] dark:from-teal-400 dark:to-teal-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InsightList({
  items,
  variant,
}: {
  items: string[];
  variant: "strength" | "weakness";
}) {
  const isStrength = variant === "strength";
  return (
    <ul className="flex flex-col gap-3">
      {items.map((text, index) => (
        <li
          key={`${variant}-${index}-${text.slice(0, 24)}`}
          className={cn(
            "rounded-xl border px-4 py-3.5 text-[15px] leading-relaxed tracking-tight",
            isStrength
              ? "border-emerald-200/70 bg-white/60 text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-50"
              : "border-amber-200/80 bg-white/60 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/25 dark:text-amber-50",
          )}
        >
          <span className="sr-only">
            {isStrength ? "Strength" : "Growth area"} {index + 1}.{" "}
          </span>
          {text}
        </li>
      ))}
    </ul>
  );
}

export function FinalReportView({
  report,
  maxScore = 100,
  headline = "Interview report",
  className,
}: FinalReportViewProps) {
  const categories = [...report.categoryScores].sort((a, b) => {
    const order = ["clarity", "confidence", "completeness"] as const;
    return order.indexOf(a.category) - order.indexOf(b.category);
  });

  const insight = categoryInsight(report);

  return (
    <div className={cn("space-y-10 sm:space-y-12", className)}>
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          Session complete
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {headline}
        </h1>
      </header>

      <Card className="overflow-hidden border-zinc-200/90 bg-gradient-to-br from-white via-white to-teal-50/40 shadow-md dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-teal-950/20">
        <CardContent className="flex flex-col gap-8 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ScoreRing score={report.overallScore} maxScore={maxScore} />
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Overall performance
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {report.overallScore >= 80
                  ? "Strong showing"
                  : report.overallScore >= 65
                    ? "Solid foundation"
                    : "Room to grow"}
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Blended signal across clarity, confidence, and how completely you
                covered the prompt.
              </p>
            </div>
          </div>
          <div className="hidden h-24 w-px shrink-0 bg-zinc-200 sm:block dark:bg-zinc-800" />
          <div className="grid w-full gap-2 sm:max-w-xs">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Session
            </p>
            <p className="break-all font-mono text-xs leading-snug text-zinc-600 dark:text-zinc-400">
              {report.sessionId}
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4" aria-labelledby="overview-heading">
        <h2
          id="overview-heading"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Your overview
        </h2>
        {insight ? (
          <p className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
            {insight}
          </p>
        ) : null}
        <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-5 py-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-base leading-[1.65] text-zinc-700 dark:text-zinc-300">
            {report.summary}
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Score breakdown
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((c) => (
            <CategoryScoreCard key={c.category} item={c} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className="flex h-full flex-col border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-lg text-emerald-900 dark:text-emerald-100">
              Strengths
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-emerald-800/85 dark:text-emerald-200/75">
              What stood out in your answers—use these as anchors next time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-2">
            <InsightList items={report.strengths} variant="strength" />
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col border-amber-200/70 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-lg text-amber-950 dark:text-amber-100">
              Growth areas
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/75">
              Focus here first—these moves usually lift your score the fastest.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-2">
            <InsightList items={report.weaknesses} variant="weakness" />
          </CardContent>
        </Card>
      </section>

      <Card className="border-zinc-200/90 bg-white/95 shadow-md dark:border-zinc-800 dark:bg-zinc-950/90">
        <CardHeader className="space-y-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <CardTitle className="text-lg">Improved answer</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            A tighter rewrite of your weakest response—use it as a template for
            structure and specificity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {report.weakestAnswerOriginal ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Original
              </p>
              <blockquote className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3.5 text-sm italic leading-relaxed text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
                “{report.weakestAnswerOriginal}”
              </blockquote>
            </div>
          ) : null}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              Suggested rewrite
            </p>
            <p className="text-[15px] leading-[1.65] text-zinc-800 dark:text-zinc-200">
              {report.improvedAnswer}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
