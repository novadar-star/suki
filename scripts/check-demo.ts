import { accounts } from "@/data/accounts";
import { trends } from "@/data/trends";
import { demoConcepts, demoRevision } from "@/lib/demo";
import { runChecks } from "@/lib/checks";
import type { Concept } from "@/lib/schemas";

const grwm = trends.find((t) => t.id === "grwm")!;
let concepts: Concept[] = accounts.flatMap((a) =>
  demoConcepts(a, grwm).map((c, i) => ({ ...c, id: `${a.id}-${i}`, accountId: a.id, trendId: "grwm", status: "draft" as const, origin: "demo" as const })),
);
const r = runChecks(concepts);
console.log("BEFORE:", r.findings.length);
for (const f of r.findings) console.log(`  [${f.severity}] ${f.kind}: ${f.message}`);
// apply revisions for every concept that has a finding
const flagged = new Set(r.findings.flatMap((f) => f.conceptIds.slice(-1)));
concepts = concepts.map((c) => {
  if (!flagged.has(c.id)) return c;
  const a = accounts.find((x) => x.id === c.accountId)!;
  const used = concepts.filter((x) => x.accountId === c.accountId && x.id !== c.id).map((x) => x.angleType);
  return { ...c, ...demoRevision(a, grwm, c.title, used) };
});
const r2 = runChecks(concepts);
console.log("AFTER:", r2.findings.length);
for (const f of r2.findings) console.log(`  [${f.severity}] ${f.kind}: ${f.message}`);
