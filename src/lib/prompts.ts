import { seedData } from "@/data/seed";
import type { Brand } from "./types";
import { confidenceLabel, confidenceOf } from "./confidence";
import { ANGLES, FORMATS, objectiveTypeInfo, type Campaign, type Concept, type Finding, type Playbook } from "./schemas";
import type { Account, Trend } from "./types";

export const SYSTEM = `You are a senior creative strategist at a social media traffic studio.
You write short-form UGC-style video plans for brand accounts.

Hard rules:
- Use only the product facts and marketing claims given. Copy any claim you use into "claimsUsed" word for word.
- Never strengthen a marketing claim. Never invent ingredients, results, numbers, studies or timelines.
- Never write a prohibited claim or a word from the avoid list.
- Never write fake testimonials, fake reviews or fake personal results. A creator may show the routine and describe the product. They may not say it changed their skin.
- Never say a format is trending, viral or popular. You do not have live trend data.
- Put each required disclaimer in the on-screen text of the last scene.
- Write in the account's voice. Keep lines short and natural to say out loud.`;

export function brandContext(brand: Brand = seedData.brand) {
  const g = brand.guidelines;
  return `BRAND: ${brand.name}. ${brand.description}
PRODUCT: ${brand.product.name}. ${brand.product.description} Size ${brand.product.size}.
HOW TO USE: ${brand.product.usage.join(" ")}
PRODUCT FACTS:
${brand.claims.filter((c) => c.kind === "product_fact").map((c) => `- ${c.text}`).join("\n")}
MARKETING CLAIMS (brand wording, do not strengthen):
${brand.claims.filter((c) => c.kind === "marketing_claim").map((c) => `- ${c.text}`).join("\n")}
PROHIBITED CLAIMS: ${g.prohibitedClaims.join("; ")}
AVOID WORDS: ${g.avoidWords.join(", ")}
REQUIRED DISCLAIMERS: ${g.disclaimers.join(" ")}
RESTRICTIONS: ${g.restrictions.join(" ")}
BRAND TONE: ${brand.tone}`;
}

export function campaignContext(c: Campaign) {
  const o = objectiveTypeInfo[c.objectiveType];
  const lines = [
    `CAMPAIGN: ${c.name}`,
    `Type: ${o.label}. Success means ${o.goal}`,
    `Rules for ${o.label.toLowerCase()} content: ${o.rubric.join("; ")}.`,
    `Objective: ${c.objective}`,
    c.keyMessage && `Key message: ${c.keyMessage}`,
    `Target market: ${c.targetMarket}`,
    c.learnings.length && "LEARNINGS FROM THE LAST ROUND (use them, do not quote them):",
    ...c.learnings.map((l) => `- ${l}`),
  ];
  return lines.filter(Boolean).join("\n");
}

export function accountContext(a: Account) {
  return `ACCOUNT: ${a.name} (${a.platform})
Audience: ${a.audience}
Pain points: ${a.painPoints.join(", ")}
Interests: ${a.interests.join(", ")}
Editorial identity: ${a.editorialIdentity}
Voice: ${a.voice}
Topics: ${a.pillars.join(", ")}
Formats it uses: ${a.formats.join(", ")}
Look: ${a.visualDirection}
Restrictions: ${a.restrictions.join(", ")}
Past hooks (do not repeat or closely copy):
${a.history.map((h) => `- "${h.hook}" (${h.format})`).join("\n")}`;
}

export function trendContext(t: Trend) {
  const a = t.analysis;
  return `TREND id="${t.id}": ${t.title}
Evidence level: ${confidenceLabel[confidenceOf(t)]} (${t.evidence.length} evidence items)
Description: ${t.description}
Hook: ${a.hookPattern}
Story: ${a.narrative}
Format: ${a.format}
Visuals: ${a.visualDirection}
Editing: ${a.editingStyle}
Feeling: ${a.emotionalTrigger}
Product fit: ${a.productIntegration}`;
}

