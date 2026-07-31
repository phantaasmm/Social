export function RouteFallback() {
  return (
    <div
      className="space-y-4 px-4 py-6 sm:px-0"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <span className="sr-only">Loading page…</span>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded bg-surface-2" />
      <div className="mt-6 h-64 animate-pulse rounded-card border border-border bg-surface" />
    </div>
  );
}
