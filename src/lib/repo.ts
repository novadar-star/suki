import "server-only";
import { trends as seedTrends } from "@/data/trends";
import { getDoc, listDocs, putDoc } from "./db";
import type { Trend } from "./types";
import type { Campaign } from "./schemas";
import { normalize } from "./campaign";

// Seeded trends live in code. Saved copies (with evidence) and submitted trends live in storage.
export async function getTrends(): Promise<Trend[]> {
  const saved = await listDocs<Trend>("trend");
  const byId = new Map(saved.map((t) => [t.id, t]));
  const merged = seedTrends.map((t) => byId.get(t.id) ?? t);
  const submitted = saved.filter((t) => !seedTrends.some((s) => s.id === t.id));
  return [...submitted.sort((a, b) => b.addedOn.localeCompare(a.addedOn)), ...merged];
}

export async function getTrend(id: string): Promise<Trend | null> {
  return (await getDoc<Trend>("trend", id)) ?? seedTrends.find((t) => t.id === id) ?? null;
}

export const saveTrend = (t: Trend) => putDoc("trend", t.id, t);

export const getCampaigns = async () => (await listDocs<Campaign>("campaign")).map(normalize);
export const getCampaign = async (id: string) => {
  const c = await getDoc<Campaign>("campaign", id);
  return c ? normalize(c) : null;
};
export const saveCampaign = (c: Campaign) => putDoc("campaign", c.id, { ...c, updatedAt: new Date().toISOString() });
