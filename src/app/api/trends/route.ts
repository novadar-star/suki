import { NextResponse } from "next/server";
import { analyzeTrend, trendOrigin } from "@/lib/engine";
import { saveTrend } from "@/lib/repo";
import { newTrendIn } from "@/lib/schemas";
import type { Trend } from "@/lib/types";
import { body, fail } from "@/lib/http";

// Saves a submitted reference. The AI reads the written description only.
export async function POST(req: Request) {
  try {
    const input = newTrendIn.parse(await body(req));
    const analysis = await analyzeTrend(input);
    const t: Trend = {
      id: `ref-${crypto.randomUUID().slice(0, 8)}`,
      title: input.title,
      platform: input.platform,
      kind: "submitted",
      description: input.description,
      sourceUrl: input.sourceUrl,
      addedOn: new Date().toISOString().slice(0, 10),
      addedBy: "You",
      tags: [],
      // A submission only counts as evidence when it has a link someone can check.
      evidence: input.sourceUrl
        ? [
            {
              id: crypto.randomUUID().slice(0, 8),
              type: "feed_observation",
              note: "The submitted video.",
              url: input.sourceUrl,
              observedOn: input.observedOn,
              addedBy: "You",
            },
          ]
        : [],
      analysis: { origin: trendOrigin, ...analysis },
    };
    return NextResponse.json(await saveTrend(t), { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
