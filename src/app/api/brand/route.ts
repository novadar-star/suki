import { NextResponse } from "next/server";
import { getBrand, saveBrand } from "@/lib/repo";
import { brandIn } from "@/lib/schemas";
import { body, fail } from "@/lib/http";
import type { Brand, Claim } from "@/lib/types";

const pad = (i: number) => String(i + 1).padStart(2, "0");
const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

// Claim IDs follow position: F-01 for product facts, C-01 for marketing claims.
export async function PATCH(req: Request) {
  try {
    const input = brandIn.parse(await body(req));
    const current = await getBrand();
    const source = input.sourceUrl || "Entered by the team";
    const claims: Claim[] = [
      ...input.facts.map((text, i) => ({ id: `F-${pad(i)}`, text, kind: "product_fact" as const, source })),
      ...input.marketingClaims.map((text, i) => ({ id: `C-${pad(i)}`, text, kind: "marketing_claim" as const, source })),
    ];
    const g = current.guidelines;
    const guidelinesUnchanged =
      same(g.prohibitedClaims, input.prohibitedClaims) && same(g.avoidWords, input.avoidWords) && same(g.disclaimers, input.disclaimers) && same(g.restrictions, input.restrictions);
    const next: Brand = {
      ...current,
      name: input.name,
      description: input.description,
      industry: input.industry,
      targetMarket: input.targetMarket,
      positioning: input.positioning,
      tone: input.tone,
      sourceUrl: input.sourceUrl,
      checkedOn: new Date().toISOString().slice(0, 10),
      product: {
        ...current.product,
        name: input.productName,
        description: input.productDescription,
        size: input.size,
        price: input.price,
        keyIngredients: input.keyIngredients,
        usage: input.usage,
      },
      claims,
      guidelines: {
        // The "sample" label goes away once someone has edited the guidelines.
        isSample: g.isSample && guidelinesUnchanged,
        prohibitedClaims: input.prohibitedClaims,
        avoidWords: input.avoidWords,
        disclaimers: input.disclaimers,
        restrictions: input.restrictions,
      },
    };
    return NextResponse.json(await saveBrand(next));
  } catch (e) {
    return fail(e);
  }
}
