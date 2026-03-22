type AmbientBackdropVariant = "home" | "results";

export function AmbientBackdrop({ variant }: { variant: AmbientBackdropVariant }) {
  if (variant === "home") {
    return (
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[var(--accent-muted)] blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-100/40 blur-3xl dark:bg-teal-900/20" />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-[var(--accent-muted)] blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-teal-100/50 blur-3xl dark:bg-teal-950/30" />
      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-100/30 blur-3xl dark:bg-violet-950/20" />
    </div>
  );
}
