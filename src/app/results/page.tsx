import { AmbientBackdrop, SiteHeader } from "@/components/layout";
import {
  LiveVoiceInterviewCta,
  ResultsPageActions,
  ResultsReportClient,
} from "@/components/results";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Results — Interview Coach",
  description: "Your mock interview report: scores, strengths, and improved answer.",
};

export default function ResultsPage() {
  return (
    <div className="relative min-h-full">
      <AmbientBackdrop variant="results" />
      <SiteHeader activeNav="results" sticky contentMaxWidthClass="max-w-5xl" />
      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <ResultsReportClient />
        <LiveVoiceInterviewCta />
        <ResultsPageActions />
      </main>
    </div>
  );
}
