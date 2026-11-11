import clsx from "clsx";

export function PageHeader({ title, intro }: { title: string; intro?: React.ReactNode }) {
  return (
    <header className="mb-8 max-w-2xl">
      <h1 className="text-4xl font-bold">{title}</h1>
      {intro && <p className="mt-2 text-muted">{intro}</p>}
    </header>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={clsx("rounded-xl border border-line bg-panel p-5", className)}>{children}</section>;
}

export function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-lg font-semibold">{children}</h2>;
}

export function Tag({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "accent" | "ink" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "plain" && "border border-line bg-panel text-muted",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "ink" && "bg-ink text-white",
      )}
    >
      {children}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

export function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-muted" />
          {i}
        </li>
      ))}
    </ul>
  );
}

export function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
