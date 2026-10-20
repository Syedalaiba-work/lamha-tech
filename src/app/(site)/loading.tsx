// At least one full screen tall: the footer stays below the fold while a page streams in, so its jump does not count as layout shift (CLS).
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading page" className="dark-section relative min-h-[100svh] bg-abyss text-white">
      <div className="container-x pt-[calc(var(--header-h)+4rem)]">
        <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-8 h-12 w-2/3 max-w-xl animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-12 w-1/2 max-w-md animate-pulse rounded bg-white/10" />
        <div className="mt-8 h-4 w-full max-w-lg animate-pulse rounded bg-white/5" />
        <div className="mt-3 h-4 w-5/6 max-w-md animate-pulse rounded bg-white/5" />
        <div className="mt-10 flex gap-3">
          <div className="h-12 w-40 animate-pulse rounded-md bg-blue/40" />
          <div className="h-12 w-40 animate-pulse rounded-md bg-white/10" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
