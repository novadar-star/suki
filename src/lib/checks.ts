import { seedData } from "@/data/seed";
import type { Brand, StudioData } from "./types";
import { angleLabel, type Concept, type Finding, type ObjectiveType, type Report } from "./schemas";

// Every check here is plain code. No AI decides a finding.

const STOP = new Set(
  "a an the and or but to of in on for with my your our this that it its is are was be i you me we at as so just all one this these those what how why do does from by up out".split(" "),
);

// Meaningful words, keyed by a rough word stem so "fits" matches "fit".
export function words(text: string) {
  const out = new Map<string, string>();
  for (const w of text.toLowerCase().replace(/[^a-z0-9'\s]/g, " ").replace(/'/g, "").split(/\s+/)) {
    if (w.length > 2 && !STOP.has(w)) out.set(w.replace(/(ing|es|s)$/, ""), w);
  }
  return out;
}

// Share of meaningful words two hooks have in common (0 to 1).
export function overlap(a: string, b: string) {
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return { score: 0, shared: [] as string[], sharedB: [] as string[] };
  const keys = [...A.keys()].filter((k) => B.has(k));
  // The same word can be spelled differently in each hook ("fits" and "fit"), so keep both spellings.
  return { score: keys.length / Math.min(A.size, B.size), shared: keys.map((k) => A.get(k)!), sharedB: keys.map((k) => B.get(k)!) };
}

// A short fingerprint of the brand rules a check ran against. If the Brand Brain changes later, the review can say so.
export function brandStamp(brand: Brand) {
  const text = JSON.stringify([brand.claims.map((c) => [c.id, c.text]), brand.guidelines]);
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

const PROHIBITED: { claim: string; pattern: RegExp }[] = [
  { claim: "Clinically proven", pattern: /clinically (proven|tested)/i },
  { claim: "Reduces wrinkles or fine lines", pattern: /(wrinkle|fine lines?)/i },
  { claim: "Boosts collagen", pattern: /collagen/i },
  { claim: "Treats or cures acne", pattern: /\b(acne|breakouts?|pimples?)\b/i },
  { claim: "Results in a set number of days", pattern: /\b(in|within|after) \d+ (days?|weeks?)\b/i },
  { claim: "Dermatologist recommended", pattern: /dermatologist/i },
];

// Claims with a hand-written pattern use it. Any other prohibited claim is matched as a plain phrase.
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function prohibitedPatterns(claims: string[]) {
  return claims.map((claim) => PROHIBITED.find((p) => p.claim === claim) ?? { claim, pattern: new RegExp(escapeRe(claim.trim()).replace(/\s+/g, "\\s+"), "i") });
}

const HOOK_LIMIT = 0.6; // any two hooks
const CROSS_LIMIT = 0.5; // same angle in two accounts
const HISTORY_LIMIT = 0.6; // hook vs the account's past hooks

const conceptText = (c: Concept) =>
  [c.hook, c.angle, c.cta, ...c.scenes.flatMap((s) => [s.voiceover, s.onScreen])].join(" \n ");

const lines = (c: Concept) => [c.hook, c.angle, c.cta, ...c.scenes.flatMap((s) => [s.voiceover, s.onScreen])].filter(Boolean);

// The first line that breaks a rule, so the review can highlight it.
function locate(c: Concept, pattern: RegExp) {
  for (const text of lines(c)) {
    const m = text.match(pattern);
    if (m) return { text, matches: [m[0]] };
  }
  return undefined;
}

export const ruleId = (prefix: "P" | "W" | "D", i: number) => `${prefix}-${String(i + 1).padStart(2, "0")}`;

// Words that show the product is on screen or named.
const PRODUCT = /\b(serum|bottle|dropper|lust minerals|4d|hyaluronic)\b/i;
const ACTION_CTA = /\b(shop|buy|get yours|order|tap|link|try it|add to cart)\b/i;
const HARD_SELL = /\b(buy now|shop now|order now|discount|sale|% off|limited time|use code)\b/i;

// Pass the saved brand and accounts. Without them the seed data is used (the check scripts rely on that).
export function runChecks(concepts: Concept[], objectiveType: ObjectiveType = "organic", data: StudioData = seedData): Report {
  const { brand, accounts } = data;
  const name = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;
  const live = concepts.filter((c) => c.status !== "rejected");
  const findings: Finding[] = [];
  const add = (f: Omit<Finding, "id">) => findings.push({ ...f, id: `${f.kind}:${f.conceptIds.join("+")}` });
  const approvedClaims = new Set(brand.claims.map((c) => c.text.toLowerCase()));

  // Within each account
  for (const accountId of new Set(live.map((c) => c.accountId))) {
    const group = live.filter((c) => c.accountId === accountId);
    for (let i = 0; i < group.length; i++)
      for (let j = i + 1; j < group.length; j++) {
        const [a, b] = [group[i], group[j]];
        if (a.angleType === b.angleType)
          add({
            severity: "fix",
            kind: "same_angle",
          rule: "QC-05 repetition: one angle used twice on the same account",
            conceptIds: [a.id, b.id],
            message: `"${a.title}" and "${b.title}" both use the ${angleLabel[a.angleType]} angle on ${name(accountId)}.`,
            suggestion: "Give one of them a different reason to care.",
          });
        else if (a.format === b.format)
          add({
            severity: "check",
            kind: "same_format",
          rule: "QC-05 repetition: one format used twice on the same account",
            conceptIds: [a.id, b.id],
            message: `"${a.title}" and "${b.title}" both use the ${a.format} format on ${name(accountId)}.`,
            suggestion: "Consider a different video structure for one of them.",
          });
    }

    // Against the account's past hooks
    const account = accounts.find((a) => a.id === accountId);
    for (const c of group)
      for (const h of account?.history ?? []) {
        const o = overlap(c.hook, h.hook);
        if (o.score >= HISTORY_LIMIT)
          add({
            severity: "fix",
            kind: "history_repeat",
          rule: `QC-05 repetition: hook overlap of ${HISTORY_LIMIT} or more with a past hook`,
          excerpt: { text: c.hook, matches: o.shared },
            pair: [
              { conceptId: c.id, text: c.hook, matches: o.shared },
              { label: `Past hook, ${new Date(h.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, text: h.hook, matches: o.sharedB },
            ],
            conceptIds: [c.id],
            message: `"${c.hook}" repeats a past ${name(accountId)} hook: "${h.hook}" (shared words: ${o.shared.join(", ")}).`,
            suggestion: "Write a new opening so followers don't see the same video twice.",
          });
      }
  }

  // Across accounts
  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++) {
      const [a, b] = [live[i], live[j]];
      if (a.accountId === b.accountId) continue;
      const o = overlap(a.hook, b.hook);
      if (a.angleType === b.angleType && o.score >= CROSS_LIMIT)
        add({
          severity: "fix",
          kind: "cross_overlap",
          rule: `QC-05 repetition: same angle and hook overlap of ${CROSS_LIMIT} or more across accounts`,
          excerpt: { text: b.hook, matches: o.shared },
          pair: [
            { conceptId: a.id, text: a.hook, matches: o.shared },
            { conceptId: b.id, text: b.hook, matches: o.sharedB },
          ],
          conceptIds: [a.id, b.id],
          message: `${name(a.accountId)} and ${name(b.accountId)} both use a ${angleLabel[a.angleType]} angle with near-identical hooks (shared words: ${o.shared.join(", ")}).`,
          suggestion: "Make one of them specific to its own audience, for example a checklist, comparison or problem and solution.",
        });
      else if (o.score >= HOOK_LIMIT)
        add({
          severity: "check",
          kind: "similar_hooks",
          rule: `QC-05 repetition: hook overlap of ${HOOK_LIMIT} or more`,
          excerpt: { text: b.hook, matches: o.shared },
          pair: [
            { conceptId: a.id, text: a.hook, matches: o.shared },
            { conceptId: b.id, text: b.hook, matches: o.sharedB },
          ],
          conceptIds: [a.id, b.id],
          message: `"${a.hook}" and "${b.hook}" open in a very similar way (shared words: ${o.shared.join(", ")}).`,
          suggestion: "Change one opening line.",
        });
    }

  // Brand safety, per concept
  for (const c of live) {
    const text = conceptText(c);
    for (const p of prohibitedPatterns(brand.guidelines.prohibitedClaims)) {
      const m = text.match(p.pattern);
      if (m)
        add({
          severity: "fix",
          kind: "prohibited_claim",
          rule: `Brand Brain ${ruleId("P", brand.guidelines.prohibitedClaims.indexOf(p.claim))}: prohibited claim "${p.claim}"`,
          excerpt: locate(c, p.pattern),
          conceptIds: [c.id],
          message: `"${c.title}" says "${m[0]}". This falls under the prohibited claim "${p.claim}".`,
          suggestion: "Remove it and use a product fact or approved marketing claim instead.",
        });
    }
    for (const w of brand.guidelines.avoidWords) {
      if (new RegExp(`\\b${w}\\b`, "i").test(text))
        add({
          severity: "fix",
          kind: "avoid_word",
          rule: `Brand Brain ${ruleId("W", brand.guidelines.avoidWords.indexOf(w))}: words to avoid`,
          excerpt: locate(c, new RegExp(`\\b${w}\\b`, "i")),
          conceptIds: [c.id],
          message: `"${c.title}" uses "${w}", which is on the brand's avoid list.`,
          suggestion: "Replace it with the brand's own wording.",
        });
    }
    for (const claim of c.claimsUsed)
      if (!approvedClaims.has(claim.toLowerCase()))
        add({
          severity: "fix",
          kind: "unsupported_claim",
          rule: "Brand Brain: claims must match an approved claim ID (F-01 to F-05, C-01 to C-04)",
          excerpt: { text: claim, matches: [claim] },
          conceptIds: [c.id],
          message: `"${c.title}" relies on "${claim}", which is not a product fact or approved claim.`,
          suggestion: "Use only claims from the Brand Brain.",
        });
    for (const d of brand.guidelines.disclaimers)
      if (!c.scenes.some((s) => s.onScreen.toLowerCase().includes(d.toLowerCase().replace(/\.$/, ""))))
        add({
          severity: "fix",
          kind: "missing_disclaimer",
          rule: `Brand Brain ${ruleId("D", brand.guidelines.disclaimers.indexOf(d))}: required disclaimer`,
          excerpt: { text: c.scenes[c.scenes.length - 1].onScreen || "(no on-screen text)", matches: [] },
          conceptIds: [c.id],
          message: `"${c.title}" is missing the disclaimer "${d}".`,
          suggestion: "Add it to the on-screen text of the last scene.",
        });
  }

  // Organic and paid are judged differently.
  for (const c of live) {
    if (objectiveType === "paid") {
      const early = c.scenes.slice(0, 2).map((s) => `${s.visual} ${s.voiceover} ${s.onScreen}`).join(" ");
      if (!PRODUCT.test(early))
        add({
          severity: "fix",
          kind: "paid_late_product",
          rule: "Paid track (QC-03): product in the first two scenes",
          excerpt: { text: c.scenes[0].visual, matches: [] },
          conceptIds: [c.id],
          message: `"${c.title}" does not show or name the product in the first two scenes. Paid viewers decide in about two seconds.`,
          suggestion: "Put the serum on screen in scene 1 or 2.",
        });
      if (!ACTION_CTA.test(c.cta))
        add({
          severity: "fix",
          kind: "paid_weak_cta",
          rule: "Paid track (QC-03): one clear action in the CTA",
          excerpt: { text: c.cta, matches: [] },
          conceptIds: [c.id],
          message: `"${c.title}" ends with "${c.cta}". A paid ad needs one clear action.`,
          suggestion: "End with a direct action, for example \"Tap the link to try it\".",
        });
    } else {
      const m = `${c.hook} ${c.cta}`.match(HARD_SELL);
      if (m)
        add({
          severity: "check",
          kind: "organic_hard_sell",
          rule: "Organic track (QC-03): soft CTA, not an ad",
          excerpt: locate(c, HARD_SELL),
          conceptIds: [c.id],
          message: `"${c.title}" says "${m[0]}". Organic posts that read like ads tend to lose viewers.`,
          suggestion: "Use a soft CTA such as save, share or comment.",
        });
    }
  }

  const count = (key: "angleType" | "format") =>
    live.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c[key]]: (acc[c[key]] ?? 0) + 1 }), {});

  return {
    createdAt: new Date().toISOString(),
    brandStamp: brandStamp(brand),
    conceptCount: live.length,
    accountCount: new Set(live.map((c) => c.accountId)).size,
    angleCounts: count("angleType"),
    formatCounts: count("format"),
    findings: findings.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "fix" ? -1 : 1)),
  };
}
