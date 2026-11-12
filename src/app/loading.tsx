// Shown the moment a page link is clicked, while the server builds the next page.
// Shapes follow PageHeader and Panel so the swap to real content doesn't jump.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="motion-safe:animate-pulse">
      <span className="sr-only">Loading…</span>
      <div aria-hidden className="mb-8 max-w-2xl">
        <div className="h-10 w-56 rounded-md bg-panel" />
        <div className="mt-3 h-4 w-full max-w-md rounded bg-panel" />
      </div>
      <div aria-hidden className="grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-xl border border-line bg-panel" />
        ))}
      </div>
    </div>
  );
}
