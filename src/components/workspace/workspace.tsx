"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
import { api } from "@/lib/client";
import type { Campaign } from "@/lib/schemas";
import type { Confidence, Trend } from "@/lib/types";
import { ErrorNote } from "../button";
import { AccountsStage, BriefStage, TrendsStage } from "./setup-stages";
import { PlaybooksStage } from "./playbooks";
import { ContentStage } from "./content";
import { ReviewStage } from "./review";

export type TrendView = Trend & { confidence: Confidence };

const STAGES = [
  { id: "brief", label: "Brief" },
  { id: "accounts", label: "Accounts" },
  { id: "trends", label: "Trends" },
  { id: "playbooks", label: "Playbooks" },
  { id: "content", label: "Content" },
  { id: "review", label: "Portfolio review" },
] as const;
export type StageId = (typeof STAGES)[number]["id"];

type Ctx = {
  campaign: Campaign;
  trends: TrendView[];
  busy: string | null;
  // Runs a request, saves the returned campaign, and shows any error.
  run: (key: string, path: string, method: "POST" | "PATCH", data?: unknown) => Promise<boolean>;
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
  }
}

export function Workspace({ initial, trends, stage }: { initial: Campaign; trends: TrendView[]; stage: StageId }) {
  const [campaign, setCampaign] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const current = STAGES.some((s) => s.id === stage) ? stage : "brief";

  async function run(key: string, path: string, method: "POST" | "PATCH", data?: unknown) {
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
    <WorkspaceContext.Provider value={{ campaign, trends, busy, run }}>
      <header className="mb-6">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          Campaigns
        </Link>
        <h1 className="mt-1 text-3xl font-bold">{campaign.name}</h1>
      </header>

      <nav aria-label="Campaign stages" className="mb-8 overflow-x-auto">
        <ol className="flex min-w-max gap-1 border-b border-line">
          {STAGES.map((s, i) => {
            const active = s.id === current;
            const done = isDone(campaign, s.id);
            return (
              <li key={s.id}>
                <Link
                  href={`?stage=${s.id}`}
                  scroll={false}
                  aria-current={active ? "step" : undefined}
                  className={clsx(
                    "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm",
                    active ? "border-ink font-semibold text-ink" : "border-transparent text-muted hover:text-ink",
                  )}
                >
                  <span
                    className={clsx(
                      "grid size-5 place-items-center rounded-full text-[11px]",
                      done && !active ? "bg-ink text-white" : "border border-line",
                    )}
                  >
                    {done && !active ? <Check aria-label="done" className="size-3" /> : i + 1}
                  </span>
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mb-4">
        <ErrorNote message={error} />
      </div>

      {current === "brief" && <BriefStage />}
      {current === "accounts" && <AccountsStage />}
      {current === "trends" && <TrendsStage />}
      {current === "playbooks" && <PlaybooksStage />}
      {current === "content" && <ContentStage />}
      {current === "review" && <ReviewStage />}

      {next && (
        <div className="mt-10 border-t border-line pt-5">
          <Link href={`?stage=${next.id}`} className="press inline-block rounded-md border border-line bg-panel px-4 py-2 text-sm font-medium hover:border-ink/30">
            Next: {next.label}
          </Link>
        </div>
      )}
    </WorkspaceContext.Provider>
  );
}
