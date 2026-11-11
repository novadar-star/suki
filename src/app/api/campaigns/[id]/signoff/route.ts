import { NextResponse } from "next/server";
import { getCampaign, saveCampaign } from "@/lib/repo";
import { runChecks } from "@/lib/checks";
import { deliverables } from "@/lib/campaign";
import { fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// A person signs off the approved concepts as the campaign's deliverables.
// The checks run again on the server so sign-off can't skip them.
export async function POST(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    const approved = deliverables(c);
    if (!approved.length) return NextResponse.json({ error: "Approve at least one concept first." }, { status: 422 });
    const report = runChecks(c.concepts, c.objectiveType);
    const blocking = report.findings.filter((f) => f.severity === "fix" && f.conceptIds.some((x) => approved.some((a) => a.id === x)));
    if (blocking.length)
      return NextResponse.json({ error: `${blocking.length} must-fix problem${blocking.length === 1 ? "" : "s"} on approved concepts. Fix them first.` }, { status: 422 });
    return NextResponse.json(await saveCampaign({ ...c, report, signedOffAt: new Date().toISOString() }));
  } catch (e) {
    return fail(e);
  }
}

// Reopen the campaign for changes.
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    return NextResponse.json(await saveCampaign({ ...c, signedOffAt: null, results: null }));
  } catch (e) {
    return fail(e);
  }
}
