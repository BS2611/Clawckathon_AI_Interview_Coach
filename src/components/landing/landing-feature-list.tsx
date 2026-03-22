const FEATURES = [
  "Tailored prompts from role + level",
  "Transcript + coaching metrics sidebar",
  "Timer and session controls",
  "Swap mock API for production in one place",
] as const;

export function LandingFeatureList() {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
      {FEATURES.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
        >
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
            aria-hidden
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
