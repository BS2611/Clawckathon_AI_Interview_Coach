import { cn } from "@/lib/cn";
import Link from "next/link";

export type SiteNavId = "home" | "interview" | "results";

const NAV: { id: SiteNavId; href: string; label: string }[] = [
  { id: "home", href: "/", label: "Home" },
  { id: "interview", href: "/interview", label: "Interview" },
  { id: "results", href: "/results", label: "Results" },
];

export interface SiteHeaderProps {
  activeNav?: SiteNavId;
  sticky?: boolean;
  contentMaxWidthClass?: "max-w-5xl" | "max-w-6xl";
}

export function SiteHeader({
  activeNav,
  sticky = false,
  contentMaxWidthClass = "max-w-6xl",
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-zinc-200/80 px-6 py-4 backdrop-blur-md dark:border-zinc-800",
        sticky
          ? "sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80"
          : "bg-white/70 dark:bg-zinc-950/70",
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-4",
          contentMaxWidthClass,
        )}
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 transition hover:text-[var(--accent)] dark:text-zinc-50"
        >
          Interview Coach
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          {NAV.map(({ id, href, label }) =>
            activeNav === id ? (
              <span
                key={id}
                className="font-medium text-zinc-900 dark:text-zinc-200"
              >
                {label}
              </span>
            ) : (
              <Link
                key={id}
                href={href}
                className="hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                {label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
