import "server-only";
import { aiMode, generateJson } from "./ai";
import { adaptForPaid, adaptPlaybookForPaid, demoConcepts, demoPlaybook, demoRevision, demoTrendAnalysis, DEMO_TREND_SAMPLE } from "./demo";
import { SYSTEM, conceptsPrompt, findingInstruction, playbookPrompt, regeneratePrompt, trendAnalysisPrompt } from "./prompts";
import { getStudioData, getTrends } from "./repo";
import type { Account } from "./types";
import { conceptOut, conceptsOut, playbookOut, trendAnalysisOut, type Campaign, type Concept, type Playbook } from "./schemas";

export class EngineError extends Error {}

const account = (accounts: Account[], id: string) => {
  const a = accounts.find((x) => x.id === id);
  if (!a) throw new EngineError(`Unknown account ${id}.`);
  return a;
};

async function selectedTrends(c: Campaign) {
  const all = await getTrends();
  const picked = all.filter((t) => c.trendIds.includes(t.id));
  if (!picked.length) throw new EngineError("Pick at least one trend first.");
  return picked;
}

const newId = () => crypto.randomUUID().slice(0, 8);

export async function makePlaybook(c: Campaign, accountId: string): Promise<Playbook> {
  const data = await getStudioData();
  const a = account(data.accounts, accountId);
  const trends = await selectedTrends(c);
  const others = c.playbooks.filter((p) => p.accountId !== accountId && p.status !== "rejected");
  const out =
    aiMode === "live"
      ? await generateJson({ system: SYSTEM, prompt: playbookPrompt(c, a, trends, others, data.brand), schema: playbookOut })
      : c.objectiveType === "paid"
        ? adaptPlaybookForPaid(demoPlaybook(a, trends))
        : demoPlaybook(a, trends);
  if (!trends.some((t) => t.id === out.trendId)) out.trendId = trends[0].id;
  return { ...out, accountId, status: "draft", origin: aiMode === "live" ? "ai" : "demo" };
}

export async function makeConcepts(c: Campaign, accountId: string): Promise<Concept[]> {
  const data = await getStudioData();
  const a = account(data.accounts, accountId);
  const p = c.playbooks.find((x) => x.accountId === accountId && x.status === "approved");
  if (!p) throw new EngineError(`Approve the ${a.name} playbook first.`);
  const trend = (await getTrends()).find((t) => t.id === p.trendId);
  if (!trend) throw new EngineError("The playbook's trend no longer exists.");
  const otherHooks = c.concepts.filter((x) => x.accountId !== accountId && x.status !== "rejected").map((x) => x.hook);
  const out =
    aiMode === "live"
      ? (await generateJson({ system: SYSTEM, prompt: conceptsPrompt(c, a, p, trend, otherHooks, data.brand), schema: conceptsOut })).concepts
      : demoConcepts(a, trend).map((x) => (c.objectiveType === "paid" ? adaptForPaid(x) : x));
  return out.map((x) => ({ ...x, id: newId(), accountId, trendId: trend.id, status: "draft", origin: aiMode === "live" ? "ai" : "demo" }));
}

export async function remakeConcept(c: Campaign, conceptId: string, findingId?: string): Promise<Concept> {
  const current = c.concepts.find((x) => x.id === conceptId);
  if (!current) throw new EngineError("Concept not found.");
  const data = await getStudioData();
  const a = account(data.accounts, current.accountId);
  const trend = (await getTrends()).find((t) => t.id === current.trendId);
  if (!trend) throw new EngineError("The concept's trend no longer exists.");
  const finding = findingId ? c.report?.findings.find((f) => f.id === findingId) : undefined;
  const siblings = c.concepts.filter((x) => x.id !== conceptId && x.status !== "rejected");
  const out =
    aiMode === "live"
      ? await generateJson({
          system: SYSTEM,
          prompt: regeneratePrompt(c, a, trend, current, siblings, finding && findingInstruction(finding), data.brand),
          schema: conceptOut,
        })
      : (() => {
          const r = demoRevision(a, trend, current.title, siblings.filter((s) => s.accountId === a.id).map((s) => s.angleType));
          return c.objectiveType === "paid" ? adaptForPaid(r) : r;
        })();
  return {
    ...out,
    id: current.id,
    accountId: current.accountId,
    trendId: current.trendId,
    status: "draft",
    origin: aiMode === "live" ? "ai" : "demo",
    revisedFor: finding?.message,
  };
}

export const trendOrigin = aiMode === "live" ? ("ai" as const) : ("demo" as const);

export async function analyzeTrend(input: { title: string; platform: string; description: string }) {
  if (aiMode === "live") return generateJson({ system: SYSTEM, prompt: trendAnalysisPrompt(input), schema: trendAnalysisOut, temperature: 0.4 });
  if (input.description.trim() === DEMO_TREND_SAMPLE.description) return demoTrendAnalysis;
  throw new EngineError("Trend analysis needs a Gemini key. In demo mode, use the sample reference.");
}
