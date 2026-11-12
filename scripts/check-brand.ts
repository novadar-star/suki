// Checks that the portfolio rules follow an edited Brand Brain, not only the sample brand.
// Run: npx tsx scripts/check-brand.ts
import { accounts } from "@/data/accounts";
import { brand as sample } from "@/data/brand";
import { runChecks } from "@/lib/checks";
import type { Concept } from "@/lib/schemas";
import type { Brand } from "@/lib/types";

// A made-up brand with awkward characters, to prove user-entered text is matched safely.
const brand: Brand = {
  ...sample,
  name: "Acme (Test)",
  product: { ...sample.product, name: "C++ Glow Balm" },
  claims: [{ id: "F-01", text: "50 g tin", kind: "product_fact", source: "test" }],
  guidelines: { ...sample.guidelines, prohibitedClaims: ["Heals scars"], avoidWords: ["best (ever)"], disclaimers: ["For external use only."] },
};

const concept = (over: Partial<Concept>): Concept =>
  ({
    id: "k1",
    accountId: accounts[0].id,
    trendId: "grwm",
    status: "draft",
    origin: "demo",
    title: "Test concept",
    angleType: "routine",
    angle: "Morning routine",
    hook: "A calm start",
    format: "POV",
    cta: "Save this",
    claimsUsed: ["50 g tin"],
    differentiation: "",
    scenes: [
      { visual: "Desk", voiceover: "Morning.", onScreen: "" },
      { visual: "Tin opened", voiceover: "A small amount.", onScreen: "For external use only." },
    ],
    ...over,
  }) as Concept;

const kinds = (c: Concept, type: "organic" | "paid" = "organic") => runChecks([c], type, { brand, accounts }).findings.map((f) => f.kind);
const expect = (label: string, got: string[], want: string[]) => {
  const ok = want.every((w) => got.includes(w)) && got.length === want.length;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}: ${got.join(", ") || "no findings"}`);
  if (!ok) process.exitCode = 1;
};

expect("clean concept", kinds(concept({})), []);
expect("new prohibited claim is a phrase match", kinds(concept({ hook: "This balm heals   scars overnight" })), ["prohibited_claim"]);
expect("avoid word with brackets", kinds(concept({ hook: "The best (ever) balm" })), ["avoid_word"]);
expect("claim not in the edited brand", kinds(concept({ claimsUsed: ["Lightweight, fast-absorbing formula"] })), ["unsupported_claim"]);
expect("edited disclaimer is required", kinds(concept({ scenes: [{ visual: "Desk", voiceover: "Morning.", onScreen: "" }] })), ["missing_disclaimer"]);
expect("paid: product named by its new name", kinds(concept({ cta: "Tap the link", scenes: [{ visual: "C++ Glow Balm on the desk", voiceover: "", onScreen: "For external use only." }] }), "paid"), []);
expect("paid: old product words no longer count", kinds(concept({ cta: "Tap the link", scenes: [{ visual: "Hyaluronic serum on the desk", voiceover: "", onScreen: "For external use only." }] }), "paid"), ["paid_late_product"]);

console.log(process.exitCode ? "\nFAIL" : "\nPASS");
