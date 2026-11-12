"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { accounts } from "@/data/accounts";
import { api } from "@/lib/client";
import { analyze, assetId, MIN_ASSETS, MIN_VOLUME } from "@/lib/campaign";
import { angleLabel, type Campaign } from "@/lib/schemas";
import { Button, ErrorNote } from "../button";
import { Tag } from "../ui";
import { useWorkspace } from "./workspace";

// Results by Asset ID, the Analyst's draft insights, and the next round.
export function Insights({ onEdit }: { onEdit: () => void }) {
  const { campaign, busy, run } = useWorkspace();
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const a = analyze(campaign);
  const sample = campaign.results?.source === "sample";
  const unit = campaign.objectiveType === "paid" ? "impressions" : "views";
  const max = Math.max(...a.ranked.map((r) => r.primary), 0.0001);
  const accepted = campaign.insights.filter((i) => i.status === "accepted");
  const pending = campaign.insights.filter((i) => i.status === "draft");

  async function nextRound() {
    setStarting(true);
    setError(null);
    try {
      const next = await api<Campaign>(`/api/campaigns/${campaign.id}/next-round`, "POST");
      router.push(`/campaigns/${next.id}?stage=brief`);
    } catch (e) {
      setError((e as Error).message);
      setStarting(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold">Results by asset</h2>
          {sample ? <Tag tone="warn">Demo data: sample numbers, not real results</Tag> : <Tag>Entered by the team</Tag>}
          <Tag>Sorted by {a.metric}</Tag>
        </div>
        <Button variant="quiet" onClick={onEdit}>
          Edit numbers
        </Button>
      </div>

      <ol className="grid gap-2">
        {a.ranked.map((r) => {
          const acc = accounts.find((x) => x.id === r.concept.accountId);
          return (
            <li key={r.concept.id} className="grid gap-3 rounded-xl border border-line bg-panel p-4 sm:grid-cols-[1fr_220px] sm:items-center">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  <span aria-hidden className="size-2 rounded-full" style={{ background: acc?.color }} />
                  {acc?.name} · {angleLabel[r.concept.angleType]} · {r.concept.format}
                  <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink">{assetId(campaign, r.concept.id)}</code>
                  {!r.enoughVolume && (
                    <Tag tone="warn">
                      Under {MIN_VOLUME.toLocaleString("en-US")} {unit}, not analyzed
                    </Tag>
                  )}
                </p>
                <p className="font-medium">&ldquo;{r.concept.hook}&rdquo;</p>
                <p className="text-sm text-muted">{r.secondary}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">{r.primaryLabel}</p>
                <div className="mt-1 h-2 rounded-full bg-paper" aria-hidden>
                  <div className="h-2 rounded-full" style={{ width: `${Math.max(4, (r.primary / max) * 100)}%`, background: acc?.color }} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold">What the Analyst found</h3>
          <p className="text-sm text-muted">
            A pattern needs two groups with {MIN_ASSETS}+ assets each, every asset over {MIN_VOLUME.toLocaleString("en-US")} {unit}. Fixed rules, not AI.
          </p>
        </div>
        <ul className="grid gap-3 lg:grid-cols-2">
          {campaign.insights.map((i) => {
            const key = `ins:${i.id}`;
            const decide = (status: "accepted" | "dismissed" | "draft") =>
              run(key, `/api/campaigns/${campaign.id}/insights`, "PATCH", { id: i.id, status });
            return (
              <li
                key={i.id}
                className={clsx(
                  "rounded-xl border bg-panel p-5",
                  i.status === "accepted" ? "border-ok/50" : i.status === "dismissed" ? "border-line opacity-60" : "border-accent",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone={i.status === "accepted" ? "ok" : "plain"}>
                    {i.status === "accepted" ? "Accepted" : i.status === "dismissed" ? "Dismissed" : "Draft insight"}
                  </Tag>
                  <span className="text-xs text-muted">
                    By {i.dimension} · {i.sampleSize} assets{sample ? " · from sample numbers" : ""}
                  </span>
                </div>
                <p className="mt-2 font-medium">{i.statement}</p>
                <p className="mt-1 text-sm text-muted">Test next: {i.nextTest}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {i.status !== "accepted" && (
                    <Button variant="primary" busy={busy === key} onClick={() => decide("accepted")}>
                      Accept
                    </Button>
                  )}
                  {i.status !== "dismissed" && (
                    <Button variant="quiet" disabled={!!busy} onClick={() => decide("dismissed")}>
                      Dismiss
                    </Button>
                  )}
                  {i.status !== "draft" && (
                    <Button variant="quiet" disabled={!!busy} onClick={() => decide("draft")}>
                      Undo
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
          {a.gaps.map((g) => (
            <li key={g.dimension} className="rounded-xl border border-dashed border-line bg-panel p-5">
              <Tag>Not enough data</Tag>
              <p className="mt-2 text-sm">{g.message}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-line bg-panel p-5">
        <h3 className="text-lg font-semibold">Next round</h3>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {accepted.length
            ? `${accepted.length} accepted insight${accepted.length === 1 ? "" : "s"} will go into the new brief and the Strategist's prompt.`
            : campaign.insights.length
              ? "Accept an insight to carry it forward. Draft and dismissed insights stay here."
              : "No pattern met the sample-size rule, so nothing is carried forward. More deliverables per group are needed to learn something."}
          {pending.length > 0 && ` ${pending.length} still waiting for a decision.`}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="primary" busy={starting} onClick={nextRound}>
            Start round {campaign.round + 1}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
          <span className="text-sm text-muted">Same accounts and references.</span>
        </div>
        <div className="mt-3">
          <ErrorNote message={error} />
        </div>
      </section>
    </>
  );
}
