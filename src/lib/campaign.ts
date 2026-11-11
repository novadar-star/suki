import { accounts } from "@/data/accounts";
import { angleLabel, type Campaign, type CampaignStatus, type Concept, type Insight, type InsightDimension, type ResultRow } from "./schemas";

// Older saved campaigns were made before these fields existed.
export function normalize(c: Campaign): Campaign {
  return {
    ...c,
    objectiveType: c.objectiveType ?? "organic",
    keyMessage: c.keyMessage ?? "",
    deadline: c.deadline ?? "",
    signedOffAt: c.signedOffAt ?? null,
    results: c.results ?? null,
    insights: c.insights ?? [],
    qcOverrides: c.qcOverrides ?? [],
    round: c.round ?? 1,
    learnings: c.learnings ?? [],
  };
}

export function statusOf(c: Campaign): CampaignStatus {
  if (c.results) return "completed";
  if (c.signedOffAt) return "approved";
  if (c.concepts.length) return "in_review";
  if (c.playbooks.length) return "in_progress";
  return "draft";
}

export const deliverables = (c: Campaign) => c.concepts.filter((x) => x.status === "approved");

// ---------- Asset IDs ----------

// {client}-{product}-{campaign}-{concept}-{script}-{variant}. Derived, never stored,
// so the same concept always gets the same ID. The campaign part keeps IDs unique
// across campaigns.
export function assetId(c: Campaign, conceptId: string) {
  const n = c.concepts.findIndex((x) => x.id === conceptId) + 1;
  return `LM-HA4D-${c.id.slice(0, 4).toUpperCase()}-C${String(n).padStart(2, "0")}-S01-V1`;
}

// ---------- Results ----------

// PI-04: the Analyst only states a pattern when each compared group has at
// least this many assets, each with at least this much volume.
export const MIN_ASSETS = 3;
export const MIN_VOLUME = 1000;

export type Scored = {
  concept: Concept;
  row: ResultRow;
  // The one number each objective is judged on.
  primary: number;
  primaryLabel: string;
  secondary: string;
  enoughVolume: boolean;
};

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const money = (n: number) => `AUD ${n.toFixed(2)}`;

export function score(c: Campaign, concept: Concept, row: ResultRow): Scored {
  const views = row.views ?? 0;
  const enoughVolume = views >= MIN_VOLUME;
  if (c.objectiveType === "paid") {
    const spend = row.spend ?? 0;
    const roas = spend > 0 ? (row.revenue ?? 0) / spend : 0;
    const cpa = row.purchases ? spend / row.purchases : 0;
    const ctr = row.clicks && views ? row.clicks / views : 0;
    return {
      concept,
      row,
      primary: roas,
      primaryLabel: `ROAS ${roas.toFixed(2)}x`,
      secondary: `${views.toLocaleString("en-US")} impressions · ${row.purchases ?? 0} purchases · CPA ${cpa ? money(cpa) : "n/a"}${ctr ? ` · CTR ${pct(ctr)}` : ""}`,
      enoughVolume,
    };
  }
  const engaged = views ? ((row.saves ?? 0) + (row.shares ?? 0)) / views : 0;
  return {
    concept,
    row,
    primary: row.avgWatchPct ?? 0,
    primaryLabel: `${row.avgWatchPct ?? 0}% watched`,
    secondary: `${views.toLocaleString("en-US")} views · saves+shares ${pct(engaged)}`,
    enoughVolume,
  };
}

export type DataGap = { dimension: InsightDimension; message: string };

export type Analysis = {
  ranked: Scored[];
  insights: Insight[];
  gaps: DataGap[];
  metric: string;
};

const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;
const dimLabel: Record<InsightDimension, string> = { account: "account", angle: "angle", format: "format" };
const keyOf: Record<InsightDimension, (k: Concept) => string> = {
  account: (k) => accName(k.accountId),
  angle: (k) => angleLabel[k.angleType],
  format: (k) => k.format,
};

export function scoreAll(c: Campaign): Scored[] {
  if (!c.results) return [];
  return c.results.rows
    .map((r) => {
      const concept = c.concepts.find((x) => x.id === r.conceptId);
      return concept ? score(c, concept, r) : null;
    })
    .filter((x): x is Scored => !!x)
    .sort((a, b) => b.primary - a.primary);
}

