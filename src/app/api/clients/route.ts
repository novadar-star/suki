import { NextResponse } from "next/server";
import { z } from "zod";
import { aiMode, generateJson } from "@/lib/ai";
import { getAccounts, saveCampaign, saveNewBrand } from "@/lib/repo";
import { SYSTEM } from "@/lib/prompts";
import { objectiveTypeSchema, type Campaign } from "@/lib/schemas";
import type { Brand } from "@/lib/types";
import { body, fail } from "@/lib/http";

const input = z.object({ brief: z.string().trim().min(10, "Write at least a sentence about the business.").max(1500) });

const line = z.string().trim().min(1).max(200);
const draft = z.object({
  brand: z.object({
    name: line,
    description: z.string().trim().min(1).max(300),
    industry: line,
    targetMarket: line,
    positioning: line,
    tone: line,
    product: z.object({ name: line, description: z.string().trim().min(1).max(300), usage: z.array(line).min(1).max(5) }),
    productFacts: z.array(line).min(2).max(6),
    marketingClaims: z.array(line).min(1).max(5),
    prohibitedClaims: z.array(line).min(2).max(6),
    avoidWords: z.array(z.string().trim().min(1).max(40)).min(2).max(6),
    disclaimers: z.array(line).max(2),
    restrictions: z.array(line).min(1).max(5),
  }),
  campaign: z.object({
    name: z.string().trim().min(1).max(120),
    objectiveType: objectiveTypeSchema,
    objective: z.string().trim().min(1).max(500),
    keyMessage: z.string().trim().max(300),
    targetMarket: z.string().trim().min(1).max(300),
  }),
});

const prompt = (brief: string) => `A traffic studio wrote this brief for a new client:
"""
${brief}
"""

Draft the client's Brand Brain and a first campaign brief from it.
- Use only what the brief says or clearly implies. Do not invent prices, sizes, awards, studies or certifications.
- "productFacts" are plain, checkable statements about the product, taken from the brief.
- "marketingClaims" are short benefit lines the brand could fairly say. Keep them modest.
- "prohibitedClaims" are claims creators must never make for this kind of product (health, safety, results, comparisons).
- "avoidWords" are hype words that would overstate the product.
- "disclaimers" only when this kind of product normally needs one. Otherwise an empty list.
- "objectiveType" is "paid" only if the brief talks about sales, ads or conversions. Otherwise "organic".
- Write in plain English with short sentences.`;

// Makes a new client from a free-text brief, then opens a campaign for it.
export async function POST(req: Request) {
  try {
    const { brief } = input.parse(await body(req));
    if (aiMode !== "live") return NextResponse.json({ error: "Making a new client needs an OpenAI key." }, { status: 422 });
    const d = await generateJson({ system: SYSTEM, prompt: prompt(brief), schema: draft, temperature: 0.4 });
    const now = new Date().toISOString();
    const id = `${d.brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "client"}-${crypto.randomUUID().slice(0, 4)}`;
    const pad = (n: number) => String(n + 1).padStart(2, "0");
    const brand: Brand = {
      id,
      name: d.brand.name,
      description: d.brand.description,
      industry: d.brand.industry,
      targetMarket: d.brand.targetMarket,
      positioning: d.brand.positioning,
      tone: d.brand.tone,
      sourceUrl: "",
      checkedOn: now.slice(0, 10),
      product: { name: d.brand.product.name, description: d.brand.product.description, size: "", price: "", keyIngredients: [], usage: d.brand.product.usage, image: "" },
      claims: [
        ...d.brand.productFacts.map((text, i) => ({ id: `F-${pad(i)}`, text, kind: "product_fact" as const, source: "Client brief" })),
        ...d.brand.marketingClaims.map((text, i) => ({ id: `C-${pad(i)}`, text, kind: "marketing_claim" as const, source: "Client brief" })),
      ],
      guidelines: {
        isSample: true,
        prohibitedClaims: d.brand.prohibitedClaims,
        avoidWords: d.brand.avoidWords,
        disclaimers: d.brand.disclaimers,
        restrictions: d.brand.restrictions,
      },
    };
    await saveNewBrand(brand);
    const accounts = await getAccounts();
    const c: Campaign = {
      id: crypto.randomUUID().slice(0, 8),
      ...d.campaign,
      deadline: "",
      brandId: id,
      createdAt: now,
      updatedAt: now,
      accountIds: accounts.map((a) => a.id),
      trendIds: [],
      playbooks: [],
      concepts: [],
      report: null,
      signedOffAt: null,
      results: null,
      insights: [],
      qcOverrides: [],
      round: 1,
      learnings: [],
    };
    return NextResponse.json(await saveCampaign(c), { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
