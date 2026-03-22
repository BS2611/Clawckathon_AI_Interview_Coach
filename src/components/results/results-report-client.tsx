"use client";

import { FinalReportView } from "./final-report";
import { FINAL_REPORT_STORAGE_KEY } from "@/lib/constants/storage-keys";
import type { FinalReport } from "@/types";
import { useLayoutEffect, useState } from "react";

export function ResultsReportClient() {
  const [report, setReport] = useState<FinalReport | null | undefined>(undefined);

  useLayoutEffect(() => {
    console.log(
      "[Interview Coach] Loading final report from localStorage",
      FINAL_REPORT_STORAGE_KEY,
    );
    try {
      const raw = localStorage.getItem(FINAL_REPORT_STORAGE_KEY);
      if (!raw) {
        console.log("[Interview Coach] No final report found in localStorage");
        setReport(null);
        return;
      }
      const parsed = JSON.parse(raw) as FinalReport;
      console.log("[Interview Coach] Loaded final report", {
        sessionId: parsed.sessionId,
      });
      setReport(parsed);
    } catch (e) {
      console.warn("[Interview Coach] Failed to parse stored final report", e);
      setReport(null);
    }
  }, []);

  if (report === undefined) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400" aria-busy="true">
        Loading…
      </p>
    );
  }

  if (report === null) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No interview results found.
      </p>
    );
  }

  return (
    <FinalReportView
      report={report}
      headline="Your mock interview report"
    />
  );
}
