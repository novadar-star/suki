import { NextResponse } from "next/server";
import { z } from "zod";
import { getCampaign, saveCampaign } from "@/lib/repo";
import { makePlaybook } from "@/lib/engine";
import { body, fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };
const input = z.object({ accountId: z.string().max(60).optional() });

// Makes playbooks one account at a time, so each one can avoid the angles before it.
export async function POST(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    let c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    const { accountId } = input.parse(await body(req));
    const targets = accountId ? [accountId] : c.accountIds;
    if (accountId && !c.accountIds.includes(accountId)) return notFound("Account");
    for (const a of targets) {
      const p = await makePlaybook(c, a);
      c = { ...c, playbooks: [...c.playbooks.filter((x) => x.accountId !== a), p] };
      c.concepts = c.concepts.filter((x) => x.accountId !== a);
      c.report = null;
      c.signedOffAt = null;
      c.results = null;
      await saveCampaign(c);
    }
    return NextResponse.json(c);
  } catch (e) {
    return fail(e);
  }
}
