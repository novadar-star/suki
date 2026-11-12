// Renders one concept to MP4.
// Usage: npm run render -- <campaignId> <conceptId>   (the app must be running on port 3000, or set SUKI_URL)
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { accounts } from "../src/data/accounts";

const [campaignId, conceptId] = process.argv.slice(2);
if (!campaignId || !conceptId) {
  console.error("Usage: npm run render -- <campaignId> <conceptId>");
  process.exit(1);
}
const base = process.env.SUKI_URL ?? process.env.MYRTIS_URL ?? "http://localhost:3000";
const browserExecutable = process.env.CHROME_PATH || null;

(async () => {
  const res = await fetch(`${base}/api/campaigns/${campaignId}`);
  if (!res.ok) throw new Error(`Could not load the campaign (${res.status}). Is the app running at ${base}?`);
  const campaign = await res.json();
  const concept = campaign.concepts.find((c: { id: string }) => c.id === conceptId);
  if (!concept) throw new Error("Concept not found in that campaign.");
  const account = accounts.find((a) => a.id === concept.accountId)!;
  const inputProps = { accountName: account.name, color: account.color, scenes: concept.scenes };

  const serveUrl = await bundle({ entryPoint: path.resolve("src/video/index.ts"), publicDir: path.resolve("public") });
  const composition = await selectComposition({ serveUrl, id: "Ugc", inputProps, browserExecutable });
  const out = path.resolve("out", `${account.id}-${concept.id}.mp4`);
  await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: out, inputProps, browserExecutable });
  console.log(`Saved ${out}`);
})().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
