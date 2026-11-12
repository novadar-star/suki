"use client";

import { useState } from "react";
import clsx from "clsx";
import { accounts } from "@/data/accounts";
import type { Playbook } from "@/lib/schemas";
import { Button, inputClass } from "../button";
import { ConfidenceBadge } from "../confidence-badge";
import { Tag } from "../ui";
import { useWorkspace } from "./workspace";

const originLabel = { ai: "Written by AI", demo: "Sample answer (demo mode)", edited: "Edited by you" };

export function PlaybooksStage() {
  const { campaign, busy, run } = useWorkspace();
  const ready = campaign.trendIds.length > 0 && campaign.accountIds.length > 0;
  const has = campaign.playbooks.length > 0;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-muted">
          One playbook per account. Read each one, edit what you want, then approve it. Only approved playbooks become concepts.
        </p>
        <Button
          variant={has ? "secondary" : "primary"}
          disabled={!ready}
          busy={busy === "playbooks"}
          onClick={() => run("playbooks", `/api/campaigns/${campaign.id}/playbooks`, "POST")}
        >
          {busy === "playbooks" ? "Writing playbooks" : has ? "Remake all playbooks" : "Make playbooks"}
        </Button>
      </div>
      {!ready && <p className="mb-6 text-warn">Pick at least one account and one trend first.</p>}
      <div className="grid gap-4 xl:grid-cols-3">
        {campaign.accountIds.map((id) => {
          const p = campaign.playbooks.find((x) => x.accountId === id);
          return p ? <PlaybookCard key={id} p={p} /> : <EmptyCard key={id} accountId={id} />;
        })}
      </div>
    </>
  );
}

function AccountHeader({ accountId }: { accountId: string }) {
  const a = accounts.find((x) => x.id === accountId)!;
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden className="size-2.5 rounded-full" style={{ background: a.color }} />
      <h2 className="text-lg font-semibold">{a.name}</h2>
    </div>
  );
}

function EmptyCard({ accountId }: { accountId: string }) {
  return (
    <article className="rounded-xl border border-dashed border-line p-5">
      <AccountHeader accountId={accountId} />
      <p className="mt-2 text-sm text-muted">No playbook yet.</p>
    </article>
  );
}

const fields: { key: keyof Playbook; label: string }[] = [
  { key: "audienceInsight", label: "Audience insight" },
  { key: "angle", label: "Angle" },
  { key: "hookDirection", label: "Hook direction" },
  { key: "visualDirection", label: "Visuals" },
  { key: "productIntegration", label: "Product moment" },
  { key: "cta", label: "Call to action" },
];

function PlaybookCard({ p }: { p: Playbook }) {
  const { campaign, trends, busy, run } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const trend = trends.find((t) => t.id === p.trendId);
  const color = accounts.find((a) => a.id === p.accountId)?.color;
  const url = `/api/campaigns/${campaign.id}`;
  const save = (next: Playbook) =>
    run(`pb:${p.accountId}`, url, "PATCH", { playbooks: campaign.playbooks.map((x) => (x.accountId === p.accountId ? next : x)) });

  return (
    <article
      className={clsx("flex flex-col rounded-xl border bg-panel", p.status === "rejected" ? "border-line opacity-60" : "border-line")}
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="border-b border-line p-5">
        <div className="flex items-start justify-between gap-2">
          <AccountHeader accountId={p.accountId} />
          {p.status !== "draft" && <Tag tone={p.status === "approved" ? "ok" : "bad"}>{p.status === "approved" ? "Approved" : "Rejected"}</Tag>}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-medium">{trend?.title ?? p.trendId}</span>
          {trend && <ConfidenceBadge level={trend.confidence} />}
          <Tag>{p.format}</Tag>
        </div>
        <p className="mt-2 text-sm">{p.fitReason}</p>
      </div>

      {editing ? (
        <form
          className="grid gap-3 p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const next = { ...p, origin: "edited" as const };
            for (const { key } of fields) (next as Record<string, unknown>)[key] = String(f.get(key) ?? "").trim() || p[key];
            next.structure = String(f.get("structure")).split("\n").map((s) => s.trim()).filter(Boolean);
            if (await save(next)) setEditing(false);
          }}
        >
          {fields.map(({ key, label }) => (
            <label key={key} className="grid gap-1 text-sm">
              <span className="text-muted">{label}</span>
              <textarea name={key} rows={2} defaultValue={String(p[key])} className={inputClass} />
            </label>
          ))}
          <label className="grid gap-1 text-sm">
            <span className="text-muted">Story beats (one per line)</span>
            <textarea name="structure" rows={5} defaultValue={p.structure.join("\n")} className={inputClass} />
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" busy={busy === `pb:${p.accountId}`}>
              Save changes
            </Button>
            <Button type="button" variant="quiet" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid gap-3 p-5 text-[15px]">
          {fields.map(({ key, label }) => (
            <div key={key}>
              <dt className="text-sm text-muted">{label}</dt>
              <dd>{String(p[key])}</dd>
            </div>
          ))}
          <div>
            <dt className="text-sm text-muted">Story beats</dt>
            <dd>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                {p.structure.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </dd>
          </div>
          {p.safetyNotes.length > 0 && (
            <div>
              <dt className="text-sm text-muted">Brand safety</dt>
              <dd>{p.safetyNotes.join(". ")}.</dd>
            </div>
          )}
          {p.rejectedTrends.length > 0 && (
            <div>
              <dt className="text-sm text-muted">Trends not used</dt>
              <dd>
                <ul className="space-y-1">
                  {p.rejectedTrends.map((r) => (
                    <li key={r.trendId}>
                      <span className="font-medium">{trends.find((t) => t.id === r.trendId)?.title ?? r.trendId}:</span> {r.reason}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      )}

      {!editing && (
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line p-4">
          {p.status !== "approved" && (
            <Button variant="primary" busy={busy === `pb:${p.accountId}`} onClick={() => save({ ...p, status: "approved" })}>
              Approve
            </Button>
          )}
          <Button variant="quiet" onClick={() => setEditing(true)} disabled={!!busy}>
            Edit
          </Button>
          <Button
            variant="quiet"
            busy={busy === `remake:${p.accountId}`}
            onClick={() => run(`remake:${p.accountId}`, `${url}/playbooks`, "POST", { accountId: p.accountId })}
          >
            Remake
          </Button>
          {p.status !== "rejected" && (
            <Button variant="danger" disabled={!!busy} onClick={() => save({ ...p, status: "rejected" })}>
              Reject
            </Button>
          )}
          <span className="ml-auto text-xs text-muted">{originLabel[p.origin]}</span>
        </div>
      )}
    </article>
  );
}
