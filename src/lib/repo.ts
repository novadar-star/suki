import "server-only";
import { trends as seedTrends } from "@/data/trends";
import { seedData } from "@/data/seed";
import { deleteDoc, getDoc, listDocs, putDoc } from "./db";
import type { Account, Brand, StudioData, Trend } from "./types";
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

// The brand and the accounts start from the seed in code. The first edit saves a copy, and saved copies win from then on.
export async function getBrand(): Promise<Brand> {
  return (await getDoc<Brand>("brand", seedData.brand.id)) ?? seedData.brand;
}
export const saveBrand = (b: Brand) => putDoc("brand", seedData.brand.id, { ...b, id: seedData.brand.id });

export async function getAccounts(): Promise<Account[]> {
  const saved = await listDocs<Account>("account");
  if (!saved.length) return seedData.accounts;
  const seedOrder = new Map(seedData.accounts.map((a, i) => [a.id, i]));
  return saved.sort((a, b) => (seedOrder.get(a.id) ?? 99) - (seedOrder.get(b.id) ?? 99) || a.name.localeCompare(b.name));
}

// Before the first change, copy the seed accounts into storage so the saved list is complete.
async function ensureSavedAccounts() {
  if ((await listDocs<Account>("account")).length) return;
  for (const a of seedData.accounts) await putDoc("account", a.id, a);
}
export async function saveAccount(a: Account) {
  await ensureSavedAccounts();
  return putDoc("account", a.id, a);
}
export async function removeAccount(id: string) {
  await ensureSavedAccounts();
  await deleteDoc("account", id);
}

export async function getStudioData(): Promise<StudioData> {
  const [brand, accounts] = await Promise.all([getBrand(), getAccounts()]);
  return { brand, accounts };
}
