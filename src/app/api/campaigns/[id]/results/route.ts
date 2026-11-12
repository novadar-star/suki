import { NextResponse } from "next/server";
import { getCampaign, saveCampaign, getStudioData } from "@/lib/repo";
import { resultsIn } from "@/lib/schemas";
import { analyze, deliverables } from "@/lib/campaign";
import { body, fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    if (!c.signedOffAt) return NextResponse.json({ error: "Sign off the deliverables before adding results." }, { status: 422 });
    const input = resultsIn.parse(await body(req));
    const ids = new Set(deliverables(c).map((x) => x.id));
    const rows = input.rows.filter((r) => ids.has(r.conceptId));
    if (!rows.length) return NextResponse.json({ error: "No results match the signed-off deliverables." }, { status: 422 });
    const next = { ...c, results: { ...input, rows, enteredAt: new Date().toISOString() } };
    // The Analyst drafts insights. A person accepts or dismisses each one.
    return NextResponse.json(await saveCampaign({ ...next, insights: analyze(next, (await getStudioData()).accounts).insights }));
  } catch (e) {
    return fail(e);
  }
}
