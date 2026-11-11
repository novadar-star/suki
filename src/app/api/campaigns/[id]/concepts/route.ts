import { NextResponse } from "next/server";
import { z } from "zod";
import { getCampaign, saveCampaign } from "@/lib/repo";
import { makeConcepts } from "@/lib/engine";
import { body, fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };
const input = z.object({ accountId: z.string().max(60).optional() });

export async function POST(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    let c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    const { accountId } = input.parse(await body(req));
    const targets = accountId ? [accountId] : c.playbooks.filter((p) => p.status === "approved").map((p) => p.accountId);
    if (!targets.length) return NextResponse.json({ error: "Approve at least one playbook first." }, { status: 422 });
    for (const a of targets) {
      const made = await makeConcepts(c, a);
      c = { ...c, concepts: [...c.concepts.filter((x) => x.accountId !== a), ...made], report: null, signedOffAt: null, results: null };
      await saveCampaign(c);
    }
    return NextResponse.json(c);
  } catch (e) {
    return fail(e);
  }
}
