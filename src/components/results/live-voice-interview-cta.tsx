"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import Link from "next/link";
import QRCode from "react-qr-code";

const TEL_URI = "tel:+15096925293";
const DISPLAY_PHONE = "(509) 692-5293";
const PIN_INSTRUCTION = "After the call connects, dial #2006";

function PhoneMicIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]",
        className,
      )}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
    </span>
  );
}

export function LiveVoiceInterviewCta() {
  return (
    <section
      className="mt-12 sm:mt-16"
      aria-labelledby="voice-cta-heading"
    >
      <Card className="overflow-hidden border-[var(--accent)]/25 bg-gradient-to-br from-white via-teal-50/30 to-white shadow-md dark:border-[var(--accent)]/30 dark:from-zinc-950 dark:via-teal-950/20 dark:to-zinc-950">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex flex-wrap items-start gap-4">
                <PhoneMicIcon />
                <div className="min-w-0 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                    Next step
                  </p>
                  <h2
                    id="voice-cta-heading"
                    className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
                  >
                    Ready for a live interview simulation?
                  </h2>
                  <p className="max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                    You&apos;ve practiced with text. Now continue with a live voice
                    interview using our AI interviewer.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Call this number
                </p>
                <p className="text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-50 sm:text-4xl">
                  {DISPLAY_PHONE}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={TEL_URI}
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Call Now
                </Link>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Best experienced on your phone
                </p>
              </div>
            </div>

            <div className="flex w-full max-w-[280px] flex-col items-center gap-4 self-center lg:shrink-0">
              <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-white">
                <QRCode
                  value={TEL_URI}
                  size={200}
                  className="h-auto max-w-full"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>
              <p className="max-w-[260px] text-center text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                {PIN_INSTRUCTION}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
