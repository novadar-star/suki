"use client";

import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { CircleCheck, OctagonX, TriangleAlert } from "lucide-react";
import { angleLabel, objectiveTypeInfo, type Finding } from "@/lib/schemas";
import { assetId, deliverables } from "@/lib/campaign";
import { Button, inputClass } from "../button";
import { Tag } from "../ui";
import { useWorkspace } from "./workspace";

const kindLabel: Record<Finding["kind"], string> = {
  same_angle: "Same angle",
  same_format: "Same format",
  cross_overlap: "Overlap across accounts",
  history_repeat: "Repeats a past hook",
  similar_hooks: "Similar hooks",
  prohibited_claim: "Prohibited claim",
  avoid_word: "Word to avoid",
  unsupported_claim: "Unsupported claim",
  missing_disclaimer: "Missing disclaimer",
  paid_late_product: "Paid: product shows too late",
  paid_weak_cta: "Paid: no clear action",
  organic_hard_sell: "Organic: reads like an ad",
};

export function ReviewStage() {
  const { campaign, busy, run } = useWorkspace();
  const r = campaign.report;
  const overridden = (id: string) => campaign.qcOverrides.find((o) => o.findingId === id);
  const fixes = r?.findings.filter((f) => f.severity === "fix") ?? [];
  const checks = r?.findings.filter((f) => f.severity === "check" && !overridden(f.id)) ?? [];
  const done = r?.findings.filter((f) => f.severity === "check" && overridden(f.id)) ?? [];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-muted">
          Compares every concept with every other one and with each account&apos;s past hooks. Claims are checked against the Brand Brain, and{" "}
          {objectiveTypeInfo[campaign.objectiveType].label.toLowerCase()} rules are applied. These are fixed rules, not AI scores.
        </p>
        <Button
          variant={r ? "secondary" : "primary"}
          disabled={!campaign.concepts.length}
          busy={busy === "review"}
          onClick={() => run("review", `/api/campaigns/${campaign.id}/review`, "POST")}
        >
          {r ? "Run check again" : "Run portfolio check"}
        </Button>
      </div>

      {!campaign.concepts.length && <p className="text-warn">Make concepts first.</p>}

      {r && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Stat label="Concepts checked" value={`${r.conceptCount} across ${r.accountCount} accounts`} />
            <Stat label="Blockers" hint="Must be fixed before sign-off" value={String(fixes.length)} tone={fixes.length ? "bad" : "plain"} />
            <Stat label="Warnings" hint={done.length ? `${done.length} overridden with a reason` : "Fix, or override with a reason"} value={String(checks.length)} />
          </div>

          <div className="mb-8 rounded-xl border border-line bg-panel p-5">
            <h2 className="mb-3 font-semibold">Angles in this portfolio</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(r.angleCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([k, n]) => (
                  <Tag key={k} tone={n > 3 ? "warn" : "plain"}>
                    {angleLabel[k as keyof typeof angleLabel]}: {n}
                  </Tag>
                ))}
            </div>
          </div>

          {r.findings.length === 0 ? (
            <div className="rounded-xl border border-line bg-panel p-8">
              <h2 className="text-xl font-semibold">No problems found</h2>
              <p className="mt-1 text-muted">Every concept takes its own angle, no hook repeats, and every claim comes from the Brand Brain.</p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {[...fixes, ...checks].map((f) => (
                <FindingRow key={f.id} f={f} />
              ))}
            </ul>
          )}
          {done.length > 0 && (
            <details className="mt-6 rounded-xl border border-line bg-panel p-5">
              <summary className="cursor-pointer font-medium">Overridden warnings ({done.length})</summary>
              <ul className="mt-3 grid gap-3">
                {done.map((f) => (
                  <FindingRow key={f.id} f={f} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </>
  );
}

function Stat({ label, value, hint, tone = "plain" }: { label: string; value: string; hint?: string; tone?: "plain" | "bad" }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={clsx("mt-1 font-display text-2xl font-semibold", tone === "bad" && "text-bad")}>{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

// The offending words are marked so the reviewer sees exactly what broke the rule.
function Excerpt({ text, matches }: { text: string; matches: string[] }) {
  const words = matches.filter(Boolean).map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = words.length ? text.split(new RegExp(`(${words.join("|")})`, "gi")) : [text];
  return (
    <blockquote className="mt-3 rounded-md border-l-4 border-line bg-paper px-3 py-2 text-[15px]">
      {parts.map((p, i) =>
        words.length && i % 2 === 1 ? (
          <mark key={i} className="rounded bg-bad-soft px-0.5 font-semibold text-bad">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </blockquote>
  );
}

function FindingRow({ f }: { f: Finding }) {
  const { campaign, busy, run, accounts } = useWorkspace();
  const [overriding, setOverriding] = useState(false);
  const [reason, setReason] = useState("");
  // For a pair, rewrite the later concept and keep the first one.
  const target = f.conceptIds[f.conceptIds.length - 1];
  const concept = campaign.concepts.find((c) => c.id === target);
  const account = accounts.find((a) => a.id === concept?.accountId);
  const key = `fix:${f.id}`;
  const blocker = f.severity === "fix";
  const override = campaign.qcOverrides.find((o) => o.findingId === f.id);
  const url = `/api/campaigns/${campaign.id}/overrides`;

  return (
    <li className={clsx("rounded-xl border bg-panel p-5", blocker ? "border-bad/50" : "border-warn/40", override && "opacity-75")}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            blocker ? "bg-bad-soft text-bad" : "bg-warn-soft text-warn",
          )}
        >
          {blocker ? <OctagonX aria-hidden className="size-3.5" /> : <TriangleAlert aria-hidden className="size-3.5" />}
          {blocker ? "Blocker" : override ? "Warning, overridden" : "Warning"}
        </span>
        <span className="text-sm font-medium">{kindLabel[f.kind]}</span>
        {concept && <code className="font-mono text-[11px] text-muted">{assetId(campaign, concept.id)}</code>}
      </div>
      <p className="mt-2">{f.message}</p>
      {f.excerpt && <Excerpt text={f.excerpt.text} matches={f.excerpt.matches} />}
      <p className="mt-2 text-xs text-muted">
        Rule: <span className="text-ink">{f.rule ?? kindLabel[f.kind]}</span>
      </p>
      <p className="mt-1 text-sm text-muted">{f.suggestion}</p>

      {override ? (
        <div className="mt-3 rounded-md bg-paper p-3 text-sm">
          <p>
            <span className="font-medium">Override reason:</span> {override.reason}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {override.by}, {new Date(override.at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <Button
            className="mt-2"
            variant="quiet"
            busy={busy === `undo:${f.id}`}
            onClick={() => run(`undo:${f.id}`, `${url}?findingId=${encodeURIComponent(f.id)}`, "DELETE")}
          >
            Undo override
          </Button>
        </div>
      ) : overriding ? (
        <form
          className="mt-3 grid gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run(`ovr:${f.id}`, url, "POST", { findingId: f.id, reason })) setOverriding(false);
          }}
        >
          <label className="grid gap-1 text-sm">
            <span className="text-muted">Why is this fine to keep? This is logged.</span>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} minLength={5} maxLength={300} required className={inputClass} />
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" busy={busy === `ovr:${f.id}`} disabled={reason.trim().length < 5}>
              Save override
            </Button>
            <Button type="button" variant="quiet" onClick={() => setOverriding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        concept && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant={blocker ? "primary" : "secondary"}
              busy={busy === key}
              onClick={() => run(key, `/api/campaigns/${campaign.id}/concepts/${target}`, "POST", { findingId: f.id })}
            >
              {busy === key ? "Rewriting" : "Rewrite this concept"}
            </Button>
            {!blocker && (
              <Button variant="quiet" disabled={!!busy} onClick={() => setOverriding(true)}>
                Override with reason
              </Button>
            )}
            <span className="text-sm text-muted">
              Rewrites &ldquo;{concept.title}&rdquo; for {account?.name}
            </span>
          </div>
        )
      )}
    </li>
  );
}

// A person approves concepts and signs them off as the campaign's deliverables.
export function SignOffStage() {
  const { campaign } = useWorkspace();
  if (!campaign.report)
    return (
      <div className="rounded-xl border border-dashed border-line bg-panel p-8">
        <h2 className="text-xl font-semibold">Run the review first</h2>
        <p className="mt-1 max-w-lg text-muted">Sign-off needs a review, so you can see which concepts pass before you pick the deliverables.</p>
        <Link href="?stage=review" scroll={false} className="press mt-4 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-inv hover:bg-ink/85">
          Go to review
        </Link>
      </div>
    );
  return <SignOff />;
}

function SignOff() {
  const { campaign, busy, run, accounts } = useWorkspace();
  const url = `/api/campaigns/${campaign.id}`;
  const live = campaign.concepts.filter((c) => c.status !== "rejected");
  const approved = deliverables(campaign);
  const fixesFor = (id: string) => campaign.report?.findings.filter((f) => f.severity === "fix" && f.conceptIds.includes(id)).length ?? 0;
  const blocking = approved.filter((c) => fixesFor(c.id) > 0);
  const setStatus = (id: string, status: "approved" | "draft") =>
    run(`so:${id}`, url, "PATCH", { concepts: campaign.concepts.map((x) => (x.id === id ? { ...x, status } : x)) });

  if (campaign.signedOffAt)
    return (
      <section className="mb-8 rounded-xl border border-ok/30 bg-ok-soft/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CircleCheck aria-hidden className="size-5 text-ok" />
              Signed off. {approved.length} deliverable{approved.length === 1 ? "" : "s"} ready for production.
            </h2>
            <p className="mt-1 text-sm text-muted">
              {new Date(campaign.signedOffAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}. Every approved concept passed the checks.
            </p>
            <ul className="mt-3 grid gap-1 text-sm">
              {approved.map((c) => (
                <li key={c.id} className="flex flex-wrap items-baseline gap-2">
                  <code className="font-mono text-xs">{assetId(campaign, c.id)}</code>
                  <span>{c.title}</span>
                  <span className="text-muted">· {accounts.find((a) => a.id === c.accountId)?.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`${url}/export`} className="press inline-flex min-h-9 items-center rounded-md border border-line bg-panel px-3.5 text-sm font-medium hover:border-ink/30">
              Export production pack
            </a>
            <Link href="?stage=results" scroll={false} className="press inline-flex min-h-9 items-center rounded-md bg-ink px-3.5 text-sm font-medium text-inv hover:bg-ink/85">
              Add results
            </Link>
            <Button variant="quiet" busy={busy === "reopen"} onClick={() => run("reopen", `${url}/signoff`, "DELETE")}>
              Reopen
            </Button>
          </div>
        </div>
      </section>
    );

  return (
    <section className="mb-8 rounded-xl border border-line bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Pick the deliverables</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Approve the concepts you want to produce. Sign-off unlocks when none of them has a blocker. A person makes this call, not the AI.
          </p>
        </div>
        <Button
          variant="primary"
          disabled={!approved.length || blocking.length > 0 || !!busy}
          busy={busy === "signoff"}
          onClick={() => run("signoff", `${url}/signoff`, "POST")}
        >
          {approved.length ? `Sign off ${approved.length} deliverable${approved.length === 1 ? "" : "s"}` : "Sign off deliverables"}
        </Button>
      </div>
      {blocking.length > 0 && (
        <p className="mt-3 text-sm text-bad">
          {blocking.length} approved concept{blocking.length === 1 ? " has" : "s have"} blockers. Rewrite or unapprove {blocking.length === 1 ? "it" : "them"}.
        </p>
      )}
      <ul className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {live.map((c) => {
          const a = accounts.find((x) => x.id === c.accountId);
          const fixes = fixesFor(c.id);
          const on = c.status === "approved";
          return (
            <li key={c.id}>
              <label
                className={clsx(
                  "press flex h-full cursor-pointer gap-3 rounded-lg border p-3",
                  on ? "border-ink" : "border-line hover:border-ink/30",
                  busy === `so:${c.id}` && "opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  disabled={!!busy}
                  onChange={() => setStatus(c.id, on ? "draft" : "approved")}
                  className="mt-1 size-4 accent-ink"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <span aria-hidden className="size-2 rounded-full" style={{ background: a?.color }} />
                    {a?.name} · {angleLabel[c.angleType]}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium leading-snug">&ldquo;{c.hook}&rdquo;</span>
                  <span className={clsx("mt-1 block text-xs", fixes ? "text-bad" : "text-ok")}>
                    {fixes ? `${fixes} blocker${fixes === 1 ? "" : "s"}` : "Passes checks"}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
