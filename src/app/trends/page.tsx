import Link from "next/link";
import { getTrends } from "@/lib/repo";
import { confidenceOf } from "@/lib/confidence";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  const trends = await getTrends();
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Trend references"
          intro="Myrtis has no live trend data. Each format shows the evidence behind it. Formats with no recent evidence are reference examples."
        />
        <Link href="/trends/new" className="press rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/85">
          Add a reference
        </Link>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
        {trends.map((t) => (
          <li key={t.id}>
            <Link
              href={`/trends/${t.id}`}
              className="flex flex-col gap-1 p-5 hover:bg-paper/60 sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">
                  {t.title}
                  {t.kind === "submitted" && <span className="ml-2 align-middle text-sm font-normal text-muted">{t.platform}</span>}
                </h2>
                <p className="text-muted">{t.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm text-muted">
                <span>
                  {t.evidence.length} evidence {t.evidence.length === 1 ? "item" : "items"}
                </span>
                <ConfidenceBadge level={confidenceOf(t)} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
