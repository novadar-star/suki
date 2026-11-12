import { NextResponse } from "next/server";
import { saveCampaign, getStudioData } from "@/lib/repo";
import { createCampaignIn, type Campaign } from "@/lib/schemas";
import { body, fail } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const input = createCampaignIn.parse(await body(req));
    const { brand, accounts } = await getStudioData();
    const now = new Date().toISOString();
    const c: Campaign = {
      id: crypto.randomUUID().slice(0, 8),
      ...input,
      brandId: brand.id,
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
