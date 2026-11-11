// PI-04: no pattern below 3 assets per group; a pattern by account with 9 deliverables.
import { accounts } from "@/data/accounts";
import { trends } from "@/data/trends";
import { demoConcepts } from "@/lib/demo";
import { analyze, assetId, normalize, sampleRows } from "@/lib/campaign";
import type { Campaign, Concept } from "@/lib/schemas";

const grwm = trends.find((t) => t.id === "grwm")!;
const concepts: Concept[] = accounts.flatMap((a) =>
  demoConcepts(a, grwm).map((c, i) => ({ ...c, id: `${a.id}-${i}`, accountId: a.id, trendId: "grwm", status: "approved" as const, origin: "demo" as const })),
);
function run(label: string, approvedCount: number, type: "organic" | "paid") {
  const cs = concepts.map((c, i) => ({ ...c, status: i < approvedCount ? ("approved" as const) : ("draft" as const) }));
  // Approve evenly across accounts when fewer than 9.
  if (approvedCount < 9) cs.forEach((c, i) => (c.status = [0, 3, 6, 7].slice(0, approvedCount).includes(i) ? "approved" : "draft"));
  let c = normalize({ id: "abcd1234", objectiveType: type, accountIds: accounts.map((a) => a.id), concepts: cs, insights: [] } as unknown as Campaign);
  c = { ...c, results: { source: "sample", rows: sampleRows(c), enteredAt: "" } };
  const a = analyze(c);
  console.log(`\n${label}: ${a.insights.length} insight(s), ${a.gaps.length} gap(s)`);
  a.insights.forEach((i) => console.log("  INSIGHT", i.statement));
  a.gaps.forEach((g) => console.log("  GAP", g.message.slice(0, 110)));
  return a;
}
const four = run("organic, 4 deliverables", 4, "organic");
const nine = run("organic, 9 deliverables", 9, "organic");
const paid = run("paid, 9 deliverables", 9, "paid");
console.log("\nasset id example:", assetId(normalize({ id: "abcd1234", concepts } as unknown as Campaign), concepts[2].id));
const ok = four.insights.length === 0 && nine.insights.some((i) => i.dimension === "account") && paid.insights.length > 0;
console.log(ok ? "\nPASS" : "\nFAIL");
process.exit(ok ? 0 : 1);
