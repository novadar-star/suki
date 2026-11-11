import { accounts } from "@/data/accounts";
import { angleLabel, type Campaign, type CampaignStatus, type Concept, type ResultRow } from "./schemas";

// Older saved campaigns were made before these fields existed.
export function normalize(c: Campaign): Campaign {
  return {
    ...c,
    objectiveType: c.objectiveType ?? "organic",
    keyMessage: c.keyMessage ?? "",
    deadline: c.deadline ?? "",
    signedOffAt: c.signedOffAt ?? null,
    results: c.results ?? null,
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

// ---------- Results ----------

export type Scored = {
  concept: Concept;
  row: ResultRow;
  // The one number each objective is judged on.
  primary: number;
  primaryLabel: string;
  secondary: string;
};

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const money = (n: number) => `AUD ${n.toFixed(2)}`;

export function score(c: Campaign, concept: Concept, row: ResultRow): Scored {
  if (c.objectiveType === "paid") {
    const spend = row.spend ?? 0;
    const roas = spend > 0 ? (row.revenue ?? 0) / spend : 0;
    const cpa = row.purchases ? spend / row.purchases : 0;
    const ctr = row.clicks && row.views ? row.clicks / row.views : 0;
    return {
      concept,
      row,
      primary: roas,
      primaryLabel: `ROAS ${roas.toFixed(2)}x`,
      secondary: `${row.purchases ?? 0} purchases · CPA ${cpa ? money(cpa) : "n/a"}${ctr ? ` · CTR ${pct(ctr)}` : ""}`,
    };
  }
  const views = row.views ?? 0;
  const engaged = views ? ((row.saves ?? 0) + (row.shares ?? 0)) / views : 0;
  // Watch time matters most for organic reach, then saves and shares.
  const primary = (row.avgWatchPct ?? 0) / 100 + engaged * 10;
  return {
    concept,
    row,
    primary,
    primaryLabel: `${row.avgWatchPct ?? 0}% watched`,
    secondary: `${views.toLocaleString("en-US")} views · saves+shares ${pct(engaged)}`,
  };
}

export type Analysis = {
  ranked: Scored[];
  best: Scored;
  worst: Scored;
  learnings: string[];
  nextTests: string[];
  caveat: string;
};

const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

// Plain rules on the numbers the team entered. No AI and no outside data.
export function analyze(c: Campaign): Analysis | null {
  if (!c.results) return null;
  const ranked = c.results.rows
    .map((r) => {
      const concept = c.concepts.find((x) => x.id === r.conceptId);
      return concept ? score(c, concept, r) : null;
    })
    .filter((x): x is Scored => !!x)
    .sort((a, b) => b.primary - a.primary);
  if (!ranked.length) return null;
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const b = best.concept;
  const w = worst.concept;

  const learnings = [
    `"${b.title}" (${accName(b.accountId)}, ${angleLabel[b.angleType]}, ${b.format}) led with ${best.primaryLabel}.`,
    ranked.length > 1
      ? `"${w.title}" (${accName(w.accountId)}, ${angleLabel[w.angleType]}) was lowest with ${worst.primaryLabel}.`
      : "Only one deliverable has results, so there is nothing to compare yet.",
    `Winning hook to build on: "${b.hook}"`,
  ];

  const nextTests = [
    `Write two new ${angleLabel[b.angleType].toLowerCase()} concepts for ${accName(b.accountId)} with fresh hooks, keeping the ${b.format} format.`,
  ];
  if (ranked.length > 1 && w.accountId !== b.accountId)
    nextTests.push(`Try the ${angleLabel[b.angleType].toLowerCase()} angle on ${accName(w.accountId)}, written in that account's own voice.`);
  if (ranked.length > 1 && w.angleType !== b.angleType)
    nextTests.push(`Pause the ${angleLabel[w.angleType].toLowerCase()} angle until a new hook is ready.`);
  if (c.objectiveType === "paid") nextTests.push("Keep the product in the first two seconds and test one CTA change at a time.");
  else nextTests.push("Test a different first line on the winner. Change only the hook.");

  return {
    ranked,
    best,
    worst,
    learnings,
    nextTests,
    caveat: `Based on ${ranked.length} post${ranked.length === 1 ? "" : "s"}. Treat this as a direction to test, not proof.`,
  };
}

// Clearly labeled made-up numbers so the loop can be shown without real posts.
// Deterministic from the concept id so the demo is repeatable.
export function sampleRows(c: Campaign): ResultRow[] {
  return deliverables(c).map((k, i) => {
    let h = 7 + i;
    for (const ch of k.id + k.hook) h = (h * 31 + ch.charCodeAt(0)) % 100003;
    const r = (min: number, max: number) => {
      h = (h * 16807) % 2147483647;
      return Math.round(min + ((h % 1000) / 1000) * (max - min));
    };
    const views = r(4000, 60000);
    if (c.objectiveType === "paid") {
      const spend = r(150, 600);
      const purchases = r(2, 40);
      return { conceptId: k.id, views, spend, clicks: Math.round(views * (r(6, 25) / 1000)), purchases, revenue: purchases * 58 };
    }
    return { conceptId: k.id, views, avgWatchPct: r(18, 72), saves: Math.round(views * (r(4, 40) / 1000)), shares: Math.round(views * (r(1, 15) / 1000)) };
  });
}
