import { NextResponse } from "next/server";
import { getCampaign, saveCampaign, getStudioData } from "@/lib/repo";
import { runChecks } from "@/lib/checks";
import { fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    if (!c.concepts.length) return NextResponse.json({ error: "Make concepts first." }, { status: 422 });
    return NextResponse.json(await saveCampaign({ ...c, report: runChecks(c.concepts, c.objectiveType, await getStudioData()) }));
  } catch (e) {
    return fail(e);
  }
}