// Plain rules on the numbers the team entered. No AI and no outside data.
// A pattern is only stated when two groups each clear the PI-04 thresholds.
export function analyze(c: Campaign): Analysis {
  const ranked = scoreAll(c);
  const paid = c.objectiveType === "paid";
  const metric = paid ? "ROAS" : "average watched %";
  const fmt = (n: number) => (paid ? `${n.toFixed(2)}x` : `${n.toFixed(0)}%`);
  const usable = ranked.filter((r) => r.enoughVolume);
  const insights: Insight[] = [];
  const gaps: DataGap[] = [];

  for (const dimension of ["account", "angle", "format"] as InsightDimension[]) {
    const groups = new Map<string, Scored[]>();
    for (const r of usable) {
      const k = keyOf[dimension](r.concept);
      groups.set(k, [...(groups.get(k) ?? []), r]);
    }
    const all = [...groups.entries()].map(([label, rs]) => ({ label, n: rs.length, mean: rs.reduce((t, r) => t + r.primary, 0) / rs.length }));
    const big = all.filter((g) => g.n >= MIN_ASSETS).sort((a, b) => b.mean - a.mean);
    if (big.length < 2) {
      gaps.push({
        dimension,
        message: `Not enough data to compare by ${dimLabel[dimension]}. ${
          all.length ? all.map((g) => `${g.label}: ${g.n}`).join(", ") + "." : "No assets with enough volume."
        } Each group needs ${MIN_ASSETS}+ assets with ${MIN_VOLUME.toLocaleString("en-US")}+ ${paid ? "impressions" : "views"}, and at least two groups.`,
      });
      continue;
    }
    const [top, low] = [big[0], big[big.length - 1]];
    if (top.mean < low.mean * 1.1) {
      gaps.push({ dimension, message: `No clear difference by ${dimLabel[dimension]}. Groups are within 10% of each other on ${metric}.` });
      continue;
    }
    insights.push({
      id: `${dimension}:${top.label}>${low.label}`,
      dimension,
      statement: `By ${dimLabel[dimension]}, ${top.label} averaged ${fmt(top.mean)}${paid ? " ROAS" : " watched"}, against ${fmt(low.mean)} for ${low.label} (${top.n} and ${low.n} assets).`,
      nextTest:
        dimension === "account"
          ? `Give ${low.label} a new angle, and keep what is working on ${top.label}.`
          : `Make more ${top.label.toLowerCase()} concepts with new hooks, and pause ${low.label.toLowerCase()} until a new hook is ready.`,
      groups: big,
      sampleSize: big.reduce((t, g) => t + g.n, 0),
      status: "draft",
    });
  }

  // Keep decisions the team already made on the same insight.
  for (const i of insights) {
    const prev = c.insights.find((p) => p.id === i.id);
    if (prev) Object.assign(i, { status: prev.status, decidedAt: prev.decidedAt });
  }
  return { ranked, insights, gaps, metric };
}

// Clearly labeled made-up numbers so the loop can be shown without real posts.
// Deterministic so the demo is repeatable. Accounts get different baselines so
// approving all nine concepts shows a pattern by account, while angle and format
// stay below the sample-size rule.
export function sampleRows(c: Campaign): ResultRow[] {
  const base = [1.0, 0.7, 0.5];
  return deliverables(c).map((k, i) => {
    let h = 7 + i;
    for (const ch of k.id + k.hook) h = (h * 31 + ch.charCodeAt(0)) % 100003;
    const r = (min: number, max: number) => {
      h = (h * 16807) % 2147483647;
      return Math.round(min + ((h % 1000) / 1000) * (max - min));
    };
    const b = base[Math.max(0, c.accountIds.indexOf(k.accountId)) % base.length];
    const views = r(4000, 60000);
    if (c.objectiveType === "paid") {
      const spend = r(200, 400);
      const purchases = Math.max(1, Math.round(r(14, 22) * b));
      return { conceptId: k.id, views, spend, clicks: Math.round(views * (r(8, 20) / 1000)), purchases, revenue: purchases * 58 };
    }
    return {
      conceptId: k.id,
      views,
      avgWatchPct: Math.round(r(50, 62) * b),
      saves: Math.round(views * (r(4, 40) / 1000)),
      shares: Math.round(views * (r(1, 15) / 1000)),
    };
  });
}
