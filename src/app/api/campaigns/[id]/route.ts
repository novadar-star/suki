import { NextResponse } from "next/server";
import { getCampaign, saveCampaign } from "@/lib/repo";
import { updateCampaignIn } from "@/lib/schemas";
import { body, fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const c = await getCampaign(id);
  return c ? NextResponse.json(c) : notFound("Campaign");
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    const patch = updateCampaignIn.parse(await body(req));
    const next = { ...c, ...patch };
    // Changing the setup makes later stages out of date.
    if (patch.accountIds || patch.trendIds) {
      next.playbooks = next.playbooks.filter((p) => next.accountIds.includes(p.accountId) && next.trendIds.includes(p.trendId));
      next.concepts = next.concepts.filter((x) => next.playbooks.some((p) => p.accountId === x.accountId && p.status === "approved"));
    }
    if (patch.concepts || patch.accountIds || patch.trendIds) next.report = null;
    return NextResponse.json(await saveCampaign(next));
  } catch (e) {
    return fail(e);
  }
}