export function playbookPrompt(c: Campaign, account: Account, trends: Trend[], others: Playbook[], brand?: Brand) {
  return `${brandContext(brand)}

${campaignContext(c)}

${accountContext(account)}

SELECTED TRENDS:
${trends.map(trendContext).join("\n\n")}

${others.length ? `PLAYBOOKS ALREADY MADE FOR OTHER ACCOUNTS (take a clearly different angle and hook):\n${others.map((p) => `- ${p.accountId}: angle "${p.angle}", hook "${p.hookDirection}", trend ${p.trendId}`).join("\n")}` : ""}

Task: Pick the one selected trend that fits this account best and write a creative playbook for it.
- "trendId" must be one of: ${trends.map((t) => `"${t.id}"`).join(", ")}.
- "fitReason" explains in 1 to 2 sentences why this trend suits this account's audience and identity.
- "rejectedTrends" lists each other selected trend with a one-sentence reason it fits less well.
- "format" must be one of: ${FORMATS.join(", ")}.
- "structure" is 4 or 5 short beats.
- "safetyNotes" lists brand rules this playbook must watch.`;
}

export function conceptsPrompt(c: Campaign, account: Account, p: Playbook, trend: Trend, otherHooks: string[], brand?: Brand) {
  return `${brandContext(brand)}

${campaignContext(c)}

${accountContext(account)}

${trendContext(trend)}

APPROVED PLAYBOOK:
Angle: ${p.angle}
Audience insight: ${p.audienceInsight}
Hook direction: ${p.hookDirection}
Structure: ${p.structure.join(" > ")}
Format: ${p.format}
Visuals: ${p.visualDirection}
Product integration: ${p.productIntegration}
CTA: ${p.cta}

${otherHooks.length ? `HOOKS ALREADY USED BY OTHER ACCOUNTS (do not overlap):\n${otherHooks.map((h) => `- "${h}"`).join("\n")}` : ""}

Task: Write 3 video concepts for this account based on the playbook.
- Each concept must use a different "angleType" from: ${ANGLES.join(", ")}.
- The three must differ in story, not just wording. Do not rewrite one script three times.
- "format" must be one of: ${FORMATS.join(", ")}.
- Each concept has 5 scenes: opening hook, context, product moment, demonstration, closing CTA.
- "differentiation" says in one sentence how this concept differs from the other two.`;
}

export function regeneratePrompt(c: Campaign, account: Account, trend: Trend, current: Concept, siblings: Concept[], instruction?: string, brand?: Brand) {
  return `${brandContext(brand)}

${campaignContext(c)}

${accountContext(account)}

${trendContext(trend)}

CURRENT CONCEPT TO REPLACE:
${JSON.stringify({ title: current.title, angleType: current.angleType, hook: current.hook, angle: current.angle })}

OTHER CONCEPTS IN THE CAMPAIGN (stay clearly different from all of them):
${siblings.map((s) => `- [${s.accountId}] ${s.angleType}: "${s.hook}"`).join("\n")}

${instruction ? `REASON FOR THE CHANGE:\n${instruction}\n` : ""}
Task: Write one new concept for this account that replaces the current one.
- Use an "angleType" from ${ANGLES.join(", ")} that this account's other concepts do not use.
- "format" must be one of: ${FORMATS.join(", ")}.
- 5 scenes. Follow every hard rule.`;
}

export function findingInstruction(f: Finding) {
  return `${f.message} ${f.suggestion}`;
}

export function trendAnalysisPrompt(input: { title: string; platform: string; description: string }) {
  return `A strategist watched a short-form video and described it. You cannot see the video. Work only from the description.

Title: ${input.title}
Platform: ${input.platform}
Description: ${input.description}

Task: Extract the reusable creative playbook behind this video, not a summary of it.
- Describe the hook pattern, story structure, format, visuals, editing, emotional trigger, how a product is worked in, and which kinds of brands could adapt it.
- Do not guess views, likes or popularity.
- If the description leaves something unclear, say "Not clear from the description".`;
}
