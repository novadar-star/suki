"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
import { api } from "@/lib/client";
import type { Campaign } from "@/lib/schemas";
import type { Confidence, StudioData, Trend } from "@/lib/types";
import { ErrorNote } from "../button";
import { AccountsStage, BriefStage, TrendsStage } from "./setup-stages";
import { PlaybooksStage } from "./playbooks";
import { ContentStage } from "./content";
import { ReviewStage, SignOffStage } from "./review";
import { ResultsStage } from "./results";
import { StatusPill } from "../status-pill";
import { objectiveTypeInfo } from "@/lib/schemas";
import { statusOf } from "@/lib/campaign";
import { fmtDate, Tag } from "../ui";

export type TrendView = Trend & { confidence: Confidence };

const STAGES = [
  { id: "brief", label: "Brief" },
  { id: "accounts", label: "Accounts" },
  { id: "trends", label: "References" },
  { id: "playbooks", label: "Playbooks" },
  { id: "content", label: "Concepts" },
  { id: "review", label: "Review" },
  { id: "signoff", label: "Sign-off" },
  { id: "results", label: "Results" },
] as const;
export type StageId = (typeof STAGES)[number]["id"];

type Ctx = StudioData & {
  campaign: Campaign;
  trends: TrendView[];
  busy: string | null;
  // Runs a request, saves the returned campaign, and shows any error.
  run: (key: string, path: string, method: "POST" | "PATCH" | "DELETE", data?: unknown) => Promise<boolean>;
  // Switches stage in the browser. No server trip, so the switch is instant.
  go: (stage: StageId, toTop?: boolean) => void;
};
const WorkspaceContext = createContext<Ctx | null>(null);
export const useWorkspace = () => useContext(WorkspaceContext)!;

function isDone(c: Campaign, id: StageId) {
  switch (id) {
    case "brief":
      return true;
    case "accounts":
      return c.accountIds.length > 0;
    case "trends":
      return c.trendIds.length > 0;
    case "playbooks":
      return c.playbooks.some((p) => p.status === "approved");
    case "content":
      return c.concepts.length > 0;
    case "review":
      return !!c.report && c.report.findings.every((f) => f.severity !== "fix");
    case "signoff":
      return !!c.signedOffAt;
    case "results":
      return !!c.results;
  }
}

const valid = (s: string | null): StageId => (STAGES.some((x) => x.id === s) ? (s as StageId) : "brief");

// A link to another stage. It keeps a real href, so open-in-new-tab still works.
export function StageLink({ stage, className, children, toTop }: { stage: StageId; className?: string; children: React.ReactNode; toTop?: boolean }) {
  const { go } = useWorkspace();
  return (
    <a
      href={`?stage=${stage}`}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(stage, toTop);
      }}
    >
      {children}
    </a>
  );
}

export function Workspace({ initial, trends, stage, data }: { initial: Campaign; trends: TrendView[]; stage: StageId; data: StudioData }) {
  const [campaign, setCampaign] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<StageId>(valid(stage));

  // Back and forward buttons move between stages too.
  useEffect(() => {
    const onPop = () => setCurrent(valid(new URLSearchParams(window.location.search).get("stage")));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(s: StageId, toTop = false) {
    if (s === current) return;
    window.history.pushState(null, "", `?stage=${s}`);
    setCurrent(s);
    setError(null);
    if (toTop) document.querySelector("main")?.scrollIntoView({ block: "start" });
  }

  async function run(key: string, path: string, method: "POST" | "PATCH" | "DELETE", data?: unknown) {
    setBusy(key);
    setError(null);
    try {
      setCampaign(await api<Campaign>(path, method, data));
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  }

  const index = STAGES.findIndex((s) => s.id === current);
  const next = STAGES[index + 1];

  return (
    <WorkspaceContext.Provider value={{ campaign, trends, busy, run, go, ...data }}>
      <header className="mb-6">
        <Link href="/campaigns" className="text-sm text-muted hover:text-ink">
          Campaigns
        </Link>
        <h1 className="mt-1 text-3xl font-semibold">{campaign.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <StatusPill status={statusOf(campaign)} />
          <Tag tone="ink">{objectiveTypeInfo[campaign.objectiveType].label}</Tag>
          {campaign.round > 1 && <Tag>Round {campaign.round}</Tag>}
          <span>{objectiveTypeInfo[campaign.objectiveType].goal}</span>
          {campaign.deadline && <span>· Due {fmtDate(campaign.deadline)}</span>}
        </div>
      </header>

      <nav aria-label="Campaign stages" className="mb-8 overflow-x-auto">
        <ol className="flex min-w-max gap-1 border-b border-line">
          {STAGES.map((s, i) => {
            const active = s.id === current;
            const done = isDone(campaign, s.id);
            return (
              <li key={s.id}>
                <a
                  href={`?stage=${s.id}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    go(s.id);
                  }}
                  aria-current={active ? "step" : undefined}
                  className={clsx(
                    "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm",
                    active ? "border-ink font-semibold text-ink" : "border-transparent text-muted hover:text-ink",
                  )}
                >
                  <span
                    className={clsx(
                      "grid size-5 place-items-center rounded-full font-mono text-[10px]",
                      done && !active ? "bg-ink text-inv" : "border border-line",
                    )}
                  >
                    {done && !active ? <Check aria-label="done" className="size-3" /> : String(i + 1).padStart(2, "0")}
                  </span>
                  {s.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mb-4">
        <ErrorNote message={error} />
      </div>

      <div key={current} className="stage-in">
      {current === "brief" && <BriefStage />}
      {current === "accounts" && <AccountsStage />}
      {current === "trends" && <TrendsStage />}
      {current === "playbooks" && <PlaybooksStage />}
      {current === "content" && <ContentStage />}
      {current === "review" && <ReviewStage />}
      {current === "signoff" && <SignOffStage />}
      {current === "results" && <ResultsStage />}
      </div>

      {next && (
        <div className="mt-10 border-t border-line pt-5">
          <StageLink stage={next.id} toTop className="press inline-block rounded-md border border-line bg-panel px-4 py-2 text-sm font-medium hover:border-ink/30">
            Next: {next.label}
          </StageLink>
        </div>
      )}
    </WorkspaceContext.Provider>
  );
}
