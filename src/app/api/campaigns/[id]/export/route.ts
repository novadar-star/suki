import { accounts } from "@/data/accounts";
import { brand } from "@/data/brand";
import { getCampaign, getTrends } from "@/lib/repo";
import { angleLabel, objectiveTypeInfo } from "@/lib/schemas";
import { notFound } from "@/lib/http";
import { assetId } from "@/lib/campaign";

type Ctx = { params: Promise<{ id: string }> };

// Approved concepts as a Markdown file. Falls back to every concept that is not rejected.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const c = await getCampaign(id);
  if (!c) return notFound("Campaign");
  const trends = await getTrends();
  const approved = c.concepts.filter((x) => x.status === "approved");
  const list = approved.length ? approved : c.concepts.filter((x) => x.status !== "rejected");

  const lines = [
    `# ${c.name}`,
    "",
    `${brand.name}, ${brand.product.name}`,
    `Type: ${objectiveTypeInfo[c.objectiveType].label}. ${objectiveTypeInfo[c.objectiveType].goal}`,
    `Brief: ${c.objective}`,
    ...(c.keyMessage ? [`Key message: ${c.keyMessage}`] : []),
    ...(c.deadline ? [`Deadline: ${c.deadline}`] : []),
    c.signedOffAt ? `Signed off ${new Date(c.signedOffAt).toLocaleString("en-US", { dateStyle: "medium" })}.` : "Not signed off yet.",
    `Exported ${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}. ${approved.length ? "Approved concepts only." : "No concepts approved yet, so this includes every draft."}`,
    "",
    "Scripts are AI-assisted plans. Videos made from them must be labeled as AI-generated where required.",
  ];
  for (const a of accounts.filter((x) => list.some((k) => k.accountId === x.id))) {
    lines.push("", `## ${a.name}`);
    for (const k of list.filter((x) => x.accountId === a.id)) {
      const t = trends.find((x) => x.id === k.trendId);
      lines.push(
        "",
        `### ${k.title}`,
        "",
        `- Asset ID: ${assetId(c, k.id)} (tag this on the published post or ad so results can be matched)`,
        `- Hook: "${k.hook}"`,
        `- Angle: ${angleLabel[k.angleType]}. ${k.angle}`,
        `- Format: ${k.format}`,
        `- Trend: ${t?.title ?? k.trendId}`,
        `- Claims used: ${k.claimsUsed.map((t) => `${brand.claims.find((x) => x.text.toLowerCase() === t.toLowerCase())?.id ?? "NOT IN BRAND BRAIN"} "${t}"`).join("; ") || "None"}`,
        "",
        "| Scene | Visual | Voiceover | On-screen text |",
        "|---|---|---|---|",
        ...k.scenes.map((s, i) => `| ${i + 1} | ${s.visual} | ${s.voiceover || "None"} | ${s.onScreen || "None"} |`.replace(/\n/g, " ")),
        "",
        `CTA: ${k.cta}`,
      );
    }
  }
  const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "campaign";
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-scripts.md"`,
    },
  });
}
