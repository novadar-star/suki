"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { FlaskConical } from "lucide-react";
import { accounts } from "@/data/accounts";
import { assetId, deliverables, sampleRows } from "@/lib/campaign";
import { angleLabel, type Campaign, type ResultRow } from "@/lib/schemas";
import { Button, inputClass } from "../button";
import { Insights } from "./insights";
import { useWorkspace } from "./workspace";

type Col = { key: keyof Omit<ResultRow, "conceptId">; label: string };

const columns: Record<Campaign["objectiveType"], Col[]> = {
  organic: [
    { key: "views", label: "Views" },
    { key: "avgWatchPct", label: "Avg watched %" },
    { key: "saves", label: "Saves" },
    { key: "shares", label: "Shares" },
  ],
  paid: [
    { key: "views", label: "Impressions" },
    { key: "clicks", label: "Clicks" },
    { key: "spend", label: "Spend (AUD)" },
    { key: "purchases", label: "Purchases" },
    { key: "revenue", label: "Revenue (AUD)" },
  ],
};

export function ResultsStage() {
  const { campaign } = useWorkspace();
  const [editing, setEditing] = useState(false);

  if (!campaign.signedOffAt)
    return (
      <div className="rounded-xl border border-dashed border-line bg-panel p-8">
        <h2 className="text-xl font-semibold">Nothing to measure yet</h2>
        <p className="mt-1 max-w-lg text-muted">Sign off the deliverables first. Results are added per signed-off concept once it has been posted.</p>
        <Link href="?stage=review" scroll={false} className="press mt-4 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">
          Go to review
        </Link>
      </div>
    );

  return campaign.results && !editing ? <Insights onEdit={() => setEditing(true)} /> : <ResultsForm onDone={() => setEditing(false)} />;
}

function ResultsForm({ onDone }: { onDone: () => void }) {
  const { campaign, busy, run } = useWorkspace();
  const cols = columns[campaign.objectiveType];
  const items = deliverables(campaign);
  const [source, setSource] = useState<"entered" | "sample">(campaign.results?.source ?? "entered");
  const [rows, setRows] = useState<Record<string, ResultRow>>(() =>
    Object.fromEntries((campaign.results?.rows ?? []).map((r) => [r.conceptId, r])),
  );
  const complete = items.filter((k) => cols.every((c) => typeof rows[k.id]?.[c.key] === "number"));

  const set = (id: string, key: Col["key"], value: string) =>
    setRows((r) => {
      const row: ResultRow = { ...(r[id] ?? { conceptId: id }) };
      if (value === "") delete row[key];
      else row[key] = Math.max(0, Number(value));
      return { ...r, [id]: row };
    });

  async function save() {
    const ok = await run("results", `/api/campaigns/${campaign.id}/results`, "POST", { source, rows: complete.map((k) => rows[k.id]) });
    if (ok) onDone();
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-muted">
            Enter what each posted deliverable did, matched by its Asset ID. The Analyst ranks them on{" "}
            <strong className="font-medium text-ink">{campaign.objectiveType === "paid" ? "return on ad spend" : "watch time, saves and shares"}</strong> and
            suggests what to test next. Suki has no platform connection, so numbers are typed in.
          </p>
        </div>
        <Button
          variant="quiet"
          onClick={() => {
            setRows(Object.fromEntries(sampleRows(campaign).map((r) => [r.conceptId, r])));
            setSource("sample");
          }}
        >
          <FlaskConical aria-hidden className="size-4" />
          Fill with sample numbers
        </Button>
      </div>

      {source === "sample" && (
        <p className="mb-4 rounded-md bg-[#fdf1dc] px-3 py-2 text-sm text-[#8a5a00]">
          Demo data: made-up sample numbers, not real performance. They stay labeled as samples everywhere, including in the next round.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-line bg-panel">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line">
              <th className="p-3 font-normal">Deliverable</th>
              {cols.map((c) => (
                <th key={c.key} className="w-32 p-3 font-normal">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((k) => {
              const a = accounts.find((x) => x.id === k.accountId);
              return (
                <tr key={k.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <span aria-hidden className="size-2 rounded-full" style={{ background: a?.color }} />
                      {a?.name} · {angleLabel[k.angleType]}
                    </span>
                    <span className="font-medium">{k.title}</span>
                    <code className="mt-0.5 block font-mono text-[11px] text-muted">{assetId(campaign, k.id)}</code>
                  </td>
                  {cols.map((c) => (
                    <td key={c.key} className="p-2">
                      <input
                        type="number"
                        min={0}
                        max={c.key === "avgWatchPct" ? 100 : undefined}
                        inputMode="decimal"
                        aria-label={`${c.label} for ${k.title}`}
                        value={rows[k.id]?.[c.key] ?? ""}
                        onChange={(e) => set(k.id, c.key, e.target.value)}
                        className={clsx(inputClass, "py-1.5")}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button variant="primary" disabled={!complete.length} busy={busy === "results"} onClick={save}>
          Analyze {complete.length} of {items.length}
        </Button>
        {campaign.results && (
          <Button variant="quiet" onClick={onDone}>
            Cancel
          </Button>
        )}
        <span className="text-sm text-muted">Rows with every field filled are included.</span>
      </div>
    </>
  );
}

