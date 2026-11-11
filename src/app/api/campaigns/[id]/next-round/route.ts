import { NextResponse } from "next/server";
import { getCampaign, saveCampaign } from "@/lib/repo";
import type { Campaign } from "@/lib/schemas";
import { fail, notFound } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// Starts the next round with the same setup and carries the learnings into its brief.
export async function POST(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const c = await getCampaign(id);
    if (!c) return notFound("Campaign");
    if (!c.results) return NextResponse.json({ error: "Add results first." }, { status: 422 });
    const accepted = c.insights.filter((i) => i.status === "accepted");
    const now = new Date().toISOString();
    const sample = c.results?.source === "sample";
    const round = c.round + 1;
    const next: Campaign = {
      ...c,
      id: crypto.randomUUID().slice(0, 8),
      name: `${c.name.replace(/ · Round \d+$/, "")} · Round ${round}`,
      createdAt: now,
      updatedAt: now,
      playbooks: [],
      concepts: [],
      report: null,
      signedOffAt: null,
      results: null,
      parentId: c.id,
      round,
      // Only insights a person accepted are carried forward (PI-05).
      learnings: accepted.flatMap((i) => [`${i.statement}${sample ? " (from sample numbers)" : ""}`, `Test: ${i.nextTest}`]),
      insights: [],
      qcOverrides: [],
    };
    return NextResponse.json(await saveCampaign(next), { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
