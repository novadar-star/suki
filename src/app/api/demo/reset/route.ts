import { NextResponse } from "next/server";
import { accounts } from "@/data/accounts";
import { brand } from "@/data/brand";
import { deleteDoc, listDocs } from "@/lib/db";
import { saveCampaign } from "@/lib/repo";
import type { Campaign, ObjectiveType } from "@/lib/schemas";
import { fail } from "@/lib/http";

// DEMO-03: wipe saved campaigns and trend edits, then seed one organic and one
// paid campaign, ready for "Make playbooks".
function seed(id: string, objectiveType: ObjectiveType, name: string, objective: string, deadline: string): Campaign {
  const now = new Date().toISOString();
  return {
    id,
    name,
    brandId: brand.id,
    objectiveType,
    objective,
    keyMessage: "One lightweight step on damp skin, morning and night.",
    targetMarket: "People who want simple skincare that fits a busy day",
    deadline,
    createdAt: now,
    updatedAt: now,
    accountIds: accounts.map((a) => a.id),
    trendIds: ["grwm"],
    playbooks: [],
    concepts: [],
    report: null,
    signedOffAt: null,
    results: null,
    insights: [],
    qcOverrides: [],
    round: 1,
    learnings: [],
  };
}

export async function POST() {
  try {
    for (const kind of ["campaign", "trend"] as const)
      for (const d of await listDocs<{ id: string }>(kind)) await deleteDoc(kind, d.id);
    // Saved one at a time so the organic campaign lists first.
    await saveCampaign(seed("demo0002", "paid", "Serum launch ads", "Drive first purchases from people who already have a skincare routine.", "2026-11-30"));
    await saveCampaign(
      seed("demo0001", "organic", "Hydration that fits real mornings", "Show the serum as one quick, easy step in very different daily routines.", "2026-11-26"),
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
