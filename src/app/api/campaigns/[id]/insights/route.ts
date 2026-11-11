import { NextResponse } from "next/server";
import { getCampaign, saveCampaign } from "@/lib/repo";
import { insightDecisionIn } from "@/lib/schemas";
import { body, fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// A person accepts or dismisses an Analyst draft insight.
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    const { id: insightId, status } = insightDecisionIn.parse(await body(req));
    if (!c.insights.some((i) => i.id === insightId)) return notFound("Insight");
    const insights = c.insights.map((i) =>
      i.id === insightId ? { ...i, status, decidedAt: status === "draft" ? undefined : new Date().toISOString() } : i,
    );
    return NextResponse.json(await saveCampaign({ ...c, insights }));
  } catch (e) {
    return fail(e);
  }
}
