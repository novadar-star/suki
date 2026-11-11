import { NextResponse } from "next/server";
import { z } from "zod";
import { getCampaign, saveCampaign } from "@/lib/repo";
import { remakeConcept } from "@/lib/engine";
import { runChecks } from "@/lib/checks";
import { body, fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string; cid: string }> };
const input = z.object({ findingId: z.string().max(200).optional() });

// Rewrites one concept. If it came from a finding, the check runs again right away.
export async function POST(req: Request, { params }: Ctx) {
  try {
    const { id, cid } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    const { findingId } = input.parse(await body(req));
    const fresh = await remakeConcept(c, cid, findingId);
    const concepts = c.concepts.map((x) => (x.id === cid ? fresh : x));
    const next = { ...c, concepts, report: c.report ? runChecks(concepts) : null };
    return NextResponse.json(await saveCampaign(next));
  } catch (e) {
    return fail(e);
  }
}
