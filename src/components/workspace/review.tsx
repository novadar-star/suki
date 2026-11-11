"use client";

import clsx from "clsx";
import { accounts } from "@/data/accounts";
import { angleLabel, type Finding } from "@/lib/schemas";
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
          Compares every concept with every other one and with each account&apos;s past hooks. Claims are checked against the Brand Brain. These are fixed rules, not AI scores.
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
