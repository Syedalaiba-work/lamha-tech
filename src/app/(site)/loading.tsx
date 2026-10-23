// At least one full screen tall: the footer stays below the fold while a page streams in, so its jump does not count as layout shift (CLS).
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading page" className="relative min-h-[100svh] bg-paper">
      <div className="container-x pt-[calc(var(--header-h)+2.5rem)]">
        <div className="flex justify-between">
          <div className="h-3 w-40 animate-pulse bg-ink/[0.06]" />
          <div className="h-3 w-28 animate-pulse bg-ink/[0.06]" />
        </div>
        <div className="mt-24 h-[clamp(3rem,9vw,9rem)] w-4/5 max-w-5xl animate-pulse bg-ink/[0.06]" />
        <div className="mt-4 h-[clamp(3rem,9vw,9rem)] w-3/5 max-w-4xl animate-pulse bg-ink/[0.06]" />
        <div className="mt-14 h-4 w-full max-w-xl animate-pulse bg-ink/[0.04]" />
        <div className="mt-3 h-4 w-5/6 max-w-lg animate-pulse bg-ink/[0.04]" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
