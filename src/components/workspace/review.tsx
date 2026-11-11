"use client";

import Link from "next/link";
import clsx from "clsx";
import { CircleCheck } from "lucide-react";
import { accounts } from "@/data/accounts";
import { angleLabel, objectiveTypeInfo, type Finding } from "@/lib/schemas";
import { deliverables } from "@/lib/campaign";
import { Button } from "../button";
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
  const fixes = r?.findings.filter((f) => f.severity === "fix") ?? [];
  const checks = r?.findings.filter((f) => f.severity === "check") ?? [];

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

      {!campaign.concepts.length && <p className="text-accent">Make concepts first.</p>}

      {r && <SignOff />}

      {r && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Stat label="Concepts checked" value={`${r.conceptCount} across ${r.accountCount} accounts`} />
            <Stat label="Must fix" value={String(fixes.length)} tone={fixes.length ? "accent" : "plain"} />
            <Stat label="Worth a look" value={String(checks.length)} />
          </div>

          <div className="mb-8 rounded-xl border border-line bg-panel p-5">
            <h2 className="mb-3 font-semibold">Angles in this portfolio</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(r.angleCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([k, n]) => (
                  <Tag key={k} tone={n > 3 ? "accent" : "plain"}>
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
              {r.findings.map((f) => (
                <FindingRow key={f.id} f={f} />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

function Stat({ label, value, tone = "plain" }: { label: string; value: string; tone?: "plain" | "accent" }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={clsx("mt-1 font-display text-2xl font-bold", tone === "accent" && "text-accent")}>{value}</p>
    </div>
  );
}

function FindingRow({ f }: { f: Finding }) {
  const { campaign, busy, run } = useWorkspace();
  // For a pair, rewrite the later concept and keep the first one.
  const target = f.conceptIds[f.conceptIds.length - 1];
  const concept = campaign.concepts.find((c) => c.id === target);
  const account = accounts.find((a) => a.id === concept?.accountId);
  const key = `fix:${f.id}`;

  return (
    <li className={clsx("rounded-xl border bg-panel p-5", f.severity === "fix" ? "border-accent/40" : "border-line")}>
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={f.severity === "fix" ? "accent" : "plain"}>{f.severity === "fix" ? "Must fix" : "Worth a look"}</Tag>
        <span className="text-sm font-medium">{kindLabel[f.kind]}</span>
      </div>
      <p className="mt-2">{f.message}</p>
      <p className="mt-1 text-sm text-muted">{f.suggestion}</p>
      {concept && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant={f.severity === "fix" ? "primary" : "secondary"}
            busy={busy === key}
            onClick={() => run(key, `/api/campaigns/${campaign.id}/concepts/${target}`, "POST", { findingId: f.id })}
          >
            {busy === key ? "Rewriting" : "Rewrite this concept"}
          </Button>
          <span className="text-sm text-muted">
            Rewrites &ldquo;{concept.title}&rdquo; for {account?.name}
          </span>
        </div>
      )}
    </li>
  );
}

// A person approves concepts and signs them off as the campaign's deliverables.
function SignOff() {
  const { campaign, busy, run } = useWorkspace();
  const url = `/api/campaigns/${campaign.id}`;
  const live = campaign.concepts.filter((c) => c.status !== "rejected");
  const approved = deliverables(campaign);
  const fixesFor = (id: string) => campaign.report?.findings.filter((f) => f.severity === "fix" && f.conceptIds.includes(id)).length ?? 0;
  const blocking = approved.filter((c) => fixesFor(c.id) > 0);
  const setStatus = (id: string, status: "approved" | "draft") =>
    run(`so:${id}`, url, "PATCH", { concepts: campaign.concepts.map((x) => (x.id === id ? { ...x, status } : x)) });

  if (campaign.signedOffAt)
    return (
      <section className="mb-8 rounded-xl border border-[#11704f]/30 bg-[#e1f4ec]/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CircleCheck aria-hidden className="size-5 text-[#11704f]" />
              Signed off. {approved.length} deliverable{approved.length === 1 ? "" : "s"} ready for production.
            </h2>
            <p className="mt-1 text-sm text-muted">
              {new Date(campaign.signedOffAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}. Every approved concept passed the checks.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`${url}/export`} className="press inline-flex min-h-9 items-center rounded-md border border-line bg-panel px-3.5 text-sm font-medium hover:border-ink/30">
              Export production pack
            </a>
            <Link href="?stage=results" scroll={false} className="press inline-flex min-h-9 items-center rounded-md bg-ink px-3.5 text-sm font-medium text-white hover:bg-ink/85">
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
            Approve the concepts you want to produce. Sign-off unlocks when none of them has a must-fix problem. A person makes this call, not the AI.
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
        <p className="mt-3 text-sm text-accent">
          {blocking.length} approved concept{blocking.length === 1 ? " has" : "s have"} must-fix problems. Rewrite or unapprove {blocking.length === 1 ? "it" : "them"}.
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
                  <span className={clsx("mt-1 block text-xs", fixes ? "text-accent" : "text-[#11704f]")}>
                    {fixes ? `${fixes} must fix` : "Passes checks"}
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
