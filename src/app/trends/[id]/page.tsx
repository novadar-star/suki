import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrend } from "@/lib/repo";
import { EvidenceForm } from "./evidence-form";
import { confidenceHelp, confidenceOf } from "@/lib/confidence";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { Field, Panel, PanelTitle, Tag, fmtDate } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TrendPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTrend(id);
  if (!t) notFound();
  const level = confidenceOf(t);
  const a = t.analysis;

  return (
    <>
      <Link href="/trends" className="text-sm text-muted hover:text-ink">
        Back to trend references
      </Link>
      <header className="mb-8 mt-3 max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <ConfidenceBadge level={level} />
        </div>
        <p className="mt-2 text-muted">{t.description}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Panel>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">How the format works</h2>
            <Tag>{a.origin === "ai" ? "AI reading of your description. Check before use." : a.origin === "demo" ? "Sample answer (demo mode)" : "Written by the Myrtis team"}</Tag>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Hook">{a.hookPattern}</Field>
            <Field label="Story">{a.narrative}</Field>
            <Field label="Format">{a.format}</Field>
            <Field label="Visuals">{a.visualDirection}</Field>
            <Field label="Editing">{a.editingStyle}</Field>
            <Field label="Feeling it creates">{a.emotionalTrigger}</Field>
            <Field label="Where the product fits">{a.productIntegration}</Field>
            <Field label="Where it adapts well">{a.adaptationPotential}</Field>
          </dl>
        </Panel>

        <Panel>
          <PanelTitle>Evidence</PanelTitle>
          <p className="text-sm text-muted">{confidenceHelp[level]}</p>
          {t.evidence.length === 0 ? (
            <p className="mt-4">No evidence logged yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {t.evidence.map((e) => (
                <li key={e.id} className="border-t border-line pt-3">
                  <p>{e.note}</p>
                  <p className="text-sm text-muted">
                    {fmtDate(e.observedOn)} by {e.addedBy}
                    {e.url && (
                      <>
                        {" · "}
                        <a href={e.url} target="_blank" rel="noreferrer" className="underline">
                          Source
                        </a>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <EvidenceForm trendId={t.id} />
          <dl className="mt-6 grid gap-3 border-t border-line pt-4 text-sm">
            <Field label="Source">
              {t.sourceUrl ? (
                <a href={t.sourceUrl} className="underline" target="_blank" rel="noreferrer">
                  {t.sourceUrl}
                </a>
              ) : (
                t.kind === "submitted" ? "No source link. Treat as an illustrative example." : "Common format. No single source."
              )}
            </Field>
            <Field label="Added">
              {fmtDate(t.addedOn)} by {t.addedBy}
            </Field>
          </dl>
        </Panel>
      </div>
    </>
  );
}
