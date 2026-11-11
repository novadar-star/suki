import { NextResponse } from "next/server";
import { getTrend, saveTrend } from "@/lib/repo";
import { evidenceIn } from "@/lib/schemas";
import { body, fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const t = await getTrend(id);
    if (!t) return notFound("Trend");
    const e = evidenceIn.parse(await body(req));
    if (e.observedOn > new Date().toISOString().slice(0, 10))
      return NextResponse.json({ error: "The date can't be in the future." }, { status: 400 });
    const next = { ...t, evidence: [{ ...e, id: crypto.randomUUID().slice(0, 8), addedBy: "You" }, ...t.evidence] };
    return NextResponse.json(await saveTrend(next), { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
