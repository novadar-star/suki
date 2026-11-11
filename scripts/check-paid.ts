// Checks that demo concepts pass the paid rules after adaptForPaid, and fail them before.
import { accounts } from "@/data/accounts";
import { trends } from "@/data/trends";
import { adaptForPaid, demoConcepts } from "@/lib/demo";
import { runChecks } from "@/lib/checks";
import type { Concept } from "@/lib/schemas";

const grwm = trends.find((t) => t.id === "grwm")!;
const make = (paid: boolean): Concept[] =>
  accounts.flatMap((a) =>
    demoConcepts(a, grwm).map((c, i) => ({ ...(paid ? adaptForPaid(c) : c), id: `${a.id}-${i}`, accountId: a.id, trendId: "grwm", status: "draft" as const, origin: "demo" as const })),
  );
const paidKinds = (cs: Concept[]) => runChecks(cs, "paid").findings.filter((f) => f.kind.startsWith("paid_")).length;
console.log("organic samples judged as paid:", paidKinds(make(false)), "paid findings");
console.log("paid-adapted samples:", paidKinds(make(true)), "paid findings");
