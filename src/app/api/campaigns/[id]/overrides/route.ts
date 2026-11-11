import { NextResponse } from "next/server";
import { getCampaign, saveCampaign } from "@/lib/repo";
import { overrideIn } from "@/lib/schemas";
import { body, fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// QC-06: a warning can be overridden with a written reason. Blockers cannot.
export async function POST(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    const { findingId, reason } = overrideIn.parse(await body(req));
    const f = c.report?.findings.find((x) => x.id === findingId);
    if (!f) return notFound("Finding");
    if (f.severity === "fix") return NextResponse.json({ error: "Blockers can't be overridden. Fix the concept instead." }, { status: 422 });
    const qcOverrides = [
      ...c.qcOverrides.filter((o) => o.findingId !== findingId),
      // No login yet, so the role is the demo role.
      { findingId, reason, by: "Strategist (demo mode)", at: new Date().toISOString() },
    ];
    return NextResponse.json(await saveCampaign({ ...c, qcOverrides }));
  } catch (e) {
    return fail(e);
  }
}

// Undo an override.
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    const findingId = new URL(req.url).searchParams.get("findingId") ?? "";
    return NextResponse.json(await saveCampaign({ ...c, qcOverrides: c.qcOverrides.filter((o) => o.findingId !== findingId) }));
  } catch (e) {
    return fail(e);
  }
}
